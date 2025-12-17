import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Animated, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from '../../../common/tailwind';
import { h7TextStyle } from '../../../theme/typography';


export default function AnimatedHacksHeader({
  animatedValue,
  title,
}: {
  animatedValue: Animated.Value;
  title?: string;
}) {
  const navigation = useNavigation();
  const headerOpacity = animatedValue.interpolate({
    inputRange: [30, 260],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTextOpacity = animatedValue.interpolate({
    inputRange: [30, 260],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    // The first view is just a container for the bg and the search
    <View style={tw`relative left-0 right-0 z-10`}>
      {/* The animated view will change the opacity of the BG */}
      <Animated.View
        style={[
          tw`absolute left-0 right-0 z-10 h-full bg-eggplant shadow-md`,
          {
            opacity: headerOpacity,
          },
        ]}
      />
      {/* Search will always be here */}
      <View style={tw`z-20`}>
        <SafeAreaView
          edges={['top']}
          style={tw`z-20 flex-row items-center justify-between gap-3 py-3`}
        >
          <Pressable
            style={tw`ml-5 flex h-5 w-5 items-center justify-center`}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <Feather name="arrow-left" color={tw.color('white')} size={20} />
          </Pressable>

          {title && (
            <Animated.Text
              style={[
                tw.style(h7TextStyle, 'grow text-center text-white'),
                {
                  opacity: headerTextOpacity,
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Animated.Text>
          )}

          <View style={tw`mr-5 h-5 w-5`} />
        </SafeAreaView>
      </View>
    </View>
  );
}
