import Pill from '../../../common/components/Pill';
import SkeletonLoader from '../../../common/components/SkeletonLoader';
import tw from '../../../common/tailwind';
import { ICategory } from '../../../models/craft';
import { mixpanelEventName } from '../../analytics/analytics';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import { frameworkCategoryApiService } from '../../frameworkCategory/api/frameworkCategoryApiService';
// import FILTERS from 'modules/make/data/filters';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

export default function Filters({
  selectedFilters,
  setSelectedFilters,
}: {
  selectedFilters: string[];
  setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>;
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

  // Helper to normalize Mongo ObjectId or string to string
  const extractId = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value?.$oid) return value.$oid;
    if (value?._id) return typeof value._id === 'string' ? value._id : value._id.$oid || value._id.toString();
    return value?.toString() || '';
  };

  const getCategoriesData = async () => {
    try {
      // First try to fetch from new API
      const frameworkCategories = await frameworkCategoryApiService.getAllCategories();
      
      // Convert framework categories to ICategory format
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
      // Do not fallback to Craft CMS; keep only API usage
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
      {/* Hidden measurer – renders once off-screen to get real height */}
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
      </Animated.View>
    </View>
  );
}
