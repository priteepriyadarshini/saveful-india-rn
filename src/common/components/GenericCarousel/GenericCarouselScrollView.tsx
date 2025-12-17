import tw from '../../tailwind';
import React from 'react';
import { ScrollView } from 'react-native';

export default function GenericCarouselScrollView({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={tw`px-4`}
      automaticallyAdjustContentInsets={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
