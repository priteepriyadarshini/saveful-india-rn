import { Feather } from '@expo/vector-icons';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import tw from '../../../common/tailwind';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export default function useNoBackScreenCloseButton<T extends ParamListBase>(
  navigation: NavigationProp<T>,
  onClose: () => void,
) {
  React.useLayoutEffect(() => {
    if (navigation.canGoBack()) {
      return;
    }

    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={tw`h-11 w-11`}
          onPress={onClose}
          accessibilityRole="button"
        >
          <Feather name="x" color="black" size={24} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, onClose]);
}
