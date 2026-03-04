import Pill from '../../../common/components/Pill';
import SkeletonLoader from '../../../common/components/SkeletonLoader';
import tw from '../../../common/tailwind';
import { ICategory } from '../../../models/craft';
import { mixpanelEventName } from '../../analytics/analytics';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import { frameworkCategoryApiService } from '../../frameworkCategory/api/frameworkCategoryApiService';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, Text, View } from 'react-native';
import { subheadMediumUppercase } from '../../../theme/typography';

interface DietaryTag {
  key: string;
  label: string;
}

const DIETARY_TAGS: DietaryTag[] = [
  { key: 'vegan', label: 'Vegan' },
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'dairyFree', label: 'Dairy-Free' },
  { key: 'glutenFree', label: 'Gluten-Free' },
  { key: 'nutFree', label: 'Nut-Free' },
  { key: 'diabetes', label: 'Diabetic-Friendly' },
];

export default function Filters({
  selectedFilters,
  setSelectedFilters,
  selectedDietaryFilters,
  setSelectedDietaryFilters,
  activeDietaryKeys = [],
}: {
  selectedFilters: string[];
  setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>;
  selectedDietaryFilters: string[];
  setSelectedDietaryFilters: React.Dispatch<React.SetStateAction<string[]>>;
  activeDietaryKeys?: string[];
}) {
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const [isActive, setIsActive] = React.useState<boolean>(false);
  const animProgress = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const measuredRef = useRef(false);

  const toggleFilters = (value: boolean) => {
    setIsActive(value);
    Animated.timing(animProgress, {
      toValue: value ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const onContentLayout = useCallback((e: any) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && !measuredRef.current) {
      measuredRef.current = true;
      setContentHeight(h);
    }
  }, []);

  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const toggleDietaryKey = (key: string) => {
    setSelectedDietaryFilters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );
  };

  const extractId = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value?.$oid) return value.$oid;
    if (value?._id) return typeof value._id === 'string' ? value._id : value._id.$oid || value._id.toString();
    return value?.toString() || '';
  };

  const getCategoriesData = async () => {
    try {
      const frameworkCategories = await frameworkCategoryApiService.getAllCategories();
      
      const convertedCategories: ICategory[] = frameworkCategories.map(cat => ({
        id: extractId(cat._id as any),
        title: cat.title,
        groupHandle: 'framework',
        groupId: 'framework-group',
        uid: extractId(cat._id as any),
        heroImage: cat.heroImageUrl ? [{
          id: `${extractId(cat._id as any)}-hero`,
          title: cat.title,
          url: cat.heroImageUrl,
          uid: `${extractId(cat._id as any)}-hero-uid`
        }] : undefined,
        image: cat.iconImageUrl ? [{
          id: `${extractId(cat._id as any)}-icon`,
          title: cat.title,
          url: cat.iconImageUrl,
          uid: `${extractId(cat._id as any)}-icon-uid`
        }] : undefined,
      }));

      setCategories(convertedCategories);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching framework categories from new API:', error);
      setCategories([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCategoriesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isActive) {
      sendAnalyticsEvent({
        event: mixpanelEventName.actionClicked,
        properties: {
          location: newCurrentRoute,
          action: mixpanelEventName.filterOpened,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => {
    if (isActive && selectedFilters.length > 0) {
      const filtered = categories.filter(dish =>
        selectedFilters.includes(dish.id),
      );
      filtered.map(dish => {
        sendAnalyticsEvent({
          event: mixpanelEventName.actionClicked,
          properties: {
            location: newCurrentRoute,
            action: mixpanelEventName.filterOpened,
            dish_id: dish.id,
            dish_title: dish.title,
          },
        });
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters]);

  const skeletonStyles = ['w-[100px] h-6.5 rounded-full'];

  if (isLoading || !categories.length) {
    return (
      <View style={tw`w-full items-center px-5 py-4`}>
        <SkeletonLoader styles={skeletonStyles} />
      </View>
    );
  }

  return (
    <View style={tw`w-full items-center px-5 py-4`}>
      <View>
        <Pill
          text={isActive ? 'Hide filters' : 'Show filters'}
          size="large"
          isActive={isActive}
          setIsActive={value => {
            toggleFilters(value);
          }}
        />
      </View>
      {contentHeight === 0 && (
        <View
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          onLayout={onContentLayout}
        >
          <View style={tw`w-full flex-row flex-wrap items-center justify-center gap-1`}>
            {categories.map((item, index) => (
              <Pill key={index} text={item.title} size="small" isActive={false} setIsActive={() => {}} />
            ))}
          </View>
          <View style={tw`mt-3 w-full`}>
            <View style={tw`flex-row items-center gap-1.5 mb-2 justify-center`}>
              <Text style={tw.style(subheadMediumUppercase)}>Dietary filters</Text>
            </View>
            <View style={tw`gap-2 flex-row flex-wrap justify-center`}>
              {DIETARY_TAGS.map(tag => (
                <Pill key={tag.key} text={tag.label} size="small" isActive={false} setIsActive={() => {}} />
              ))}
            </View>
          </View>
        </View>
      )}

      <Animated.View
        style={{
          height: contentHeight > 0
            ? animProgress.interpolate({ inputRange: [0, 1], outputRange: [0, contentHeight + 10] })
            : 0,
          opacity: animProgress,
          overflow: 'hidden' as const,
        }}
      >
        <View
          style={[tw`w-full flex-row flex-wrap items-center justify-center gap-1`, { paddingTop: 10 }]}
        >
          {categories.map((item, index) => (
            <Pill
              key={index}
              text={item.title}
              size="small"
              isActive={selectedFilters.includes(item.id)}
              setIsActive={value => {
                if (value) {
                  setSelectedFilters(prev => [...prev, item.id]);
                } else {
                  setSelectedFilters(prev => prev.filter(f => f !== item.id));
                }
              }}
            />
          ))}
        </View>

        <View style={tw`mt-3 w-full`}>
          <View style={tw`flex-row items-center gap-1.5 mb-2 justify-center`}>
            <Text style={tw.style(subheadMediumUppercase, 'text-eggplant')}>
              Dietary filters
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`gap-2 justify-center w-full flex-row flex-wrap`}
          >
            {DIETARY_TAGS.map(tag => {
              const isActive = selectedDietaryFilters.includes(tag.key);
              return (
                <Pill
                  key={tag.key}
                  text={tag.label}
                  size="small"
                  isActive={isActive}
                  setIsActive={() => toggleDietaryKey(tag.key)}
                />
              );
            })}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}
