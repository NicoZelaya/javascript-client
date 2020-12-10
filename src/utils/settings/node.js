import { settingsValidation } from '@splitsoftware/js-commons/src/utils/settings';
import defaults from './defaults/node';
import storageValidation from './storage/node';
import runtimeValidation from './runtime/node';

const params = {
  defaults,
  storageValidation,
  runtimeValidation
};

export default function nodeSettingsFactory(config) {
  return settingsValidation(config, params);
}