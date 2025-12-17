import AnimatedHeader from '../../../common/components/AnimatedHeader';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import tw from '../../../common/tailwind';
import BrandSupport from '../components/BrandSupport';
import React, { useRef } from 'react';
import { Animated, View } from 'react-native';

export default function PartnersScreen() {
  const offset = useRef(new Animated.Value(0)).current;

  return (
    <View style={tw`flex-1 bg-creme`}>
      <AnimatedHeader animatedValue={offset} title={'Our Partners'} />
      <BrandSupport offset={offset} />

      <FocusAwareStatusBar statusBarStyle="dark" />
    </View>
  );
}
