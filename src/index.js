import SettingsFactory from './utils/settings';
import { getModules } from './platform';
import { sdkFactory } from '@splitsoftware/js-commons/cjs/sdkFactory';

export function SplitFactory(config) {
  const settings = SettingsFactory(config);
  const modules = getModules(settings);
  return sdkFactory(modules);
}
