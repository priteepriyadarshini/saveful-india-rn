import { Feather } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Pill from '../../../common/components/Pill';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../common/tailwind';
import { IIngredient } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import { IngredientsStackParamList } from '../../../modules/ingredients/navigation/IngredientsNavigator';
import { InitialStackParamList } from '../../navigation/navigator/InitialNavigator';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  bodySmallRegular,
  subheadMediumUppercase,
  subheadSmallUppercase,
} from '../../../theme/typography';

export default function IngredientsFooter({
  selectedIngredients,
  onValueChecked,
  navigation,
}: {
  selectedIngredients: IIngredient[];
  onValueChecked: (value: string) => void;
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<
      IngredientsStackParamList,
      'IngredientsHome',
      undefined
    >,
    NativeStackNavigationProp<InitialStackParamList, 'Ingredients', undefined>
  >;
}) {
  const { sendAnalyticsEvent } = useAnalytics();
  const [showAll, setShowAll] = React.useState(false);

  return (
    <View
      style={tw.style(
        `m-5 mt-0 rounded-2lg border border-eggplant-vibrant bg-radish px-4 py-3`,
      )}
    >
      {selectedIngredients.length === 0 ? (
        <Text style={tw.style(bodySmallRegular, 'mb-5.5 text-center')}>
          Tell us what ingredients you have. We’ll share dishes to use them up.
        </Text>
      ) : (
        <View style={tw`mb-5.5`}>
          <Text
            style={tw.style(
              subheadMediumUppercase,
              'mb-1 text-center text-eggplant',
            )}
          >
            Let’s make a DELISH dish with
          </Text>
          <View style={tw`w-full flex-row flex-wrap justify-center gap-1`}>
            {selectedIngredients.map((ingredient, index) =>
              index < 6 || showAll ? (
                <Pill
                  key={ingredient.id}
                  text={ingredient.title}
                  size="small"
                  isActive={selectedIngredients.includes(ingredient)}
                  setIsActive={() => {
                    onValueChecked(ingredient.id);
                  }}
                  showCloseIcon
                />
              ) : null,
            )}
            {selectedIngredients.length > 6 && (
              <Pressable
                style={tw.style(
                  `flex-row items-center justify-center gap-0.5 rounded-full bg-white px-1.5 py-1`,
                )}
                onPress={() => setShowAll(!showAll)}
              >
                <Feather
                  name={showAll ? 'minus' : 'plus'}
                  size={10}
                  color={tw.color('eggplant')}
                />
                <Text
                  style={[
                    tw.style(subheadSmallUppercase, 'ml-0.5 text-eggplant'),
                    { letterSpacing: 1 },
                  ]}
                >
                  {showAll
                    ? 'Show Less'
                    : `${selectedIngredients.length - 6} more`}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      <SecondaryButton
        iconRight="arrow-right"
        disabled={selectedIngredients.length <= 0}
        onPress={() => {
          // store user selected ingredients
          selectedIngredients.map(x => {
            return sendAnalyticsEvent({
              event: mixpanelEventName.ingredientSelected,
              properties: {
                ingredient: x.title,
              },
            });
          });

          // store interaction search ingredients
          sendAnalyticsEvent({
            event: mixpanelEventName.actionClicked,
            properties: {
              action: mixpanelEventName.ingredientSearch,
              selected_ingredients: selectedIngredients.map(x => ({
                title: x.title,
              })),
            },
          });

          navigation.navigate('IngredientsResults', {
            selectedIngredients: selectedIngredients.map(x => ({
              id: x.id,
              title: x.title,
            })),
          });
        }}
      >
        Find meals
      </SecondaryButton>
    </View>
  );
}
