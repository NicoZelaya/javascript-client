import { splitApiFactory } from '@splitsoftware/js-commons/cjs/services/splitApi';
import splitsParserFromSettings from '@splitsoftware/js-commons/cjs/sync/offline/splitsParser/splitsParserFromSettings';
import { syncManagerOfflineFactory } from '@splitsoftware/js-commons/cjs/sync/syncManagerOffline';
import { syncManagerOnlineFactory } from '@splitsoftware/js-commons/cjs/sync/syncManagerOnline';
import pushManagerFactory from '@splitsoftware/js-commons/cjs/sync/streaming/pushManager';
import pollingManagerCSFactory from '@splitsoftware/js-commons/cjs/sync/polling/pollingManagerCS';
import { InLocalStorageCSFactory } from '@splitsoftware/js-commons/cjs/storages/inLocalStorage/index';
import { InMemoryStorageCSFactory } from '@splitsoftware/js-commons/cjs/storages/inMemory/InMemoryStorageCS';
import { sdkManagerFactory } from '@splitsoftware/js-commons/cjs/sdkManager/index';
import { sdkClientMethodCSFactory } from '@splitsoftware/js-commons/cjs/sdkClient/sdkClientMethodCS';
import BrowserSignalListener from '@splitsoftware/js-commons/cjs/listeners/browser';
import { impressionObserverCSFactory } from '@splitsoftware/js-commons/cjs/trackers/impressionObserver/impressionObserverCS';
import integrationsManagerFactory from '@splitsoftware/js-commons/cjs/integrations/browser';

import getFetch from '../services/getFetch';
import getEventSource from '../services/getEventSource';
import getOptions from '../services/request/options';
import { shouldAddPt, shouldBeOptimized } from './commons';
import objectAssign from 'object-assign';
import { getMatching } from '@splitsoftware/js-commons/cjs/utils/key';

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

    impressionsObserverFactory: shouldAddPt(settings) ? impressionObserverCSFactory : undefined,
  };
}
