import TextBoxInput from '../../../common/components/Form/TextBoxInput';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../common/tailwind';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import {
  bodyLargeMedium,
  bodyLargeRegular,
  bodyMediumRegular,
  h2TextStyle,
  subheadLarge,
  subheadLargeUppercase,
  subheadMedium,
  subheadSmall,
} from '../../../theme/typography';

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth * 1;
const itemWidth = (windowWidth - itemLength) / 2;

export default function PostOnboardingCarousel({
  data,
  activeDotIndex,
  setActiveDotIndex,
  flatListRef,
  scrollToItem,
  setIsPostOnboardSet,
}: {
  data: any;
  activeDotIndex: number;
  setActiveDotIndex: (activeDotIndex: number) => void;
  flatListRef: any;
  scrollToItem: (index: number) => void;
  setIsPostOnboardSet: (value: boolean) => void;
}) {
  // const linkTo = useLinkTo();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [dataWithPlaceholders, setDataWithPlaceholders] = useState<any>(data);
  const currentIndex = useRef<number>(0);
  const [frequentFlyerNumber, setFrequentFlyerNumber] = useState<string>();
  const [staffNumber, setStaffNumber] = useState<string>();
  const [surname, setSurname] = useState<string>();

  useEffect(() => {
    setDataWithPlaceholders([{ id: -1 } as any, ...data, { id: data?.length }]);
    currentIndex.current = 1;
  }, [data]);

  useEffect(() => {
    scrollX.addListener(event => {
      const index = Math.round(event.value / itemLength);
      setActiveDotIndex(index);
    });
    return () => {
      scrollX.removeAllListeners();
    };
  }, [scrollX, setActiveDotIndex]);

  const getItemLayout = (_data: any, index: number) => ({
    length: itemLength,
    offset: itemLength * (index - 1),
    index,
  });

  const renderContent = (value: number, item: any) => {
    switch (value) {
      case 0:
        return (
          <View style={tw`px-5`}>
            <View style={tw.style('items-center')}>
              <Text style={tw.style(h2TextStyle, 'mt-6 text-center')}>
                {item.heading}
              </Text>
              <Text
                style={tw.style(
                  bodyLargeRegular,
                  'mt-2 text-center text-midgray',
                )}
              >
                {item.subHeading}
              </Text>
            </View>
            <View
              style={[
                tw.style(
                  'mt-[80px] rounded-[13px] border border-eggplant-light bg-radish p-3',
                ),
                cardDrop,
              ]}
            >
              <View style={tw.style('flex-row justify-between')}>
                <Text>Saveful</Text>
                <Text>now</Text>
              </View>
              <Text style={tw.style('pt-2 text-[15px] font-bold')}>
                It’s challenge time
              </Text>
              <Text style={tw.style('pt-1 text-[15px]')}>
                Let’s cook something wildly delicious with what you have in
                30min or less.
              </Text>
            </View>
            {/* <Image
              style={tw`w-full overflow-hidden`}
              resizeMode="contain"
              source={item.image.uri}
              accessibilityIgnoresInvertColors
            /> */}
          </View>
        );
      case 1:
        return (
          <View style={tw`px-5`}>
            <Image
              style={tw`w-full overflow-hidden`}
              resizeMode="contain"
              source={item.image.uri}
              accessibilityIgnoresInvertColors
            />
            <View style={tw.style('items-center')}>
              <Text style={tw.style(subheadLarge, 'mt-6 text-center')}>
                {item.heading}
              </Text>
              <Text
                style={tw.style(
                  subheadSmall,
                  'mb-2.5 mt-2 text-center text-midgray',
                )}
              >
                {item.subHeading}
              </Text>
              <View>
                {item.contentList.map((content: any) => {
                  return (
                    <View
                      key={content.id}
                      style={tw.style('items-center pt-8')}
                    >
                      <Text style={tw.style(subheadLargeUppercase)}>
                        {content.heading}
                      </Text>
                      <Text
                        style={tw.style(
                          bodyMediumRegular,
                          'mt-1.5 text-center text-midgray',
                        )}
                      >
                        {content.subHeading}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={tw`px-5`}>
            <View style={tw.style('items-center')}>
              <Text style={tw.style(subheadMedium, 'mt-6 text-center')}>
                {item.heading}
              </Text>
              <Text
                style={tw.style(
                  bodyLargeRegular,
                  'mb-2.5 mt-2 text-center text-midgray',
                )}
              >
                {item.subHeading}
              </Text>
              <View
                style={[
                  tw.style(
                    'px-4.5 mt-6 w-full rounded-[10px] border border-strokecream bg-white py-6',
                  ),
                  cardDrop,
                ]}
              >
                <Image
                  style={tw`w-full overflow-hidden`}
                  resizeMode="contain"
                  source={item.image.uri}
                  accessibilityIgnoresInvertColors
                />
                <Text
                  style={tw.style(bodyMediumRegular, 'mb-5 mt-1.5 text-center')}
                >
                  Enjoy the benefits of being green. Earn a Green Leaf and more
                  Qantas points.
                </Text>
                <View style={tw`gap-5`}>
                  <TextBoxInput
                    heading="qantas frequent flYer number"
                    placeholder={'Enter something here'}
                    value={frequentFlyerNumber}
                    onChangeText={setFrequentFlyerNumber}
                  />
                  <TextBoxInput
                    heading="qantas staff code (optional)"
                    placeholder={'Enter something here'}
                    value={staffNumber}
                    onChangeText={setStaffNumber}
                  />
                  <TextBoxInput
                    heading="Your surname"
                    placeholder={'Enter something here'}
                    value={surname}
                    onChangeText={setSurname}
                  />
                </View>
              </View>
            </View>
          </View>
        );
      default:
        return <Text>No Content Available</Text>;
    }
  };

  return (
    <View style={tw`flex-1 justify-between pt-5`}>
      <ScrollView contentContainerStyle={tw`pb-5.5`}>
        <FlatList
          ref={flatListRef}
          data={dataWithPlaceholders}
          renderItem={({ item }) => {
            if (!item.heading) {
              return <View style={{ width: itemWidth }} />;
            }
            return (
              <View
                style={tw`w-[${Dimensions.get('window').width}px]`}
                key={item.id}
              >
                {renderContent(item.id, item)}
              </View>
            );
          }}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          decelerationRate={0}
          getItemLayout={getItemLayout}
          renderToHardwareTextureAndroid
          contentContainerStyle={tw.style(`mb-3 content-center`)}
          snapToInterval={itemLength}
          snapToAlignment="start"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 100,
          }}
        />
      </ScrollView>

      <View style={tw`mb-2.5 w-full items-center gap-1.5 px-5`}>
        <PrimaryButton
          buttonSize="large"
          onPress={() => {
            if (activeDotIndex < data.length - 1) {
              scrollToItem(activeDotIndex + 1);
            } else {
              setIsPostOnboardSet(true);
            }
          }}
          width="full"
        >
          {data[activeDotIndex].buttonText}
        </PrimaryButton>
        <Pressable
          onPress={() => {
            if (data[activeDotIndex].id === 0) {
              scrollToItem(activeDotIndex + 1);
            } else {
              setIsPostOnboardSet(true);
              // linkTo('/feed');
            }
          }}
          style={tw.style('pt-5')}
        >
          <Text
            style={[
              tw.style(
                data[activeDotIndex].id === 0
                  ? bodyLargeMedium
                  : subheadLargeUppercase,
              ),
              { letterSpacing: 1 },
            ]}
          >
            {data[activeDotIndex].id === 0 ? 'No thanks' : 'SKIP'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
