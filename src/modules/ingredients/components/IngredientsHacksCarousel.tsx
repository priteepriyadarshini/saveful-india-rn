import {
  GenericCarouselFlatlist,
  GenericCarouselWrapper,
} from '../../../common/components/GenericCarousel';
import tw from '../../../common/tailwind';
import { IIngredient } from '../../../models/craft';
import HackOrTip from '../../../modules/prep/components/HackOrTip';
import React, { useRef, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { h7TextStyle } from '../../../theme/typography';

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth - 40;

export default function IngredientsHacksCarousel({
  title,
  relatedHacks,
}: IIngredient) {
  const flatListRef = useRef<any>(null); // Reference to the FlatList component

  const [maxHeight, setMaxHeight] = useState<number>(0);

  return (
    <View style={tw`w-full items-center`}>
      <Text style={tw.style(h7TextStyle, 'px-5 text-center')}>
        Ways to save {title}
      </Text>
      <GenericCarouselWrapper style={tw`relative my-5 overflow-hidden`}>
        <GenericCarouselFlatlist
          flatListRef={flatListRef}
          contentContainerStyle={tw`pb-5 pl-5 pr-3`}
          data={relatedHacks}
          itemLength={itemLength}
          renderItem={(renderItem: { item: { id: string }; index: number }) => (
            <View style={{ width: itemLength }}>
              <View style={tw.style(`mr-2`)}>
                <HackOrTip
                  id={renderItem.item.id}
                  maxHeight={maxHeight}
                  setMaxHeight={setMaxHeight}
                />
              </View>
            </View>
          )}
          section={'HacksOfTips'}
        />
      </GenericCarouselWrapper>
    </View>
  );
}
