import tw from '../tailwind';
import React, { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

export default function SkeletonLoader({
  styles,
  startColor = '#FFF4E4',
  endColor = '#FFF7EC',
}: {
  styles: string[];
  startColor?: string;
  endColor?: string;
}) {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 2,
        duration: 2000,
        useNativeDriver: false,
        easing: Easing.linear,
      }),
    ).start();
  }, [animation]);

  const renderSkeletons = () => {
    return styles.map((twClass, index) => {
      const bgStyle = {
        backgroundColor: animation.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [startColor, endColor, startColor],
        }),
      };

      return <Animated.View key={index} style={[tw.style(twClass), bgStyle]} />;
    });
  };

  return <>{renderSkeletons()}</>;
}
