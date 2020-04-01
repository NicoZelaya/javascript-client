import SSEClient from '../SSEClient';
import authenticate from '../AuthClient';
import NotificationProcessorFactory from '../NotificationProcessor';
import logFactory from '../../utils/logger';
const log = logFactory('splitio-pushmanager');
import splitSyncFactory from '../SplitSync';
import segmentSyncFactory from '../SegmentSync';
import checkPushSupport from './checkPushSupport';
import Backoff from '../../utils/backoff';
import { hashUserKey } from '../../utils/jwt/hashUserKey';
import EventEmitter from 'events';

const SECONDS_BEFORE_EXPIRATION = 600;
const Event = {
  PUSH_CONNECT: 'PUSH_CONNECT',
  PUSH_DISCONNECT: 'PUSH_DISCONNECT',
};

/**
 * Factory of the push mode manager.
 *
 * @param {*} feedbackLoop callback functions for streaming up or down.
 *  interface feedbackLoop {
 *    onPushConnect: () => void,
 *    onPushDisconnect: () => void,
 *  }
 * @param {*} context context of main client.
 * @param {*} producer producer of main client (/produce/node or /producer/browser/full).
 * @param {*} clients object with client information to handle mySegments synchronization. undefined for node.
 *  interface clients {
 *    userKeys: { [userKey: string]: string },
 *    userKeyHashes: { [userKeyHash: string]: string },
 *    clients: { [userKey: string]: Object },
 *  }
 */
export default function PushManagerFactory(context, clientContexts /* undefined for node */) {

  const pushEmitter = new EventEmitter();
  pushEmitter.Event = Event;

  // No return a PushManager if PUSH mode is not supported.
  if (!checkPushSupport(log))
    return;

  const settings = context.get(context.constants.SETTINGS);
  const storage = context.get(context.constants.STORAGE);
  const sseClient = SSEClient.getInstance(settings);

  /** PushManager functions, according to the spec */

  const authRetryBackoffBase = settings.authRetryBackoffBase;
  const reauthBackoff = new Backoff(connectPush, authRetryBackoffBase);

  let timeoutID = 0;
  function scheduleNextTokenRefresh(issuedAt, expirationTime) {
    // Set token refresh 10 minutes before expirationTime
    const delayInSeconds = expirationTime - issuedAt - SECONDS_BEFORE_EXPIRATION;

    // @TODO review if there is some scenario where clearTimeout must be explicitly called
    // cancel a scheduled reconnect if previously established, since `scheduleReconnect` is invoked on different scenarios:
    // - initial connect
    // - scheduled connects for refresh token, auth errors and sse errors.
    if (timeoutID) clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      connectPush();
    }, delayInSeconds * 1000);
  }

  function connectPush() {
    authenticate(settings, clientContexts ? Object.keys(clientContexts) : undefined).then(
      function (authData) {
        reauthBackoff.reset(); // restart attempts counter for reauth due to HTTP/network errors
        if (!authData.pushEnabled) {
          log.error('Streaming is not enabled for the organization. Switching to polling mode.');
          pushEmitter.emit(Event.PUSH_DISCONNECT); // there is no need to close sseClient (it is not open on this scenario)
          return;
        }

        // Connect to SSE and schedule refresh token
        const decodedToken = authData.decodedToken;
        sseClient.open(authData);
        scheduleNextTokenRefresh(decodedToken.iat, decodedToken.exp);
      }
    ).catch(
      function (error) {

        sseClient.close();
        pushEmitter.emit(Event.PUSH_DISCONNECT); // no harm if `PUSH_DISCONNECT` was already notified

        if (error.statusCode) {
          switch (error.statusCode) {
            case 401: // invalid api key
              log.error(error.message);
              return;
          }
        }
        // Branch for other HTTP and network errors
        log.error(error);
        reauthBackoff.scheduleCall();
      }
    );
  }

  /** Functions related to synchronization according to the spec (Queues and Workers) */
  const producer = context.get(context.constants.PRODUCER, true);
  const splitSync = splitSyncFactory(storage.splits, producer);

  const segmentSync = clientContexts || // map of user keys to contexts, used by NotificationProcessor to get MySegmentSync in browser
    segmentSyncFactory(storage.segments, producer); // node segmentSync

  /** initialization */
  const userKeyHashes = {};

  const notificationProcessor = NotificationProcessorFactory(
    sseClient,
    pushEmitter,
    // SyncWorkers
    splitSync,
    segmentSync,
    settings.streamingReconnectBackoffBase,
    userKeyHashes);
  sseClient.setEventHandler(notificationProcessor);

  return Object.assign(
    // Expose Event Emitter functionality and Event constants
    Object.create(pushEmitter),
    {

      // Expose functionality for starting and stoping push mode:

      stop() { // same producer passed to NodePushManagerFactory
        // remove listener, so that when connection is closed, polling mode is not started.
        sseClient.setEventHandler(undefined);
        sseClient.close();
      },

      start: connectPush,

      // used in browser
      addClient(userKey, context) {
        const hash = hashUserKey(userKey);
        userKeyHashes[hash] = userKey;
        const storage = context.get(context.constants.STORAGE);
        const producer = context.get(context.constants.PRODUCER);
        context.put(context.constants.MY_SEGMENTS_CHANGE_WORKER, segmentSyncFactory(storage.segments, producer));
      },
      removeClient(userKey) {
        const hash = hashUserKey(userKey);
        delete userKeyHashes[hash];
      }
    }
  );
}