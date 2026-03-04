import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
import { useGetCurrentUserQuery } from '../../auth/api';

const windowWidth = Dimensions.get('window').width;

interface MakeListHeaderProps {
  onSearchTapped: () => void;
  selectedFilters: string[];
  setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>;
  selectedDietaryFilters: string[];
  setSelectedDietaryFilters: React.Dispatch<React.SetStateAction<string[]>>;
  activeDietaryKeys: string[];
  isLoading: boolean;
  skeletonStyles: string[];
}

const MakeListHeader = React.memo(function MakeListHeader({
  onSearchTapped,
  selectedFilters,
  setSelectedFilters,
  selectedDietaryFilters,
  setSelectedDietaryFilters,
  activeDietaryKeys,
  isLoading,
  skeletonStyles,
}: MakeListHeaderProps) {
  return (
    <>
      <View style={tw`relative z-10`}>
        <Image
          style={tw`absolute top-0 w-[${windowWidth}px] h-[${(windowWidth * 241) / 375}px]`}
          resizeMode="contain"
          source={require('../../../../assets/placeholder/make-bg.png')}
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
              source={require('../../../../assets/placeholder/this-plus-that.png')}
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
          selectedDietaryFilters={selectedDietaryFilters}
          setSelectedDietaryFilters={setSelectedDietaryFilters}
          activeDietaryKeys={activeDietaryKeys}
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
  );
});

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
  const [selectedDietaryFilters, setSelectedDietaryFilters] = React.useState<string[]>([]);
  const { frameworks, isLoading } = useMeals(selectedFilters, selectedDietaryFilters);

  // ─── Derive dietary keys from user profile & auto-sync once ───
  const { data: currentUser } = useGetCurrentUserQuery();

  const activeDietaryKeys = useMemo(() => {
    const keys: string[] = [];
    if (!currentUser) return keys;
    const vType = currentUser.vegType ?? currentUser.dietary_profile?.veg_type;
    if (vType === 'VEGAN') keys.push('vegan');
    else if (vType === 'VEGETARIAN') keys.push('vegetarian');
    if (currentUser.dairyFree ?? currentUser.dietary_profile?.dairy_free) keys.push('dairyFree');
    if (currentUser.glutenFree ?? currentUser.dietary_profile?.gluten_free) keys.push('glutenFree');
    if (currentUser.nutFree ?? currentUser.dietary_profile?.nut_free) keys.push('nutFree');
    if (currentUser.hasDiabetes ?? currentUser.dietary_profile?.has_diabetes) keys.push('diabetes');
    return keys;
  }, [currentUser]);

  const dietarySynced = useRef(false);
  useEffect(() => {
    if (!dietarySynced.current && activeDietaryKeys.length > 0) {
      setSelectedDietaryFilters(activeDietaryKeys);
      dietarySynced.current = true;
    }
  }, [activeDietaryKeys]);

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

  // Render the header as a JSX element with a stable component type.
  // MakeListHeader is defined at module level → its identity never changes →
  // FlashList will never unmount/remount the header tree on re-renders.
  const listHeader = useMemo(
    () => (
      <MakeListHeader
        onSearchTapped={onSearchTapped}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        selectedDietaryFilters={selectedDietaryFilters}
        setSelectedDietaryFilters={setSelectedDietaryFilters}
        activeDietaryKeys={activeDietaryKeys}
        isLoading={isLoading}
        skeletonStyles={skeletonStyles}
      />
    ),
    [onSearchTapped, selectedFilters, setSelectedFilters, selectedDietaryFilters, setSelectedDietaryFilters, activeDietaryKeys, isLoading, skeletonStyles],
  );

  return (
    <View style={tw`relative flex-1 bg-creme`}>
      <FlashList
        data={isLoading ? [] : frameworks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll as any}
        contentContainerStyle={{ paddingBottom: 20 } as any}
      />

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
