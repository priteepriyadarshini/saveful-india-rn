import { NavigationProp, ParamListBase } from '@react-navigation/native';
import GreenTextNavigationBarButton from '../../../common/components/GreenTextNavigationBarButton';
import React from 'react';

export default function useCancelAndSaveNavigationButton<
  T extends ParamListBase,
>(
  navigation: NavigationProp<T>, // NativeStackNavigationProp<T>,
  isSaving: boolean,
  onSubmit: () => void,
  onCancel?: () => void,
) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return onCancel ? (
          <GreenTextNavigationBarButton
            title="Cancel"
            onPress={onCancel}
            disabled={isSaving}
          />
        ) : null;
      },
      headerRight: () => {
        return (
          <GreenTextNavigationBarButton
            title="Save"
            onPress={onSubmit}
            disabled={isSaving}
          />
        );
      },
    });
  }, [isSaving, navigation, onCancel, onSubmit]);
}
