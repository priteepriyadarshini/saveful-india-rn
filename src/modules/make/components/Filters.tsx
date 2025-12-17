import Pill from '../../../common/components/Pill';
import SkeletonLoader from '../../../common/components/SkeletonLoader';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { ICategory } from '../../../models/craft';
import { mixpanelEventName } from '../../analytics/analytics';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
// import FILTERS from 'modules/make/data/filters';
import React, { useEffect } from 'react';
import { LayoutAnimation, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

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

  const toggleFilters = (value: boolean) => {
    /* Adding LayoutAnimation causes warning, trying to fix this  */
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: 100,
    });
    setIsActive(value);
  };

  const { getCategories } = useContent();
  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const getCategoriesData = async () => {
    const data = await getCategories();

    if (data) {
      // Only ingredient categories
      setCategories(data.filter(item => item.groupHandle === 'framework'));
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
      <Animatable.View
        style={tw.style(`${isActive ? 'mt-2.5' : 'h-0 overflow-hidden'}`)}
      >
        <View
          style={tw`w-full flex-row flex-wrap items-center justify-center gap-1`}
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
      </Animatable.View>
    </View>
  );
}
