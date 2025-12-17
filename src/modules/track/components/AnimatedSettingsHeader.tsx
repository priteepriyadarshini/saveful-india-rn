import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import tw from '../../../common/tailwind';
import React from 'react';
import { Animated, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subheadLargeUppercase } from '../../../theme/typography';

export default function AnimatedSettingsHeader({
  animatedValue,
  title,
}: {
  animatedValue?: Animated.Value;
  title?: string;
}) {
  const navigation = useNavigation();
  const headerOpacity = animatedValue?.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerHeight = 116; // Height according to desing

  return (
    // The first view is just a container for the bg and the search
    <View style={tw`absolute left-0 right-0 z-10`}>
      {/* The animated view will change the opacity of the BG */}
      <Animated.View
        style={[
          tw`absolute h-${headerHeight}px left-0 right-0 z-10 bg-eggplant shadow-md`,
          {
            opacity: headerOpacity,
          },
        ]}
      />
      {/* Search will always be here */}
      <SafeAreaView
        edges={['top']}
        style={tw`pb-6.5 absolute left-0 right-0 z-20 flex-row items-end justify-between gap-3 px-5 pt-5`}
      >
        <Pressable
          style={tw`flex h-5 w-5 items-center justify-center`}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Feather name="arrow-left" color={tw.color('white')} size={20} />
        </Pressable>

        {title && (
          <Animated.Text
            style={[
              tw.style(
                subheadLargeUppercase,
                'grow text-center leading-5 text-white',
              ),
            ]}
            numberOfLines={1}
          >
            {title}
          </Animated.Text>
        )}

        <View style={tw`w-5`} />
      </SafeAreaView>
    </View>
  );
}
