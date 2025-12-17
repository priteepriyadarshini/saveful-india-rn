import tw from '../../../common/tailwind';
import React from 'react';
import { Text, TextProps } from 'react-native';

export default function DeveloperFormLabel(props: TextProps) {
  return <Text style={tw.style('text-lg text-gray-900')} {...props} />;
}
