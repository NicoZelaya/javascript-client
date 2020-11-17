import { splitApiFactory } from '@splitsoftware/js-commons/cjs/services/splitApi';
import splitsParserFromSettings from '@splitsoftware/js-commons/cjs/sync/offline/splitsParser/splitsParserFromSettings';
import { syncManagerFactoryOfflineCS } from '@splitsoftware/js-commons/cjs/sync/syncManagerFactoryOfflineCS';
// @TODO implement
import { syncManagerFactoryOnlineCS } from '@splitsoftware/js-commons/cjs/sync/syncManagerFactoryOnlineCS';
import { InLocalStorageCSFactory } from '@splitsoftware/js-commons/cjs/storages/inLocalStorage/index';
import { InMemoryStorageCSFactory } from '@splitsoftware/js-commons/cjs/storages/inMemory/InMemoryStorageCS';
import { sdkManagerFactory } from '@splitsoftware/js-commons/cjs/sdkManager/index';
import clientMethodFactoryCS from '@splitsoftware/js-commons/cjs/sdkClient/clientMethodCS';
import BrowserSignalListener from '@splitsoftware/js-commons/cjs/listeners/browser';
import impressionsObserverFactory from '@splitsoftware/js-commons/cjs/trackers/impressionObserver/clientSideObserver';

import getFetch from '../services/getFetch';
import getEventSource from '../services/getEventSource';
import getOptions from '../services/request/options';

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



  return {
    settings,
    // @TODO consider adding it to ISettings
    filterQueryString: settings.sync.__splitFiltersValidation.queryString,


    platform: browserPlatform,
    storageFactory: settings.storage.type === 'LOCALSTORAGE' ? InLocalStorageCSFactory : InMemoryStorageCSFactory,

    splitApiFactory: settings.mode === 'localhost' ? undefined : splitApiFactory,
    syncManagerFactory: settings.mode === 'localhost' ? syncManagerFactoryOfflineCSBrowser : syncManagerFactoryOnlineCS,

    sdkManagerFactory,
    sdkClientMethodFactory: clientMethodFactoryCS,
    SignalListener: settings.mode === 'localhost' ? undefined : BrowserSignalListener,
    impressionListener: settings.impressionListener,

    // @TODO add integrations
    integrations: undefined,
    // @TODO add dataloader
    dataLoader: undefined,
    impressionsObserverFactory: settings.sync.impressionsMode === 'OPTIMIZED' ? impressionsObserverFactory : undefined,
  };
}
