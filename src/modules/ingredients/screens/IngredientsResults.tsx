import { useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import Pill from '../../../common/components/Pill';
import SkeletonLoader from '../../../common/components/SkeletonLoader';
import tw from '../../../common/tailwind';
import RecipeCard from '../../../modules/make/components/RecipeCard';
import React, { useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  h2TextStyle,
  subheadMediumUppercase,
  subheadSmallUppercase,
} from '../../../theme/typography';
import { useGetRecipesByIngredientsQuery } from '../../recipe/api/recipeApi';
import { Recipe } from '../../recipe/models/recipe';

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth - 60;

export default function IngredientsResultsScreen({
  route,
}: {
  route: {
    params: {
      selectedIngredients: {
        id: string;
        title: string;
      }[];
    };
  };
}) {
  const navigation = useNavigation();

  const [selectedIngredients, setSelectedIngredients] = React.useState<any>(
    route.params.selectedIngredients,
  );
  
  // Fetch recipes from backend API based on selected ingredient IDs
  const ingredientIds = useMemo(() => 
    selectedIngredients.map((ing: any) => ing.id),
    [selectedIngredients]
  );
  
  const { data: recipes = [], isLoading } = useGetRecipesByIngredientsQuery(ingredientIds);

  // Sort recipes by number of matching ingredients
  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => {
      // Count how many selected ingredients are in each recipe
      const countMatchingIngredients = (recipe: Recipe) => {
        let count = 0;
        recipe.components?.forEach(wrapper => {
          wrapper.component?.forEach(comp => {
            // Check required ingredients
            comp.requiredIngredients?.forEach(reqIng => {
              if (ingredientIds.includes(reqIng.recommendedIngredient)) count++;
              reqIng.alternativeIngredients?.forEach(altIng => {
                if (ingredientIds.includes(altIng.ingredient)) count++;
              });
            });
            // Check optional ingredients
            comp.optionalIngredients?.forEach(optIng => {
              if (ingredientIds.includes(optIng.ingredient)) count++;
            });
          });
        });
        return count;
      };

      return countMatchingIngredients(b) - countMatchingIngredients(a);
    });
  }, [recipes, ingredientIds]);

  const onValueChecked = (value: string) => {
    if (selectedIngredients.length - 1 === 0) {
      navigation.goBack();
      return;
    }

    const valueIndex = selectedIngredients.findIndex(
      (x: any) => x.id === value,
    );

    if (valueIndex !== -1) {
      const updatedArray = [...selectedIngredients];
      updatedArray.splice(valueIndex, 1);
      setSelectedIngredients(updatedArray);
    }
  };

  const skeletonStyles = [
    `mb-3 h-[311px] w-[${itemLength}px] overflow-hidden rounded`,
  ];

  return (
    <View style={tw`flex-1 bg-[#FFF5E7]`}>
      {isLoading ? (
        <View style={tw`pt-30 flex-row flex-wrap justify-center`}>
          {Array.from(Array(3).keys()).map((_, index) => (
            <View key={index}>
              <SkeletonLoader styles={skeletonStyles} />
            </View>
          ))}
        </View>
      ) : (
        <ScrollView>
          <SafeAreaView>
            <View style={tw`items-center justify-start pt-11`}>
              <View style={tw`w-full items-center p-5`}>
                <Text style={tw.style(h2TextStyle, 'text-center')}>
                  Ooh, these look yum!
                </Text>
              </View>

              <View style={tw`mb-5.5 mx-5 items-center`}>
                <Text
                  style={tw.style(
                    subheadMediumUppercase,
                    'mb-1 w-full text-center',
                  )}
                >
                  Let’s make a DELISH dish with
                </Text>
                <View style={tw`flex-row flex-wrap justify-center gap-1`}>
                  {selectedIngredients.map((ingredient: any) => (
                    <Pill
                      key={ingredient.id}
                      text={ingredient.title}
                      size="small"
                      isActive={selectedIngredients.includes(ingredient)}
                      setIsActive={() => {
                        onValueChecked(ingredient);
                      }}
                      showCloseIcon
                    />
                  ))}
                </View>
                <Pressable onPress={() => navigation.goBack()}>
                  <Text
                    style={tw.style(subheadSmallUppercase, 'pt-3 underline')}
                  >
                    try a new search
                  </Text>
                </Pressable>
              </View>

              <View style={tw`mb-5 w-full px-5`}>
                {/* List of recipes from backend */}
                {sortedRecipes.length > 0 ? (
                  sortedRecipes.map(recipe => {
                    // Transform backend recipe to legacy format for RecipeCard
                    const heroImageAsset = recipe.heroImageUrl 
                      ? [{ url: recipe.heroImageUrl }] 
                      : [];
                    
                    return (
                      <RecipeCard
                        key={recipe._id}
                        id={recipe._id}
                        title={recipe.title}
                        heroImage={heroImageAsset as any}
                        variantTags={[]}
                        kind={selectedIngredients.map((ing: any) => ing.title)}
                        cardStyle={tw`mb-2 mr-0`}
                      />
                    );
                  })
                ) : (
                  <Text style={tw.style(subheadMediumUppercase, 'text-center mt-10')}>
                    No recipes found with these ingredients
                  </Text>
                )}
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      )}
      <FocusAwareStatusBar statusBarStyle="dark" />
    </View>
  );
}
