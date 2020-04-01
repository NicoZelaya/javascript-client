import PushManagerFactory from './PushManager';
import FullProducerFactory from '../producer';

// Not do initial syncAll in producers
/**
 * Factory of SyncManager for node
 *
 * @param context main client context
 */
export default function NodeSyncManagerFactory(context) {

  const producer = FullProducerFactory(context);

  function startPolling() {
    if (!producer.isRunning())
      producer.start();
  }

  function stopPollingAndSyncAll() {
    // if polling, stop
    if (producer.isRunning())
      producer.stop();
    syncAll();
  }

  function syncAll() {
    // fetch splits and segments. There is no need to catch this promise (it is handled by `SplitChangesUpdater`)
    producer.callSplitsUpdater().then(() => {
      producer.callSegmentsUpdater();
    });
  }

  let pushManager;

  const settings = context.get(context.constants.SETTINGS);
  if (settings.streamingEnabled)
    pushManager = PushManagerFactory(context);

  return {
    start() {
      // start syncing
      if (pushManager) {
        syncAll();
        pushManager.on(pushManager.Event.PUSH_CONNECT, stopPollingAndSyncAll);
        pushManager.on(pushManager.Event.PUSH_DISCONNECT, startPolling);
        pushManager.start();
      } else {
        producer.start();
      }
    },
    stop() {
      // stop syncing
      if (pushManager)
        pushManager.stop();

      if (producer.isRunning())
        producer.stop();
    }
  };
}