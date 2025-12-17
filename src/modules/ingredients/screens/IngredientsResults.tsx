import { useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import Pill from '../../../common/components/Pill';
import SkeletonLoader from '../../../common/components/SkeletonLoader';
import {
  filterIngredientByArray,
  getAllIngredientsFromComponentsByArray,
} from '../../../common/helpers/filterIngredients';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import RecipeCard from '../../../modules/make/components/RecipeCard';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  h2TextStyle,
  subheadMediumUppercase,
  subheadSmallUppercase,
} from '../../../theme/typography';

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

  const [, updateState] = React.useState<unknown>();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const onValueChecked = (value: string) => {
    if (selectedIngredients.length - 1 === 0) navigation.goBack();

    const valueIndex = selectedIngredients.findIndex(
      (x: string) => x === value,
    );

    if (valueIndex === -1) {
      setSelectedIngredients([...selectedIngredients, value]);
    } else {
      const updatedArray = [...selectedIngredients];
      updatedArray.splice(valueIndex, 1);

      setSelectedIngredients(updatedArray);
    }

    forceUpdate();
  };

  const { getFrameworks } = useContent();
  const [frameworks, setFrameworks] = React.useState<IFramework[]>([]);
  const [selectedIngredients, setSelectedIngredients] = React.useState<any>(
    route.params.selectedIngredients,
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const getFrameworksData = async () => {
    const data = await getFrameworks();

    if (data) {
      setFrameworks(data);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFrameworksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if (frameworks.length === 0) {
  //   return null;
  // }

  const searchDishes = filterIngredientByArray(frameworks, selectedIngredients);

  const sortedSearchDishes = searchDishes.slice().sort((a, b) => {
    const ingredientsA = getAllIngredientsFromComponentsByArray(
      a.components,
      route.params.selectedIngredients,
    );
    const ingredientsB = getAllIngredientsFromComponentsByArray(
      b.components,
      route.params.selectedIngredients,
    );

    return ingredientsB.length - ingredientsA.length;
  });

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
                {/* List of recipes */}
                {sortedSearchDishes.length > 0 &&
                  sortedSearchDishes.map(recipe => {
                    const getMatchingIngredients =
                      getAllIngredientsFromComponentsByArray(
                        recipe.components,
                        route.params.selectedIngredients,
                      );

                    return (
                      <RecipeCard
                        key={recipe.id}
                        id={recipe.id}
                        title={recipe.title}
                        heroImage={recipe.heroImage}
                        variantTags={recipe.variantTags}
                        kind={getMatchingIngredients}
                        cardStyle={tw`mb-2 mr-0`}
                      />
                    );
                  })}
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      )}
      <FocusAwareStatusBar statusBarStyle="dark" />
    </View>
  );
}
