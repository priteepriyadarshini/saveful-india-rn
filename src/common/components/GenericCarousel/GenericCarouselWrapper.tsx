import tw from '../../tailwind';
import React from 'react';
import { View, ViewStyle } from 'react-native';

export default function GenericCarouselWrapper({
  style,
  children,
}: {
  children?: React.ReactNode;
  style?: ViewStyle | string;
}) {
  return <View style={tw.style('', style)}>{children}</View>;
}
