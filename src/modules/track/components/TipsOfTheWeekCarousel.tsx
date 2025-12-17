import React from 'react';
import { Dimensions, Pressable, Text, View, ViewStyle } from 'react-native';
import { 
  GenericCarouselWrapper, 
  GenericCarouselFlatlist 
} from '../../../common/components/GenericCarousel';
import tw from '../../../common/tailwind';
import { subheadLargeUppercase, bodySmallRegular } from '../../../theme/typography';


interface RenderItemProps {
  id: number;
  title: string;
  description: string;
  links: string;
  linkTo: string;
  customItemLength?: number;
}

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth - 40;

function TipsOfTheWeekCard({
  title,
  description,
  links,
  customItemLength,
}: RenderItemProps) {
  return (
    <View style={{ width: customItemLength ?? itemLength }}>
      <View
        style={tw`mr-2 items-center rounded-md bg-mint px-[25px] pb-5 pt-4`}
      >
        <Text style={tw.style(subheadLargeUppercase, 'text-center text-base')}>
          {title}
        </Text>
        <View style={tw.style('my-2.5 w-full border-b border-kale')} />
        <Text style={tw.style(bodySmallRegular)}>{description}</Text>

        {links && (
          <Pressable style={tw.style('w-full')} onPress={() => {}}>
            <Text style={tw.style(bodySmallRegular, 'pt-4 underline')}>
              {links}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function TipsOfTheWeekCarousel({
  item,
  theme = 'light',
  containerStyle,
  carouselStyle,
  customItemLength,
}: {
  item: any;
  theme?: string;
  containerStyle?: ViewStyle;
  carouselStyle?: ViewStyle;
  customItemLength?: number;
}) {
  // const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  return (
    <View style={tw.style('py-8')}>
      <View style={tw.style('mx-5 pb-2.5', containerStyle)}>
        <Text
          style={tw.style(
            subheadLargeUppercase,
            'text-center',
            theme === 'dark' ? 'text-black' : 'text-midgray',
          )}
        >
          Tips for the week ahead
        </Text>
      </View>
      <GenericCarouselWrapper style={tw.style(`relative overflow-hidden`)}>
        <GenericCarouselFlatlist
          section={'Tips of the Week'}
          contentContainerStyle={tw.style('pl-5 pr-3', carouselStyle)}
          data={item}
          itemLength={customItemLength ?? itemLength}
          renderItem={(renderItem: {
            item: RenderItemProps;
            index: number;
          }) => (
            <TipsOfTheWeekCard
              {...renderItem.item}
              customItemLength={customItemLength}
            />
          )}
          // getCurrentIndex={setCurrentIndex}
        />
        {/* <View style={tw`mx-5 flex-row items-center justify-between py-5`}>
          <GenericCarouselPagination
            items={item}
            dotSpacing={4}
            dotSize={4}
            activeDotColor="eggplant"
            inactiveDotColor="eggplant/60"
            currentIndex={currentIndex}
          />
          <Feather name="arrow-right" size={20} color={tw.color('kale')} />
        </View> */}
      </GenericCarouselWrapper>
    </View>
  );
}
