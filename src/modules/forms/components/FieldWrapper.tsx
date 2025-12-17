import tw from '../../../common/tailwind';
import React from 'react';
import { View } from 'react-native';

export default function FieldWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={tw`mb-8`}>{children}</View>;
}
