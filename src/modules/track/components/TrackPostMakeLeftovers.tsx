import { useState, useEffect } from "react";
import { Text, View, Dimensions } from "react-native";
import { filterAllergiesByUserPreferences } from "../../../common/helpers/filterIngredients";
import useContent from "../../../common/hooks/useContent";
import tw from "../../../common/tailwind";
import { IFramework } from "../../../models/craft";
import { subheadLargeUppercase, bodySmallRegular } from "../../../theme/typography";
import MealCarousel from "./MealCarousel";
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api'; 

export default function TrackPostMakeLeftovers({
  meals,
}: {
  meals: { id: string }[];
}) {
  const { getFrameworks } = useContent();
  const { data: userOnboarding } = useGetUserOnboardingQuery(); //uncomment once the file has been created
  const [frameworks, setFrameworks] = useState<IFramework[]>([]);

  const getFrameworksData = async () => {
    const data = await getFrameworks();

    if (data) {
      setFrameworks(
        filterAllergiesByUserPreferences(data, userOnboarding?.allergies)
      );
    }
  };


  useEffect(() => {
    getFrameworksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (frameworks.length === 0) {
    return null;
  }

  const leftoverMeals = frameworks.filter(item =>
    meals.some(meal => meal.id === item.id),
  );

  if (leftoverMeals.length === 0) {
    return null;
  }

  return (
    <View style={tw`mt-16 w-full`}>
      <View>
        <Text
          style={tw.style(subheadLargeUppercase, 'pb-2 text-center text-white')}
        >
          Makeover your leftovers
        </Text>
        <Text style={tw.style(bodySmallRegular, 'pb-3 text-center text-white')}>
          Your leftovers can be transformed into the following meals.
        </Text>
        <MealCarousel
          items={leftoverMeals}
          itemLength={Dimensions.get('window').width - 80}
        />
      </View>
    </View>
  );
}
