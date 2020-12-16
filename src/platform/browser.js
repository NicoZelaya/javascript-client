import { splitApiFactory } from '@splitsoftware/js-commons/src/services/splitApi';
import splitsParserFromSettings from '@splitsoftware/js-commons/src/sync/offline/splitsParser/splitsParserFromSettings';
import { syncManagerOfflineFactory } from '@splitsoftware/js-commons/src/sync/syncManagerOffline';
import { syncManagerOnlineFactory } from '@splitsoftware/js-commons/src/sync/syncManagerOnline';
import pushManagerFactory from '@splitsoftware/js-commons/src/sync/streaming/pushManager';
import pollingManagerCSFactory from '@splitsoftware/js-commons/src/sync/polling/pollingManagerCS';
import { InLocalStorageCSFactory } from '@splitsoftware/js-commons/src/storages/inLocalStorage/index';
import { InMemoryStorageCSFactory } from '@splitsoftware/js-commons/src/storages/inMemory/InMemoryStorageCS';
import { sdkManagerFactory } from '@splitsoftware/js-commons/src/sdkManager/index';
import { sdkClientMethodCSFactory } from '@splitsoftware/js-commons/src/sdkClient/sdkClientMethodCS';
import BrowserSignalListener from '@splitsoftware/js-commons/src/listeners/browser';
import { impressionObserverCSFactory } from '@splitsoftware/js-commons/src/trackers/impressionObserver/impressionObserverCS';
import integrationsManagerFactory from '@splitsoftware/js-commons/src/integrations/browser';

import getFetch from '../services/getFetch';
import getEventSource from '../services/getEventSource';
import getOptions from '../services/request/options';
import { shouldAddPt, shouldBeOptimized } from './commons';
import objectAssign from '@splitsoftware/js-commons/node_modules/object-assign';
import { getMatching } from '@splitsoftware/js-commons/src/utils/key';

const browserPlatform = {
  getFetch,
  getEventSource,
  getOptions
};

const syncManagerOfflineCSBrowserFactory = syncManagerOfflineFactory(splitsParserFromSettings);
const syncManagerOnlineCSFactory = syncManagerOnlineFactory(pollingManagerCSFactory, pushManagerFactory);

/**
 *
 * @param {import("@splitsoftware/js-commons/types/types").ISettings} settings
 */
export function getModules(settings) {

  const storageFactoryParams = {
    eventsQueueSize: settings.scheduler.eventsQueueSize,
    debugImpressionsMode: shouldBeOptimized(settings) ? false : true,
    // @TODO add dataloader
    dataLoader: undefined,
  };
  const matchingKey = getMatching(settings.core.key);

  return {
    settings,

    platform: browserPlatform,

    storageFactory: settings.storage.type === 'LOCALSTORAGE' ?
      InLocalStorageCSFactory.bind(null, objectAssign(storageFactoryParams, {
        matchingKey,
        prefix: settings.storage.prefix,
        splitFiltersValidation: settings.sync.__splitFiltersValidation,
      })) :
      InMemoryStorageCSFactory.bind(null, storageFactoryParams),


    splitApiFactory: settings.mode === 'localhost' ? undefined : splitApiFactory,
    syncManagerFactory: settings.mode === 'localhost' ? syncManagerOfflineCSBrowserFactory : syncManagerOnlineCSFactory,

    sdkManagerFactory,
    sdkClientMethodFactory: sdkClientMethodCSFactory,
    SignalListener: settings.mode === 'localhost' ? undefined : BrowserSignalListener,
    impressionListener: settings.impressionListener,

    integrationsManagerFactory: settings.integrations && settings.integrations.length > 0 ? integrationsManagerFactory.bind(null, settings.integrations) : undefined,

    // @TODO consider not including in debug mode?
    impressionsObserverFactory: shouldAddPt(settings) ? impressionObserverCSFactory : undefined,
  };
}
