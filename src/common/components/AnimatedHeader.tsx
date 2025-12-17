import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import tw from '../tailwind';
import React from 'react';
import { Animated, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { h7TextStyle } from '../../theme/typography';

export default function AnimatedHeader({
  animatedValue,
  title,
  hideBackButton = false,
  showCloseButton = false,
  onBack,
  onClose,
}: {
  animatedValue: Animated.Value;
  title?: string;
  hideBackButton?: boolean;
  showCloseButton?: boolean;
  onBack?: () => void;
  onClose?: () => void;
}) {
  const navigation = useNavigation();
  const headerOpacity = animatedValue.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTextOpacity = animatedValue.interpolate({
    inputRange: [0, 90],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    // The first view is just a container for the bg and the search
    <View style={tw`relative left-0 right-0 z-10`}>
      {/* The animated view will change the opacity of the BG */}
      <Animated.View
        style={[
          tw`absolute left-0 right-0 z-10 h-full bg-white shadow-md`,
          {
            opacity: headerOpacity,
          },
        ]}
      />
      {/* Search will always be here */}
      <View style={tw`z-20`}>
        <SafeAreaView
          edges={['top']}
          style={tw`z-20 flex-row items-center justify-between gap-2`}
        >
          {!hideBackButton ? (
            <Pressable
              style={tw`ml-5 flex h-11 w-11 items-start justify-center`}
              onPress={() => {
                if (onBack) {
                  onBack();
                } else {
                  navigation.goBack();
                }
              }}
              accessibilityRole="button"
            >
              <Feather name="arrow-left" color="black" size={20} />
            </Pressable>
          ) : (
            <View style={tw`ml-5 h-11 w-11`} />
          )}

          {title && (
            <Animated.Text
              style={[
                tw.style(h7TextStyle, 'shrink text-center'),
                {
                  opacity: headerTextOpacity,
                },
              ]}
              numberOfLines={1}
              ellipsizeMode={'middle'}
            >
              {title}
            </Animated.Text>
          )}

          {showCloseButton ? (
            <Pressable
              style={tw`mr-5 flex h-11 w-11 items-end justify-center`}
              onPress={() => {
                if (onClose) {
                  onClose();
                } else {
                  navigation.goBack();
                }
              }}
              accessibilityRole="button"
            >
              <Feather name="x" color="black" size={20} />
            </Pressable>
          ) : (
            <View style={tw`mr-5 h-11 w-11`} />
          )}
        </SafeAreaView>
      </View>
    </View>
  );
}
