import SettingsFactory from './utils/settings';
import { getModules } from './platform/browserMinimal';
import { sdkFactory } from '@splitsoftware/js-commons/src/sdkFactory';

function SplitFactory(config) {
  const settings = SettingsFactory(config);
  const modules = getModules(settings);
  return sdkFactory(modules);
}

export default SplitFactory;
