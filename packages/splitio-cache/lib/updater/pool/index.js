'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var Pool = require('generic-pool').Pool;

var log = require('debug')('splitio-cache:pool');

var settings = require('@splitsoftware/splitio-utils/lib/settings');

module.exports = function factory(overrides) {
  return new Pool((0, _assign2.default)({}, {
    refreshIdle: false,
    create: function create(callback) {
      callback(null, {});
    },
    destroy: function destroy() {},

    max: settings.get('node').http.poolSize,
    log: log
  }, overrides));
};
//# sourceMappingURL=index.js.map