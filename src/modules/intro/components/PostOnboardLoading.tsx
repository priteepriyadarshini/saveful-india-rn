import { useLinkTo } from '@react-navigation/native';
import tw from '../../../common/tailwind';
import RotatingLoading from '../../../modules/intro/components/RotatingLoading';
import React, { useEffect, useState } from 'react';
import { Animated, Easing, Text } from 'react-native';
import { bodyLargeRegular } from '../../../theme/typography';

export default function PostOnboardLoading({
  setIsPostOnboardSet,
}: {
  setIsPostOnboardSet?: (value: boolean) => void;
}) {
  const [loadingText, setLoadingText] = useState('Dishes');
  const [, setBackgroundColor] = useState('#FFCDF5');
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 2,
      duration: 8000,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();
  }, [animation]);

  const bgStyle = {
    backgroundColor: animation.interpolate({
      inputRange: [0, 1, 2],
      outputRange: ['#FFCDF5', '#E9ED1F', '#96F0B6'],
    }),
  };
  const linkTo = useLinkTo();
  useEffect(() => {
    // Simulate loading progress
    const loadingInterval = setInterval(() => {
      switch (loadingText) {
        case 'Dishes':
          setLoadingText('Deliciousness');
          setBackgroundColor('#E9ED1F');
          break;
        case 'Deliciousness':
          setLoadingText('Feed');
          setBackgroundColor('#96F0B6');
          break;
        case 'Feed':
          if (setIsPostOnboardSet) setIsPostOnboardSet(false);
          linkTo('/feed');
          break;
        default:
          setLoadingText('Dishes');
          setBackgroundColor('#FFCDF5');
      }
    }, 2000); // Change text every 2 seconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(loadingInterval);
  }, [linkTo, loadingText, setIsPostOnboardSet]);

  return (
    <Animated.View
      style={[tw.style('flex-1 items-center justify-center'), bgStyle]}
    >
      <RotatingLoading />
      <Text style={tw.style(bodyLargeRegular, 'mt-5')}>{loadingText}...</Text>
    </Animated.View>
  );
}
