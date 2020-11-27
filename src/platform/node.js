import { splitApiFactory } from '@splitsoftware/js-commons/cjs/services/splitApi';
import splitsParserFromFile from '@splitsoftware/js-commons/cjs/sync/offline/splitsParser/splitsParserFromFile';
import { syncManagerOfflineFactory } from '@splitsoftware/js-commons/cjs/sync/syncManagerOffline';
import { syncManagerOnlineFactory } from '@splitsoftware/js-commons/cjs/sync/syncManagerOnline';
import pushManagerFactory from '@splitsoftware/js-commons/cjs/sync/pushManager/pushManager';
import pollingManagerServerSideFactory from '@splitsoftware/js-commons/cjs/sync/polling/pollingManagerServerSide';
import { InRedisStorageFactory } from '@splitsoftware/js-commons/cjs/storages/inRedis/index';
import { InMemoryStorageFactory } from '@splitsoftware/js-commons/cjs/storages/inMemory/InMemoryStorage';
import { sdkManagerFactory } from '@splitsoftware/js-commons/cjs/sdkManager/index';
import { sdkClientMethodFactory } from '@splitsoftware/js-commons/cjs/sdkClient/sdkClientMethod';
import NodeSignalListener from '@splitsoftware/js-commons/cjs/listeners/node';
import { serverSideObserverFactory } from '@splitsoftware/js-commons/cjs/trackers/impressionObserver/serverSideObserver';

import getFetch from '../services/getFetch';
import getEventSource from '../services/getEventSource';
import getOptions from '../services/request/options';
import { shouldAddPt, shouldBeOptimized } from './commons';

const nodePlatform = {
  getOptions,
  getFetch,
  getEventSource,
};

const syncManagerOfflineNodeFactory = syncManagerOfflineFactory(splitsParserFromFile);
const syncManagerOnlineSSFactory = syncManagerOnlineFactory(pollingManagerServerSideFactory, pushManagerFactory);

/**
 *
 * @param {import("@splitsoftware/js-commons/types/types").ISettings} settings
 */
export function getModules(settings) {
  return {
    settings,
    // @TODO add type to ISettings?
    filterQueryString: settings.sync.__splitFiltersValidation.queryString,


    platform: nodePlatform,
    storageFactory: settings.storage.type === 'REDIS' ?
      InRedisStorageFactory.bind(null, {
        prefix: settings.storage.prefix,
        metadata: {
          version: settings.version,
          ip: settings.runtime.ip,
          hostname: settings.runtime.hostname
        },
        options: settings.storage.options
      }) :
      InMemoryStorageFactory.bind(null, {
        eventsQueueSize: settings.scheduler.eventsQueueSize,
        debugImpressionsMode: shouldBeOptimized(settings) ? false : true,
        // @TODO add dataloader
        dataLoader: undefined,
      }),

    splitApiFactory: settings.mode === 'localhost' ? undefined : splitApiFactory,
    syncManagerFactory: settings.storage.type === 'REDIS' ? undefined : settings.mode === 'localhost' ? syncManagerOfflineNodeFactory : syncManagerOnlineSSFactory,

    sdkManagerFactory,
    sdkClientMethodFactory: sdkClientMethodFactory,
    SignalListener: settings.mode === 'localhost' ? undefined : NodeSignalListener,
    impressionListener: settings.impressionListener,

    impressionsObserverFactory: shouldAddPt(settings) ? serverSideObserverFactory : undefined,
  };
}
