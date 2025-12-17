import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  GenericCarouselFlatlist,
  GenericCarouselWrapper,
} from '../../../common/components/GenericCarousel';
import GenericCarouselPagination from '../../../common/components/GenericCarousel/GenericCarouselPagination';
import tw from '../../../common/tailwind';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import HackOrTip from '../../../modules/prep/components/HackOrTip';
import { IDescription } from '../../../modules/prep/types';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import React, { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import RenderHTML from 'react-native-render-html';
import { cardDrop } from '../../../theme/shadow';
import {
  bodyLargeBold,
  bodyMediumBold,
  bodyMediumRegular,
  bodySmallRegular,
  h7TextStyle,
  subheadMediumUppercase,
  tagStyles,
} from '../../../theme/typography';

const itemLength = Dimensions.get('window').width - 40;

export default function PrepCarousel({
  frameworkId,
  frameworkName,
  shortDescription,
  description,
  freezeKeepTime,
  fridgeKeepTime,
  hackOrTip,
}: {
  frameworkId: string;
  frameworkName: string;
  shortDescription: string;
  description: string | null;
  freezeKeepTime: string;
  fridgeKeepTime: string;
  hackOrTip: {
    id: string;
  }[];
}) {
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const [activeDotIndex, setActiveDotIndex] = useState<number>(0);
  const [maxHeight, setMaxHeight] = useState<number>(0);

  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ['1%', '90%'], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: mixpanelEventName.prepCarouselRead,
        meal_id: frameworkId,
        mead_name: frameworkName,
      },
    });
    bottomSheetModalRef.current?.present();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomSheetModalRef]);
  const handlePresentModalDismiss = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, [bottomSheetModalRef]);

  /* https://github.com/gorhom/react-native-bottom-sheet/issues/1560#issuecomment-1750466864
  Added fixes for ios / android users who uses reduce motion */
  const reducedMotion = useReducedMotion();

  const data = [
    {
      id: 0,
      title: 'ABOUT THIS DISH',
      type: 'about',
      readMore: {
        readMoreTitle: 'About this meal',
        readMoreSubTitle: shortDescription,
        readMoreDescription: description,
      },
      description: shortDescription,
    },
    ...hackOrTip.map(item => ({
      type: 'hackOrTip',
      ...item,
    })),
    {
      id: 2,
      title: 'SAVING THIS DISH',
      type: 'save',
      uri: require('../../../../assets/placeholder/fridge.png'),
      description: [
        {
          title: 'In the freezer',
          description: freezeKeepTime,
        },
        {
          title: 'In the fridge',
          description: fridgeKeepTime,
        },
      ],
    },
  ];

  return (
    <GenericCarouselWrapper style={tw.style(`relative overflow-hidden pb-4`)}>
      <GenericCarouselFlatlist
        section={'Prep'}
        contentContainerStyle={tw`pb-4 pl-5 pr-3`}
        data={data}
        renderItem={({ item }: any) => {
          if (item.type === 'hackOrTip') {
            return (
              <View style={{ width: itemLength }}>
                <Animated.View style={[tw.style(`mr-2`)]}>
                  <HackOrTip
                    id={item.id}
                    maxHeight={maxHeight}
                    setMaxHeight={setMaxHeight}
                  />
                </Animated.View>
              </View>
            );
          }

          return (
            <View style={{ width: itemLength }}>
              <Animated.View style={[tw.style(`mr-2`)]}>
                <View
                  style={[
                    tw.style(
                      `border ${
                        item.borderColor ? 'border-kale' : 'border-strokecream'
                      } bg-${
                        item.backgroundColor ? item.backgroundColor : 'white'
                      } px-4.5 min-h-[225px] rounded-lg py-6 min-h-[${maxHeight}px]`,
                    ),
                    cardDrop,
                  ]}
                  onLayout={event => {
                    const height = event.nativeEvent.layout.height;
                    if (setMaxHeight && height > maxHeight) {
                      setMaxHeight(height);
                    }
                  }}
                >
                  <View
                    style={tw.style(
                      `${item.icon ? 'flex-row justify-center' : 'flex'}`,
                    )}
                  >
                    {item.icon && (
                      <Feather
                        style={tw.style(`mr-2.5`)}
                        name={item.icon}
                        size={23}
                        color="black"
                      />
                    )}

                    <Text style={tw.style(`text-center`, h7TextStyle)}>
                      {item.title}
                    </Text>
                  </View>
                  <View
                    style={tw.style(
                      `border-b ${
                        item.borderColor
                          ? `border-${item.borderColor}`
                          : 'border-strokecream'
                      } pt-2.5`,
                    )}
                  />
                  {item.uri ? (
                    <Fragment>
                      <View style={tw.style('relative flex-row pt-2.5')}>
                        <Image
                          resizeMode="contain"
                          source={item.uri}
                          accessibilityIgnoresInvertColors
                        />
                        <View style={tw.style('max-w-[200px]')}>
                          {item.description.map(
                            (item: IDescription, index: number) => {
                              return (
                                <View
                                  key={index}
                                  style={tw.style(
                                    `${
                                      index === 0 ? 'pt-[4.93px]' : 'pt-4'
                                    } flex-col items-start pl-5`,
                                  )}
                                >
                                  <Text style={tw.style(bodyMediumBold)}>
                                    {item.title}
                                  </Text>
                                  <Text
                                    style={tw.style(
                                      bodySmallRegular,
                                      'pt-1 text-stone',
                                    )}
                                  >
                                    {item.description}
                                  </Text>
                                </View>
                              );
                            },
                          )}
                        </View>
                      </View>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <View style={tw.style('pt-2.5')}>
                        <Text style={tw.style(bodyMediumRegular)}>
                          {item.description}
                        </Text>
                      </View>
                      {item.readMore && (
                        <Pressable
                          onPress={handlePresentModalPress}
                          style={tw.style(
                            'mx-auto mt-3.5 rounded-full bg-strokecream px-4 py-1',
                          )}
                        >
                          <Text style={tw.style(subheadMediumUppercase)}>
                            Read more
                          </Text>
                        </Pressable>
                      )}
                    </Fragment>
                  )}
                </View>
              </Animated.View>

              {item.readMore && (
                <BottomSheetModal
                  ref={bottomSheetModalRef}
                  index={1}
                  animateOnMount={!reducedMotion}
                  snapPoints={snapPoints}
                  containerStyle={{ backgroundColor: 'rgba(26, 26, 27, 0.7)' }}
                  // onChange={handleSheetChanges}
                  style={tw.style(
                    'overflow-hidden rounded-2.5xl border border-strokecream',
                  )}
                  handleStyle={tw.style('hidden')}
                  enableContentPanningGesture={false}
                >
                  <ScrollView style={tw.style('px-5')}>
                    <View style={tw.style('items-end py-4')}>
                      <Pressable onPress={handlePresentModalDismiss}>
                        <Feather name={'x'} size={16} color="black" />
                      </Pressable>
                    </View>
                    <View style={tw.style('items-center justify-center')}>
                      <Text style={tw.style(h7TextStyle)}>
                        {item.readMore.readMoreTitle}
                      </Text>
                    </View>
                    <View style={tw.style('pb-[50px] pt-[22px]')}>
                      <Text style={tw.style(bodyLargeBold, 'text-stone')}>
                        {item.readMore.readMoreSubTitle}
                      </Text>
                      <RenderHTML
                        source={{
                          html: item.readMore.readMoreDescription || '',
                        }}
                        contentWidth={Dimensions.get('window').width - 40}
                        tagsStyles={tagStyles}
                        defaultViewProps={{
                          style: tw`m-0 p-0`,
                        }}
                        defaultTextProps={{
                          style: tw.style(
                            bodyMediumRegular,
                            'pt-2.5 text-stone',
                          ),
                        }}
                      />
                    </View>
                  </ScrollView>
                </BottomSheetModal>
              )}
            </View>
          );
        }}
        getCurrentIndex={setActiveDotIndex}
        itemLength={itemLength}
      />
      <View style={tw`mx-5`}>
        <GenericCarouselPagination
          items={data}
          dotSpacing={4}
          dotSize={4}
          activeDotColor="eggplant"
          inactiveDotColor="eggplant/60"
          currentIndex={activeDotIndex}
        />
      </View>
    </GenericCarouselWrapper>
  );
}
