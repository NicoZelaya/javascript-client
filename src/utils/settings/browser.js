import { settingsValidation } from '@splitsoftware/js-commons/cjs/utils/settings';
import defaults from './defaults/browser';
import storageValidation from './storage/browser';
import runtimeValidation from './runtime/browser';
import integrationsValidation from './integrations/browser';

const params = {
  defaults,
  storageValidation,
  runtimeValidation,
  integrationsValidation
};

export default function browserSettingsFactory(config) {
  return settingsValidation(config, params);
}