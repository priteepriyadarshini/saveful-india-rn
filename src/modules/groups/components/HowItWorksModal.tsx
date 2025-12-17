import GenericCarouselFlatlist from '../../../common/components/GenericCarousel/GenericCarouselFlatlist';
import GenericCarouselPagination from '../../../common/components/GenericCarousel/GenericCarouselPagination';
import tw from '../../../common/tailwind';
import ModalComponent from '../../../modules/groups/components/ModalComponent';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import {
  bodySmallBold,
  bodySmallRegular,
  subheadLargeUppercase,
} from '../../../theme/typography';

const screenWidth = Dimensions.get('window').width;
const itemLength = screenWidth - 40;

const DATA = [
  {
    id: 0,
    title: 'Create groups',
    image: require('../../../../assets/groups/tutorial-create.png'),
    description:
      'Get your family, friends, school, workplace or any group together and see how much food you can save together. You can even set up challenges and see who’s the most saveful!',
  },
  {
    id: 1,
    title: 'Join groups',
    image: require('../../../../assets/groups/tutorial-join.png'),
    description:
      'You can also join groups created by others. To do this, you’ll need to be sent an invite code from either the person that created the group, or an existing group member.',
  },
  {
    id: 2,
    title: 'Save together',
    image: require('../../../../assets/groups/tutorial-challenge.png'),
    description:
      'Once you’re in a group, you can take part in challenges. Groups can set a target and a timeframe and work together to meet (or exceed) the amount of meals they cook.',
  },
];

export default function HowItWorksModal() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<any>>(null);

  const scrollCarousel = (offset: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset, animated: true });
    }
  };

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentSlideSize =
        screenWidth || event.nativeEvent.layoutMeasurement.width;
      const index = event.nativeEvent.contentOffset.x / currentSlideSize;
      const roundIndex = Math.round(index);

      setCurrentIndex(roundIndex);
    },
    [],
  );

  return (
    <>
      {/* Modal trigger button */}
      <Pressable
        onPress={() => {
          setIsModalVisible(true);
        }}
        style={tw.style('flex-row items-center justify-center pt-2')}
      >
        <Text
          style={[
            tw.style(
              subheadLargeUppercase,
              'uppercase text-eggplant underline',
            ),
          ]}
        >
          See how it works
        </Text>
      </Pressable>

      {/* Modal */}
      <ModalComponent
        heading=""
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        primaryButton={{
          text: currentIndex < DATA.length - 1 ? 'Next' : 'Got it',
          onPress: async () => {
            if (currentIndex < DATA.length - 1) {
              scrollCarousel((currentIndex + 1) * itemLength);
            } else {
              setIsModalVisible(false);
              setCurrentIndex(0);
              scrollCarousel(0);
            }
          },
        }}
        horizontalPadding={false}
      >
        <View style={tw`mb-8`}>
          <View style={tw.style('mt-4 w-full items-center')}>
            <GenericCarouselFlatlist
              flatListRef={flatListRef}
              data={DATA}
              scrollEnabled={true}
              itemLength={itemLength}
              onScroll={onScroll}
              renderItem={({ item }) => (
                <View style={tw.style(`w-[${itemLength}px]`)}>
                  <Image
                    resizeMode="contain"
                    style={tw`h-[${
                      ((Dimensions.get('screen').width - 40) * 183) / 332
                    }px] w-[${Dimensions.get('screen').width - 40}px] mx-auto`}
                    source={item.image}
                  />
                  <View style={tw.style('p-4')}>
                    <Text
                      style={[
                        tw.style(bodySmallBold, 'pb-2 text-center uppercase'),
                        { letterSpacing: 1 },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={tw.style(
                        bodySmallRegular,
                        'text-center text-midgray',
                      )}
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>
              )}
              getCurrentIndex={setCurrentIndex}
            />
          </View>
          <GenericCarouselPagination
            items={DATA}
            dotSpacing={4}
            dotSize={4}
            activeDotColor="eggplant"
            inactiveDotColor="eggplant/60"
            currentIndex={currentIndex}
          />
        </View>
      </ModalComponent>
    </>
  );
}
