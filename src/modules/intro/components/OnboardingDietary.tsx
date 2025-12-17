import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import TextBoxInput from '../../../common/components/Form/TextBoxInput';
import ToggleInput from '../../../common/components/Form/ToggleInput';
import SavefulHaptics from '../../../common/helpers/haptics';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { ICategory, IIngredient } from '../../../models/craft';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import {
  bodyLargeBold,
  bodyLargeMedium,
  bodyMediumRegular,
  h7TextStyle,
} from '../../../theme/typography';

export default function OnboardingDietary({
  dietaryRequirements,
  setDietaryRequirements,
  allergies,
  setAllergies,
}: {
  dietaryRequirements: string[];
  setDietaryRequirements: (dietaryRequirements: string[]) => void;
  allergies: string[];
  setAllergies: (allergies: string[]) => void;
}) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['1%', '80%'], []);

  const [searchInput, setSearchInput] = React.useState<string>('');
  const isAllergyIngredientSelected = (value: string) => {
    return allergies.findIndex(x => x === value) !== -1;
  };

  const [, updateState] = useState<unknown>();
  const forceUpdate = useCallback(() => updateState({}), []);
  const onValueChecked = (value: string) => {
    const valueIndex = allergies.findIndex(x => x === value);

    if (valueIndex === -1) {
      setAllergies([...allergies, value]);
    } else {
      const updatedArray = [...allergies];
      updatedArray.splice(valueIndex, 1);

      setAllergies(updatedArray);
    }

    forceUpdate();
  };

  const { getIngredients } = useContent();
  const { getCategories } = useContent();

  /* https://github.com/gorhom/react-native-bottom-sheet/issues/1560#issuecomment-1750466864
  Added fixes for ios / android users who uses reduce motion */
  const reducedMotion = useReducedMotion();

  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);

  const getIngredientsData = async () => {
    const data = await getIngredients();

    if (data) {
      // Sort alphabetically
      setIngredients(data.sort((a, b) => a.title.localeCompare(b.title)));
    }
  };

  useEffect(() => {
    getIngredientsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoriesData = async () => {
    const data = await getCategories();

    if (data) {
      // Only ingredient categories
      setCategories(data.filter(item => item.groupHandle === 'dietary'));
    }
  };

  useEffect(() => {
    getCategoriesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredIngredients = ingredients.filter(item => {
    const matchInput = item.title
      .toLowerCase()
      .includes(searchInput.toLowerCase());
    const activeIngredients = allergies.includes(item.id);

    return activeIngredients || matchInput;
  });

  if (!categories.length) {
    return null;
  }

  return (
    <View>
      {categories.map(dietary => {
        return (
          <ToggleInput
            key={dietary.id}
            label={dietary.title}
            value={dietaryRequirements.findIndex(x => x === dietary.id) !== -1}
            setValue={value => {
              const newDietaryRequirements = [...dietaryRequirements];
              if (value) {
                newDietaryRequirements.push(dietary.id);
              } else {
                newDietaryRequirements.splice(
                  newDietaryRequirements.findIndex(x => x === dietary.id),
                  1,
                );
              }
              setDietaryRequirements(newDietaryRequirements);
            }}
          />
        );
      })}
      <View style={tw`w-full border-b border-strokecream py-4`}>
        <View style={tw`flex-row items-center justify-between gap-2.5`}>
          <Text style={tw.style(bodyLargeBold)}>Specific allergy?</Text>
          <Pressable
            onPress={() => {
              bottomSheetModalRef.current?.present();
            }}
            style={tw`shrink`}
          >
            <Text
              style={tw.style(
                bodyLargeMedium,
                'text-right text-eggplant-vibrant underline',
              )}
            >
              Tell us what it is
            </Text>
          </Pressable>
        </View>
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        animateOnMount={!reducedMotion}
        snapPoints={snapPoints}
        containerStyle={{ backgroundColor: 'rgba(26, 26, 27, 0.7)' }}
        // onChange={handleSheetChanges}
        style={tw.style(
          'overflow-hidden rounded-2.5xl border border-strokecream',
        )}
        handleStyle={tw.style('hidden')}
        enableContentPanningGesture={false}
      >
        <View style={tw.style('bg-white px-5')}>
          <View style={tw.style('items-end py-4')}>
            <Pressable
              onPress={() => {
                bottomSheetModalRef.current?.close();
              }}
            >
              <Feather name={'x'} size={16} color="black" />
            </Pressable>
          </View>

          <View style={tw`mb-2.5 gap-2.5 border-b border-strokecream pb-5`}>
            <Text style={tw.style(h7TextStyle, 'text-center')}>
              What are your allergies?
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'text-center')}>
              Let us know what ingredients you’re allergic to – we’ll make sure
              they don’t appear in any of your meals.
            </Text>
          </View>

          <TextBoxInput
            value={searchInput}
            placeholder="Search ingredients"
            onChangeText={setSearchInput}
            iconRight="search"
          />
        </View>
        <ScrollView style={tw.style('bg-white px-5')}>
          <View style={tw`py-2.5`}>
            {filteredIngredients.map(item => {
              return (
                <Pressable
                  key={item.id}
                  style={tw`flex-row items-center gap-2 border-b border-strokecream py-3.5`}
                  onPress={() => {
                    SavefulHaptics.selectionAsync();
                    onValueChecked(item.id);
                  }}
                >
                  <View
                    style={tw.style('rounded-full border border-stone p-1')}
                  >
                    <View
                      style={tw.style(
                        'h-2 w-2 rounded-full bg-eggplant opacity-0',
                        {
                          'opacity-100': isAllergyIngredientSelected(item.id),
                        },
                      )}
                    />
                  </View>
                  <Text style={tw.style(bodyMediumRegular)}>{item.title}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </BottomSheetModal>
    </View>
  );
}
