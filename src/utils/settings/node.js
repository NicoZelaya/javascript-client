import { settingsValidation } from '@splitsoftware/js-commons/cjs/utils/settings';
import defaults from './defaults/node';
import runtime from './runtime/node';
import storage from './storage/node';
import integrations from './integrations/node';

const params = {
  defaults,
  runtime,
  storage,
  integrations
};

export default function nodeSettingsFactory(config) {
  return settingsValidation(config, params);
}