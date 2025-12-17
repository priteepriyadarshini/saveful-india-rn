import SkeletonLoader from '../../../common/components/SkeletonLoader';
import { filterAllergiesByUserPreferences } from '../../../common/helpers/filterIngredients';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api';
import MealCard from './MealCard';
import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth - 40;

export default function MealsList({ filters }: { filters: string[] }) {
  const { getFrameworks } = useContent();
  const { data: userOnboarding } = useGetUserOnboardingQuery();
  const [frameworks, setFrameworks] = React.useState<IFramework[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const getFrameworksData = async () => {
    const data = await getFrameworks();

    if (data) {
      setFrameworks(
        filterAllergiesByUserPreferences(data, userOnboarding?.allergies),
      );
      setIsLoading(false);
    }
  };

 useEffect(() => {
    getFrameworksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOnboarding]);

  const skeletonStyles = [
    `mb-3 h-[311px] w-[${itemLength}px] overflow-hidden rounded`,
  ];

  if (isLoading || !frameworks.length) {
    return (
      <View style={tw`flex-row flex-wrap justify-center pt-5`}>
        {Array.from(Array(2).keys()).map((_, index: number) => (
          <View key={index}>
            <SkeletonLoader styles={skeletonStyles} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={tw`m-5 gap-2`}>
      {frameworks
        .filter(framework =>
          framework.frameworkCategories.some(
            category => filters.includes(category.id) || filters.length === 0,
          ),
        )
        .map(item => (
          <MealCard key={item.id} {...item} />
        ))}
    </View>
  );
}



