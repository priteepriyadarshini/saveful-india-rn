import React, { useEffect, useRef } from 'react';
import { Animated, FlatListProps } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import tw from '../../tailwind';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';

interface EventProps {
  section?: string;
  flatListRef?: any;
}

interface GenericCarouselFlatlistProps<T> extends FlatListProps<T>, EventProps {
  slideSize?: number;
  getCurrentIndex?: (index: number) => void;
  itemLength: number;
}

export default function GenericCarouselFlatlist<T>(
  props: GenericCarouselFlatlistProps<T>,
) {
  const {
    contentContainerStyle,
    data,
    renderItem,
    ListFooterComponent,
    //slideSize,
    getCurrentIndex,
    itemLength,
    section,
    flatListRef,
  } = props;

  const [hasScrolled, setHasScrolled] = React.useState(false);
  const { newCurrentRoute } = useCurentRoute();
  const { sendAnalyticsEvent } = useAnalytics();

  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scrollX.addListener(event => {
      const index = Math.round(event.value / itemLength);
      if (getCurrentIndex) getCurrentIndex(index);

      if (index > 0 && !hasScrolled) {
        sendAnalyticsEvent({
          event: mixpanelEventName.actionInteracted,
          properties: {
            location: newCurrentRoute,
            action: `${section} Scrolled`,
          },
        });
        setHasScrolled(true);
      }
    });

    return () => {
      scrollX.removeAllListeners();
    };
  }, [
    getCurrentIndex,
    hasScrolled,
    itemLength,
    newCurrentRoute,
    scrollX,
    section,
    sendAnalyticsEvent,
  ]);

  const getItemLayout = (_data: any, index: number) => ({
    length: itemLength,
    offset: itemLength * (index - 1),
    index,
  });

  return (
    <FlatList
      {...props}
      ref={flatListRef}
      contentContainerStyle={contentContainerStyle}
      style={tw`grow-0`}
      data={data}
      renderItem={renderItem}
      bounces={false}
      decelerationRate={0}
      getItemLayout={getItemLayout}
      renderToHardwareTextureAndroid
      snapToInterval={itemLength}
      snapToAlignment="start"
      horizontal
      automaticallyAdjustContentInsets={false}
      showsHorizontalScrollIndicator={false}
      ListFooterComponent={ListFooterComponent}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
          useNativeDriver: false,
        },
      )}
      scrollEventThrottle={16}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 100,
      }}
    />
  );
}
