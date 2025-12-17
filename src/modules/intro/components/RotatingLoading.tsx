
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import tw from '../../../common/tailwind';
import { h2TextStyle } from '../../../theme/typography';

export default function RotatingLoading() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,   // Adjust the duration as needed
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => spin());
    };

    spin();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={tw.style('flex-1 justify-center items-center')}>
      <View style={tw.style('relative')}>
        <Text style={tw.style(h2TextStyle)}>{`L${'   '}ading`}</Text>
        <Animated.Image
          style={[
            tw.style('absolute left-3'),
            { transform: [{ rotate: spin }] },
          ]}
          source={require('../../../../assets/placeholder/circle.png')}
        />
      </View>
    </View>
  );
}
