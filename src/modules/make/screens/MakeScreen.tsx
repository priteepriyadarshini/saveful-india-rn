import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import SkeletonLoader from '../../../common/components/SkeletonLoader';
import tw from '../../../common/tailwind';
import { mixpanelEventName } from '../../analytics/analytics';
import FeedSearchBarHeader from '../../feed/components/FeedSearchBarHeader';
import MakeHeader from '../components/MakeHeader';
import Filters from '../components/Filters';
import MealCard from '../components/MealCard';
import useMeals from '../hooks/useMeals';
import { IFramework } from '../../../models/craft';
import { InitialNavigationStackParams } from '../../navigation/navigator/InitialNavigator';

const windowWidth = Dimensions.get('window').width;
const ITEM_HEIGHT = 350; // estimated height of a MealCard

export default function MakeScreen() {
  const navigation = useNavigation<InitialNavigationStackParams<'Ingredients'>['navigation']>();

  const { sendAnalyticsEvent, sendScrollEventInitiation } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const onSearchTapped = useCallback(() => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: mixpanelEventName.searchbarPressed,
      },
    });
    navigation.navigate('Ingredients', {
      screen: 'IngredientsHome',
      params: undefined,
    });
  }, [navigation, newCurrentRoute, sendAnalyticsEvent]);

  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);
  const { frameworks, isLoading } = useMeals(selectedFilters);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      sendScrollEventInitiation(event, 'Make Page Interacted');
    },
    [sendScrollEventInitiation],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<IFramework>) => (
      <View style={tw`px-5 py-1`}>
        <MealCard key={item.id} {...item} />
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: IFramework) => item.id, []);

  const skeletonStyles = useMemo(
    () => [`mb-3 h-[311px] w-[${windowWidth - 40}px] overflow-hidden rounded`],
    [],
  );

  const ListHeader = useCallback(
    () => (
      <>
        <View style={tw`relative z-10`}>
          <Image
            style={tw`absolute top-0 w-[${windowWidth}px] h-[${(windowWidth * 241) / 375}px]`}
            resizeMode="contain"
            source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/placeholder/make-bg.png' }}
            accessibilityIgnoresInvertColors
          />
          <SafeAreaView style={tw`pt-[25px]`}>
            <FeedSearchBarHeader
              onPress={onSearchTapped}
              title="What Are you USING UP?"
            />
            <View style={tw`mt-5`}>
              <Image
                style={tw`w-[${windowWidth}px] h-[${
                  (windowWidth * 184) / 375
                }px]`}
                resizeMode="contain"
                source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/placeholder/this-plus-that.png' }}
                accessibilityIgnoresInvertColors
              />
            </View>
          </SafeAreaView>
        </View>

        <View style={tw`bg-creme`}>
          <MakeHeader />

          <Filters
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </View>

        {/* Show skeleton while loading */}
        {isLoading && (
          <View style={tw`flex-row flex-wrap justify-center pt-5`}>
            {Array.from(Array(2).keys()).map((_, index: number) => (
              <View key={index}>
                <SkeletonLoader styles={skeletonStyles} />
              </View>
            ))}
          </View>
        )}
      </>
    ),
    [onSearchTapped, selectedFilters, setSelectedFilters, isLoading, skeletonStyles],
  );

  return (
    <View style={tw`relative flex-1 bg-creme`}>
      <FlashList
        data={isLoading ? [] : frameworks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={ITEM_HEIGHT}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll as any}
        contentContainerStyle={{ paddingBottom: 20 } as any}
      />

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
