import splitsParserFromSettings from '@splitsoftware/js-commons/src/sync/offline/splitsParser/splitsParserFromSettings';
import { syncManagerOfflineFactory } from '@splitsoftware/js-commons/src/sync/syncManagerOffline';
import { InMemoryStorageCSFactory } from '@splitsoftware/js-commons/src/storages/inMemory/InMemoryStorageCS';
import { sdkManagerFactory } from '@splitsoftware/js-commons/src/sdkManager/index';
import { sdkClientMethodCSFactory } from '@splitsoftware/js-commons/src/sdkClient/sdkClientMethodCS';

const browserPlatform = {
  // getFetch,
  // getEventSource,
  // getOptions
};

const syncManagerOfflineCSBrowserFactory = syncManagerOfflineFactory(splitsParserFromSettings);

/**
 *
 * @param {import("@splitsoftware/js-commons/types/types").ISettings} settings
 */
export function getModules(settings) {

  const storageFactoryParams = {
    eventsQueueSize: settings.scheduler.eventsQueueSize,
    // debugImpressionsMode: shouldBeOptimized(settings) ? false : true,
    // @TODO add dataloader
    // dataLoader: undefined,
  };

  return {
    settings,
    // @TODO consider adding it to ISettings
    filterQueryString: settings.sync.__splitFiltersValidation.queryString,


    platform: browserPlatform,
    storageFactory: InMemoryStorageCSFactory.bind(null, storageFactoryParams),

    syncManagerFactory: syncManagerOfflineCSBrowserFactory,

    sdkManagerFactory,
    sdkClientMethodFactory: sdkClientMethodCSFactory,
    impressionListener: settings.impressionListener,
  };
}
