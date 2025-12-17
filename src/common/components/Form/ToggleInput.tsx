import tw from '../../../common/tailwind';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { bodyLargeBold } from '../../../theme/typography';

export default function ToggleInput({
  label,
  value,
  setValue,
}: {
  label: string;
  value: boolean;
  setValue: (value: boolean) => void;
}) {
  const pillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const isActive = () => {
      Animated.timing(pillAnim, {
        toValue: 30,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    const isInactive = () => {
      Animated.timing(pillAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    if (!value) {
      isInactive();
    } else {
      isActive();
    }
  }, [value, pillAnim]);

  const colorStyle = {
    backgroundColor: pillAnim.interpolate({
      inputRange: [0, 30],
      outputRange: ['rgba(238, 228, 215, 1)', 'rgba(150, 240, 182, 1)'],
    }),
    borderColor: pillAnim.interpolate({
      inputRange: [0, 30],
      outputRange: ['rgba(109, 109, 114, 1)', 'rgba(58, 126, 81, 1)'],
    }),
  };

  return (
    <View style={tw`w-full border-b border-strokecream py-4`}>
      <View style={tw`flex-row items-center justify-between gap-2.5`}>
        <Text style={tw.style(bodyLargeBold)}>{label}</Text>
        <Pressable
          onPress={() => {
            setValue(!value);
          }}
        >
          <Animated.View
            style={[tw`w-15 h-7.5 relative rounded-full border`, colorStyle]}
          >
            <Animated.View
              style={tw.style(
                'w-7.5 h-7.5 absolute -left-px -top-px rounded-full border bg-white',
                value ? 'border-kale' : 'border-stone',
                {
                  transform: [{ translateX: pillAnim }],
                },
              )}
            />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}
