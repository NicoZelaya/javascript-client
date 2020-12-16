import { settingsValidation } from '@splitsoftware/js-commons/cjs/utils/settings';
import defaults from './defaults/browser';
import runtime from './runtime/browser';
import storage from './storage/browser';
import integrations from './integrations/browser';

const params = {
  defaults,
  runtime,
  storage,
  integrations
};

export default function browserSettingsFactory(config) {
  return settingsValidation(config, params);
}