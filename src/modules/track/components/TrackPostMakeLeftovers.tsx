import { useMemo } from "react";
import { Text, View, Dimensions } from "react-native";
import { filterAllergiesByUserPreferences } from "../../../common/helpers/filterIngredients";
import { useGetAllFrameworkCategoriesQuery } from '../../../modules/frameworkCategory/api/frameworkCategoryApi';
import tw from "../../../common/tailwind";
import { IFramework } from '../types/local';
import { subheadLargeUppercase, bodySmallRegular } from "../../../theme/typography";
import MealCarousel from "./MealCarousel";
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api'; 

export default function TrackPostMakeLeftovers({
  meals,
}: {
  meals: { id: string }[];
}) {
  // Fetch framework categories from the API instead of CraftCMS
  const { data: apiFrameworks } = useGetAllFrameworkCategoriesQuery();
  const { data: userOnboarding } = useGetUserOnboardingQuery();

  // Convert API frameworks to IFramework format and filter by allergies
  const frameworks = useMemo(() => {
    if (!apiFrameworks) return [];
    
    const mappedFrameworks: IFramework[] = apiFrameworks.map((fw) => ({
      id: fw._id,
      title: fw.title,
      slug: fw.title.toLowerCase().replace(/\s+/g, '-'),
      heroImageUrl: fw.heroImageUrl,
    }));

    return filterAllergiesByUserPreferences(mappedFrameworks as unknown as import('../../../models/craft').IFramework[], userOnboarding?.allergies) as unknown as IFramework[];
  }, [apiFrameworks, userOnboarding?.allergies]);

  if (frameworks.length === 0) {
    return null;
  }

  const leftoverMeals = frameworks.filter(item =>
    meals?.some(meal => meal.id === item.id),
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
