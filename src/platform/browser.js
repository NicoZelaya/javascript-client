import { splitApiFactory } from '@splitsoftware/js-commons/cjs/services/splitApi';
import splitsParserFromSettings from '@splitsoftware/js-commons/cjs/sync/offline/splitsParser/splitsParserFromSettings';
import { syncManagerFactoryOfflineCS } from '@splitsoftware/js-commons/cjs/sync/syncManagerFactoryOfflineCS';
// @TODO implement
import { syncManagerFactoryOnlineCS } from '@splitsoftware/js-commons/cjs/sync/syncManagerFactoryOnlineCS';
import { InLocalStorageCSFactory } from '@splitsoftware/js-commons/cjs/storages/inLocalStorage/index';
import { InMemoryStorageCSFactory } from '@splitsoftware/js-commons/cjs/storages/inMemory/InMemoryStorageCS';
import { sdkManagerFactory } from '@splitsoftware/js-commons/cjs/sdkManager/index';
import { clientMethodCSFactory } from '@splitsoftware/js-commons/cjs/sdkClient/clientMethodCS';
import BrowserSignalListener from '@splitsoftware/js-commons/cjs/listeners/browser';
import { clientSideObserverFactory } from '@splitsoftware/js-commons/cjs/trackers/impressionObserver/clientSideObserver';
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

const syncManagerFactoryOfflineCSBrowser = syncManagerFactoryOfflineCS.bind(null, splitsParserFromSettings);

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
    // @TODO consider adding it to ISettings
    filterQueryString: settings.sync.__splitFiltersValidation.queryString,


    platform: browserPlatform,
    storageFactory: settings.storage.type === 'LOCALSTORAGE' ?
      InLocalStorageCSFactory.bind(null, objectAssign(storageFactoryParams, {
        matchingKey,
        prefix: settings.storage.prefix,
        splitFiltersValidation: settings.sync.__splitFiltersValidation,
      })) :
      InMemoryStorageCSFactory.bind(null, storageFactoryParams),


    splitApiFactory: settings.mode === 'localhost' ? undefined : splitApiFactory,
    syncManagerFactory: settings.mode === 'localhost' ? syncManagerFactoryOfflineCSBrowser : syncManagerFactoryOnlineCS,

    sdkManagerFactory,
    sdkClientMethodFactory: clientMethodCSFactory,
    SignalListener: settings.mode === 'localhost' ? undefined : BrowserSignalListener,
    impressionListener: settings.impressionListener,

    integrationsManagerFactory: settings.integrations && settings.integrations.length > 0 ? integrationsManagerFactory.bind(null, settings.integrations) : undefined,

    impressionsObserverFactory: shouldAddPt(settings) ? clientSideObserverFactory : undefined,
  };
}
