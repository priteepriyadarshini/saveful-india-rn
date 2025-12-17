import tw from '../tailwind';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import useHiddenDeveloperMenu from '../../modules/developer/hooks/useHiddenDeveloperMenu';
import useEnvironment from '../../modules/environment/hooks/useEnvironment';
import { EnvironmentType } from '../../modules/environment/types';
import { Pressable, Text } from 'react-native';

export default function VersionNumber() {
  const { onLongPress, delayLongPress } = useHiddenDeveloperMenu();
  const env = useEnvironment();
  const envString =
    env.environment === EnvironmentType.Production
      ? ''
      : ` - ${env.environment}`;

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={delayLongPress}>
      <Text style={tw.style('text-xs leading-tightest text-gray-600')}>
        v{Constants.expoConfig?.version ?? 'Unknown'}(
        {Application.nativeBuildVersion}) {envString}
      </Text>
    </Pressable>
  );
}
