import Pill from '../../../common/components/Pill';
import tw from '../../../common/tailwind';
import { ITag } from '../../../models/craft';
import CircularHeader from '../../../modules/prep/components/CircularHeader';
import React from 'react';
import { Text, View } from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import { bodyMediumRegular, subheadLargeUppercase } from '../../../theme/typography';

export default function PrepFlavor({
  flavors,
  selectedFlavor,
  selectFlavor,
}: {
  flavors: ITag[];
  selectedFlavor: string;
  selectFlavor: (item: string) => void;
}) {
  return (
    <View style={tw.style('pt-4.5 px-5')}>
      <CircularHeader title="what’s your flavour?" />
      <Text style={tw.style('pb-6 pt-4 text-left', bodyMediumRegular)}>
        There are a number of ways you can make this dish, all uniquely
        delicious. Choose from chef-created combos or create your own.
      </Text>
      <Text style={tw.style(subheadLargeUppercase, 'pb-2 text-midgray')}>
        PICK A FLAVOUR
      </Text>
      <View
        style={[
          tw.style('rounded-md border border-radish bg-white p-5'),
          cardDrop,
        ]}
      >
        <View style={tw`w-full flex-row flex-wrap justify-center gap-1`}>
          {flavors?.map(filter => (
            <Pill
              key={filter.id}
              text={filter.title}
              size="small"
              isActive={selectedFlavor === filter.id}
              setIsActive={() => selectFlavor(filter.id)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
