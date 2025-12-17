import { useNavigation } from '@react-navigation/native';
import useFeatureFlag, { FeatureFlagKey } from '../../../modules/developer/featureFlags';
import useEnvironment from '../../environment/hooks/useEnvironment';
import { EnvironmentType } from '../../environment/types';

export default function useHiddenDeveloperMenu() {
  const navigation = useNavigation();
  const env = useEnvironment();
  const shortLongPress = useFeatureFlag(FeatureFlagKey.ShortDebugLongPress);

  const changeEnv = () => {
    navigation.navigate('Developer' as never);
    // Alert.prompt only works on iOS
    // Alert.prompt(
    //   'Whats up?',
    //   undefined,
    //   (text: string) => {
    //     if (text === 'Swordfish') {
    //       navigation.navigate('Developer' as never);
    //     } else {
    //       Alert.alert('Thanks!');
    //     }
    //   },
    //   'secure-text',
    // );
  };

  return {
    // If short flag set, use 0, otherwise 10s if prod, 2 if not
    delayLongPress: shortLongPress
      ? 0
      : env.environment === EnvironmentType.Production
      ? 10000
      : 2000,
    onLongPress: changeEnv,
  };
}
