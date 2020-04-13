/**
Copyright 2016 Split Software

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/
import { forOwn } from '../../utils/lang';
import logFactory from '../../utils/logger';
const log = logFactory('splitio-producer:offline');
import thenable from '../../utils/promise/thenable';

function FromObjectUpdaterFactory(Fetcher, context) {
  const {
    [context.constants.SETTINGS]: settings,
    [context.constants.READINESS]: readiness,
    [context.constants.STORAGE]: storage
  } = context.getAll();

  return function ObjectUpdater() {
    const splits = [];
    let loadError = null;
    let splitsMock = {};
    try {
      splitsMock = Fetcher(settings);
    } catch (err) {
      loadError = err;
      log.error(`There was an issue loading the mock Splits data, no changes will be applied to the current cache. ${err}`);
    }

    if (!loadError && splitsMock) {
      log.debug('Splits data: ');
      log.debug(JSON.stringify(splitsMock));

      forOwn(splitsMock, function(val, name) {
        splits.push([
          name,
          JSON.stringify({
            name,
            status: 'ACTIVE',
            killed: false,
            trafficAllocation: 100,
            defaultTreatment: 'control',
            conditions: val.conditions || [],
            configurations: val.configurations,
            trafficTypeName: val.trafficTypeName
          })
        ]);
      });

      const flushResult = storage.splits.flush();
      const flushPromise = thenable(flushResult) ? flushResult : Promise.resolve(flushResult);

      return flushPromise.then(function () {
        const addSplitsResult = storage.splits.addSplits(splits);
        const addSplitsPromise = thenable(addSplitsResult) ? addSplitsResult : Promise.resolve(addSplitsResult);

        return addSplitsPromise.then(function () {
          readiness.splits.emit(readiness.splits.SDK_SPLITS_ARRIVED);
          readiness.segments.emit(readiness.segments.SDK_SEGMENTS_ARRIVED);
        });
      });
    }
    return Promise.resolve();
  };
}

export default FromObjectUpdaterFactory;
