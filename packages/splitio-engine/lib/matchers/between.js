'use strict';

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

var log = require('debug')('splitio-engine:matcher');

function betweenMatcherContext(valueObject /*: betweenObject */) /*: Function */{
  return function betweenMatcher(value /*: number */) /*: boolean */{
    var isBetween = value >= valueObject.start && value <= valueObject.end;

    log('[betweenMatcher] is ' + value + ' between ' + valueObject.start + ' and ' + valueObject.end + '? ' + isBetween);

    return isBetween;
  };
}

module.exports = betweenMatcherContext;
//# sourceMappingURL=between.js.map