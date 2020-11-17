import { splitApiFactory } from '@splitsoftware/js-commons/cjs/services/splitApi';
import splitsParserFromFile from '@splitsoftware/js-commons/cjs/sync/offline/splitsParser/splitsParserFromFile';
import { syncManagerFactoryOffline } from '@splitsoftware/js-commons/cjs/sync/syncManagerFactoryOffline';
import { syncManagerFactoryOnline } from '@splitsoftware/js-commons/cjs/sync/syncManagerFactoryOnline';
import { InRedisStorageFactory } from '@splitsoftware/js-commons/cjs/storages/inRedis/index';
import { InMemoryStorageFactory } from '@splitsoftware/js-commons/cjs/storages/inMemory/InMemoryStorage';
import { sdkManagerFactory } from '@splitsoftware/js-commons/cjs/sdkManager/index';
import clientMethodFactory from '@splitsoftware/js-commons/cjs/sdkClient/clientMethod';
import NodeSignalListener from '@splitsoftware/js-commons/cjs/listeners/node';
import impressionsObserverFactory from '@splitsoftware/js-commons/cjs/trackers/impressionObserver/serverSideObserver';

import getFetch from '../services/getFetch';
import getEventSource from '../services/getEventSource';
import getOptions from '../services/request/options';

const nodePlatform = {
  getOptions,
  getFetch,
  getEventSource,
};

const syncManagerFactoryOfflineNode = syncManagerFactoryOffline.bind(null, splitsParserFromFile);

/**
 *
 * @param {import("@splitsoftware/js-commons/types/types").ISettings} settings
 */
export function getModules(settings) {
  return {
    settings,
    // @TODO add type to ISettings
    filterQueryString: settings.sync.__splitFiltersValidation.queryString,


    platform: nodePlatform,
    storageFactory: settings.storage.type === 'REDIS' ? InRedisStorageFactory : InMemoryStorageFactory,

    splitApiFactory: settings.mode === 'localhost' ? undefined : splitApiFactory,
    syncManagerFactory: settings.mode === 'localhost' ? syncManagerFactoryOfflineNode : syncManagerFactoryOnline,

    sdkManagerFactory,
    sdkClientMethodFactory: clientMethodFactory,
    SignalListener: settings.mode === 'localhost' ? undefined : NodeSignalListener,
    impressionListener: settings.impressionListener,

    // @TODO add integrations
    integrations: undefined,
    // @TODO add dataloader
    dataLoader: undefined,
    impressionsObserverFactory: settings.sync.impressionsMode === 'OPTIMIZED' ? impressionsObserverFactory : undefined,
  };
}
