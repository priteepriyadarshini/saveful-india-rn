import { useState } from 'react';
import { Animated, Dimensions, Image, Text, View } from 'react-native';
import { 
  GenericCarouselWrapper, 
  GenericCarouselFlatlist 
} from '../../../common/components/GenericCarousel';
import GenericCarouselPagination from '../../../common/components/GenericCarousel/GenericCarouselPagination';
import tw from '../../../common/tailwind';
import { h2TextStyle, subheadSmallUppercase } from '../../../theme/typography';
import { Savings } from '../types';

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth - 80;
const itemWidth = windowWidth - 80;
const flexRow = 'flex-row justify-between items-center mt-4';

export default function SavingsCarousel({ items }: { items: Savings[] }) {
  const [activeDotIndex, setActiveDotIndex] = useState<number>(0);

  return (
    <GenericCarouselWrapper style={tw.style(`relative overflow-hidden`)}>
      <GenericCarouselFlatlist
        contentContainerStyle={tw.style('pl-10 pr-9')}
        data={items}
        renderItem={({ item }) => {
          if (!item.type) {
            return <View style={{ width: itemWidth }} />;
          }

          return (
            <View style={{ width: itemWidth }}>
              <Animated.View style={[tw.style(`mr-1`)]}>
                <View
                  style={tw.style(
                    'items-center rounded-2lg border border-eggplant-light bg-white p-2.5',
                  )}
                >
                  <Image
                    style={tw.style('h-[90px]')}
                    resizeMode="contain"
                    source={item.image?.uri as any}
                    accessibilityIgnoresInvertColors
                  />
                  <Text style={tw.style(h2TextStyle, 'text-center')}>
                    {item.saved}
                  </Text>
                  <Text
                    style={tw.style(
                      subheadSmallUppercase,
                      'pb-2.5 text-center text-stone',
                    )}
                  >
                    {item.type === 'food'
                      ? `Potential less waste`
                      : `Potential ${item.type} saved`}
                  </Text>
                  <View
                    style={tw.style(
                      'w-full items-center rounded-lg bg-mint',
                      item.isBest ? 'bg-mint' : 'bg-strokecream',
                    )}
                  >
                    <Text style={tw.style(subheadSmallUppercase, 'py-1')}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </View>
          );
        }}
        getCurrentIndex={setActiveDotIndex}
        itemLength={itemLength}
      />

      <View style={tw.style(flexRow, 'px-10')}>
        <GenericCarouselPagination
          items={items}
          dotSpacing={4}
          dotSize={4}
          activeDotColor="creme"
          inactiveDotColor="creme/60"
          currentIndex={activeDotIndex}
        />
        {/* <Feather
          name="arrow-right"
          size={20}
          color={tw.color('eggplant-light')}
        /> */}
      </View>
    </GenericCarouselWrapper>
  );
}
