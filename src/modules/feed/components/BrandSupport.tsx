import tw from '../../../common/tailwind';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import BrandComponent from './BrandComponent';
import React from 'react';
import {
  Animated,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { bodyMediumRegular, h5TextStyle, h7TextStyle } from "../../../theme/typography";

import { BRANDS, GOVERNMENT, INDUSTRY } from '../data/brands';

const data = [
  {
    id: 0,
    name: 'brand support',
    brand: BRANDS,
  },
  {
    id: 1,
    name: 'industry support',
    brand: INDUSTRY,
  },
  {
    id: 2,
    name: 'government support',
    brand: GOVERNMENT,
  },
];

function SupportComponent() {
  return data.map(x => {
    return (
      <View key={x.id}>
        <Text style={tw.style(h7TextStyle, 'mb-5 mt-8 text-center')}>
          {x.name}
        </Text>
        <BrandComponent brand={x.brand} />
      </View>
    );
  });
}

export default function Partners({ offset }: { offset: Animated.Value }) {
  const { sendScrollEventInitiation } = useAnalytics();

  return (
    <ScrollView
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: offset } } }],
        {
          useNativeDriver: false,
          listener: (event: NativeSyntheticEvent<NativeScrollEvent>) =>
            sendScrollEventInitiation(event, 'Partner Page Viewed'),
        },
      )}
    >
      <View>
        <View style={tw`flex-1 bg-creme pb-12`}>
          <Text style={tw.style(h5TextStyle, 'py-3 text-center')}>
            Our partners
          </Text>
          <Text
            style={tw.style(bodyMediumRegular, 'mx-5 text-center text-midgray')}
          >
            Thanks to the support of these waste-fighting warriors, we can make
            saving food, money, and time accessible for every Australian.
          </Text>
          <ImageBackground
            style={tw`h-full w-full items-center`}
            source={require('../../../../assets/ribbons/grey-ribbons.png')}
          >
            <View style={tw.style('w-full px-5')}>
              <SupportComponent />
            </View>
          </ImageBackground>
        </View>
      </View>
    </ScrollView>
  );
}
