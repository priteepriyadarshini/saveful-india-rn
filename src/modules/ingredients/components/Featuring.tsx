import {
  GenericCarouselFlatlist,
  GenericCarouselWrapper,
} from '../../../common/components/GenericCarousel';
import tw from '../../../common/tailwind';
import RecipeCard from '../../../modules/make/components/RecipeCard';
import React, { useEffect, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { h7TextStyle } from '../../../theme/typography';
import { recipeApiService } from '../../../modules/recipe/api/recipeApiService';
import { Recipe } from '../../../modules/recipe/models/recipe';

// const flexRow = 'flex-row justify-between items-center px-5 py-4.5';

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth - 40;

// Transform Recipe to format expected by RecipeCard
const transformRecipeForCard = (recipe: Recipe) => {
  return {
    id: recipe._id,
    title: recipe.title,
    heroImage: recipe.heroImageUrl 
      ? [{ url: recipe.heroImageUrl, title: recipe.title }] 
      : [],
    variantTags: recipe.components.flatMap(wrapper => 
      (wrapper.variantTags || []).map(tag => ({ title: tag }))
    ),
  };
};

export default function Featuring({
  ingredientId,
  title,
  hasHacks,
}: {
  ingredientId: string;
  title: string;
  hasHacks: boolean;
}) {
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [, setCurrentIndex] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(true);

  const flatListRef = React.useRef<any>(null); // Reference to the FlatList component
  // Function to scroll the FlatList
  // const scrollCarousel = (offset: number) => {
  //   if (flatListRef.current) {
  //     flatListRef.current.scrollToOffset({ offset, animated: true });
  //   }
  // };

  const [maxHeight, setMaxHeight] = useState<number>(0);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const data = await recipeApiService.getRecipesByIngredient(ingredientId);
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes for ingredient:', error);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredientId]);

  if (isLoading) {
    return null;
  }

  if (recipes.length === 0) {
    // Show empty state only if there are no hacks/tips either
    if (!hasHacks) {
      return (
        <View style={tw`w-full items-center my-5`}>
          <Text style={tw.style(h7TextStyle, 'px-5 text-center')}>
            No recipe is present for this yet
          </Text>
        </View>
      );
    }
    return null;
  }

  return (
    <View style={tw`w-full items-center`}>
      <Text style={tw.style(h7TextStyle, 'px-5 text-center')}>
        Cook a meal with {title}
      </Text>
      <GenericCarouselWrapper style={tw`relative my-5 overflow-hidden`}>
        <GenericCarouselFlatlist
          flatListRef={flatListRef}
          contentContainerStyle={tw`pl-5 pr-3`}
          data={recipes}
          itemLength={itemLength}
          renderItem={(renderItem: { item: Recipe; index: number }) => {
            const transformedRecipe = transformRecipeForCard(renderItem.item);
            return (
              <View style={{ width: itemLength }}>
                <View style={tw.style(`mr-2`)}>
                  <RecipeCard
                    {...transformedRecipe}
                    kind={[title]}
                    maxHeight={maxHeight}
                    setMaxHeight={setMaxHeight}
                  />
                </View>
              </View>
            );
          }}
          getCurrentIndex={setCurrentIndex}
          section={'Feature'}
        />
        {/* {recipes.length > 1 ? (
          <View style={tw.style(flexRow)}>
            <GenericCarouselPagination
              items={recipes}
              dotSpacing={4}
              dotSize={4}
              activeDotColor="eggplant"
              inactiveDotColor="eggplant/60"
              currentIndex={currentIndex}
            />
            <Pressable
              onPress={() => {
                scrollCarousel((currentIndex + 1) * itemLength);
              }}
            >
              <Feather name="arrow-right" size={20} color={tw.color('kale')} />
            </Pressable>
          </View>
        ) : null} */}
      </GenericCarouselWrapper>
    </View>
  );
}
