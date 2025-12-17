import {
  GenericCarouselFlatlist,
  GenericCarouselWrapper,
} from '../../../common/components/GenericCarousel';
import GenericCarouselPagination from '../../../common/components/GenericCarousel/GenericCarouselPagination';
import tw from '../../../common/tailwind';
import useHiddenDeveloperMenu from '../../../modules/developer/hooks/useHiddenDeveloperMenu';
import INTRO from '../../../modules/intro/data/intro';
import React from 'react';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import { bodyMediumRegular, subheadMedium } from '../../../theme/typography';

const screenWidth = Dimensions.get('screen').width;
const itemLength = screenWidth * 1;

interface CarouselItem {
  id: number;
  heading: string;
}

export default function IntroCarousel({ data }: { data: CarouselItem[] }) {
  const { onLongPress, delayLongPress } = useHiddenDeveloperMenu();

  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  return (
    <GenericCarouselWrapper style={tw.style(`relative overflow-hidden`)}>
      <GenericCarouselFlatlist
        data={data}
        renderItem={({ item }: any) => {
          return (
            <Pressable
              style={tw`px-5 w-[${Dimensions.get('window').width}px] h-full`}
              key={item.id}
              onLongPress={onLongPress}
              delayLongPress={delayLongPress}
            >
              <View
                style={[
                  tw`gap-4.5 rounded-2lg border border-strokecream bg-white px-7 py-6 w-[${
                    Dimensions.get('window').width - 40
                  }px]`,
                  cardDrop,
                ]}
              >
                <Image
                  style={tw.style('w-full')}
                  resizeMode="contain"
                  source={item.image}
                />

                <View style={tw`h-[127px] gap-4`}>
                  <View style={tw`items-center`}>
                    <Text
                      style={tw.style(subheadMedium, 'text-center')}
                      allowFontScaling={false}
                    >
                      {item.heading}
                    </Text>
                  </View>
                  <Text
                    style={tw.style(
                      bodyMediumRegular,
                      'text-center text-midgray',
                    )}
                    maxFontSizeMultiplier={2}
                  >
                    {item.description}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        getCurrentIndex={setCurrentIndex}
        itemLength={itemLength}
      />
      <View style={tw`mx-5 mt-4`}>
        <GenericCarouselPagination
          items={INTRO}
          dotSpacing={4}
          dotSize={4}
          activeDotColor="eggplant"
          inactiveDotColor="eggplant/60"
          currentIndex={currentIndex}
        />
      </View>
    </GenericCarouselWrapper>
  );
}
