import { Feather } from '@expo/vector-icons';
// Using RN Modal for allergy picker to avoid BottomSheet issues
import TextBoxInput from '../../../common/components/Form/TextBoxInput';
import ToggleInput from '../../../common/components/Form/ToggleInput';
import SavefulHaptics from '../../../common/helpers/haptics';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { ICategory } from '../../../models/craft';
import { useGetAllIngredientsQuery } from '../../ingredients/api/ingredientsApi';
import { useGetCurrentUserQuery } from '../../auth/api';
import { useGetUserOnboardingQuery } from '../api/api';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, ScrollView, Text, View, Modal, TouchableOpacity } from 'react-native';
// import { useReducedMotion } from 'react-native-reanimated';
import {
  bodyLargeBold,
  bodyLargeMedium,
  bodyMediumRegular,
  h6TextStyle,
  h7TextStyle,
} from '../../../theme/typography';

export default function OnboardingDietary({
  dietaryRequirements,
  setDietaryRequirements,
  allergies,
  setAllergies,
  vegType,
  setVegType,
  dairyFree,
  setDairyFree,
  nutFree,
  setNutFree,
  glutenFree,
  setGlutenFree,
  hasDiabetes,
  setHasDiabetes,
}: {
  dietaryRequirements: string[];
  setDietaryRequirements: (dietaryRequirements: string[]) => void;
  allergies: string[];
  setAllergies: (allergies: string[]) => void;
  vegType?: 'OMNI' | 'VEGETARIAN' | 'VEGAN';
  setVegType?: (vegType: 'OMNI' | 'VEGETARIAN' | 'VEGAN') => void;
  dairyFree?: boolean;
  setDairyFree?: (value: boolean) => void;
  nutFree?: boolean;
  setNutFree?: (value: boolean) => void;
  glutenFree?: boolean;
  setGlutenFree?: (value: boolean) => void;
  hasDiabetes?: boolean;
  setHasDiabetes?: (value: boolean) => void;
}) {
  const [isAllergyModalVisible, setIsAllergyModalVisible] = useState(false);

  const [searchInput, setSearchInput] = React.useState<string>('');
  // Remove free-text allergy input; use ingredient picker modal only
  const [showVegTypePicker, setShowVegTypePicker] = useState(false);
  
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

  // const reducedMotion = useReducedMotion();

  
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: userOnboarding } = useGetUserOnboardingQuery();
  const userCountry = currentUser?.country || userOnboarding?.suburb;
  const { data: apiIngredients } = useGetAllIngredientsQuery(userCountry);
  const [ingredients, setIngredients] = useState<{ id: string; title: string }[]>([]);
  const dietaryCategoryOptions = [
    { id: 'f74223f2-6285-479b-be97-8472ed79b835', title: 'Vegetarian' },
    { id: 'f096348b-3d75-475d-a166-b9470e2978ec', title: 'Vegan' },
    { id: 'bc2c0e89-9217-4217-aeb8-2a90daf8ce4a', title: 'Dairy Free' },
    { id: 'e0b82f0b-a03c-4735-8810-4d70b77ba231', title: 'Nut Free' },
    { id: '06566409-dc8c-46f0-b575-44090446ca80', title: 'Gluten Free' },
  ];

  // Load ingredients from backend API and normalize shape for this component
  const getIngredientsData = async () => {
    if (apiIngredients && Array.isArray(apiIngredients) && apiIngredients.length > 0) {
      try {
        const normalized = apiIngredients
          .filter((ing) => ing && (ing as any)._id && (ing as any).name)
          .map((ing) => ({ 
            id: String((ing as any)._id), 
            title: String((ing as any).name) 
          }))
          .sort((a, b) => a.title.localeCompare(b.title));
        console.log('Loaded ingredients for allergies (api):', normalized.length);
        setIngredients(normalized);
      } catch (error) {
        console.error('Error normalizing ingredients:', error);
        setIngredients([]);
      }
    }
  };

  useEffect(() => {
    getIngredientsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiIngredients]);

  // Categories come from static options above; no CMS calls

  const filteredIngredients = ingredients.filter(item => {
    const matchInput = item.title
      .toLowerCase()
      .includes(searchInput.toLowerCase());
    const activeIngredients = allergies.includes(item.id);

    return activeIngredients || matchInput;
  });

  // Do not early-return; allow allergy picker to work even if
  // categories are still loading or unavailable.

  return (
    <View>
      {/* Veg Type Picker */}
      {setVegType && (
        <View style={tw`w-full border-b border-strokecream py-4`}>
          <Text style={tw.style(bodyLargeBold, 'mb-3')}>Dietary Type</Text>
          <Pressable
            style={tw`flex-row items-center justify-between bg-creme rounded-xl px-3 py-3`}
            onPress={() => setShowVegTypePicker(true)}
          >
            <View style={tw`flex-row items-center`}>
              <Feather name="list" size={18} color="#666" style={tw`mr-2.5`} />
              <Text style={tw.style(bodyMediumRegular)}>
                {vegType === 'OMNI' ? 'Omnivore' : vegType === 'VEGETARIAN' ? 'Vegetarian' : 'Vegan'}
              </Text>
            </View>
            <Feather name="chevron-down" size={18} color="#666" />
          </Pressable>
        </View>
      )}

      {/* Dietary Restrictions Toggles */}
      {(setDairyFree || setNutFree || setGlutenFree || setHasDiabetes) && (
        <View style={tw`w-full border-b border-strokecream py-4`}>
          <Text style={tw.style(bodyLargeBold, 'mb-3')}>Dietary Restrictions</Text>
          <View style={tw`gap-2`}>
            {setDairyFree && (
              <ToggleInput
                label="Dairy Free"
                value={dairyFree || false}
                setValue={setDairyFree}
              />
            )}
            {setNutFree && (
              <ToggleInput
                label="Nut Free"
                value={nutFree || false}
                setValue={setNutFree}
              />
            )}
            {setGlutenFree && (
              <ToggleInput
                label="Gluten Free"
                value={glutenFree || false}
                setValue={setGlutenFree}
              />
            )}
            {setHasDiabetes && (
              <ToggleInput
                label="Has Diabetes"
                value={hasDiabetes || false}
                setValue={setHasDiabetes}
              />
            )}
          </View>
        </View>
      )}

      {dietaryCategoryOptions.map(dietary => {
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
        <View style={tw`flex-row items-center justify-between gap-2.5 mb-3`}>
          <Text style={tw.style(bodyLargeBold)}>Specific allergy?</Text>
          <Pressable
            onPress={() => {
              console.log('Opening allergy picker (modal), ingredients count:', ingredients.length);
              setIsAllergyModalVisible(true);
            }}
            style={tw`shrink`}
          >
            <Text style={tw.style(bodyLargeMedium, 'text-right text-eggplant-vibrant underline')}>
              Tell Us?
            </Text>
          </Pressable>
        </View>

        {/* Show selected allergies as removable chips */}
        {allergies.length > 0 && (
          <View style={tw`flex-row flex-wrap gap-2`}>
            {allergies.map((allergyId) => {
              if (!allergyId) return null;
              const ing = ingredients.find(ing => ing.id === allergyId);
              const label = ing?.title ?? allergyId;
              return (
                <View
                  key={allergyId}
                  style={tw`flex-row items-center gap-2 bg-white border border-eggplant-vibrant rounded-lg px-3 py-1.5`}
                >
                  <Text style={tw.style(bodyMediumRegular)}>{label}</Text>
                  <Pressable onPress={() => setAllergies(allergies.filter(a => a !== allergyId))}>
                    <Feather name="x" size={14} color="#666" />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </View>
      <Modal
        visible={isAllergyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAllergyModalVisible(false)}
      >
        <TouchableOpacity
          style={tw`flex-1 bg-black/50 justify-end`}
          activeOpacity={1}
          onPress={() => setIsAllergyModalVisible(false)}
        >
          <View style={tw`bg-white rounded-t-3xl px-5 pt-4 pb-6 border border-strokecream`}
          >
            <View style={tw.style('items-end pb-2')}>
              <Pressable onPress={() => setIsAllergyModalVisible(false)}>
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

            <ScrollView style={tw.style('mt-2.5 max-h-96')}>
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
                      <View style={tw.style('rounded-full border border-stone p-1')}>
                        <View
                          style={tw.style(
                            'h-2 w-2 rounded-full bg-eggplant opacity-0',
                            { 'opacity-100': isAllergyIngredientSelected(item.id) },
                          )}
                        />
                      </View>
                      <Text style={tw.style(bodyMediumRegular)}>{item.title}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Veg Type Picker Modal */}
      <Modal
        visible={showVegTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVegTypePicker(false)}
      >
        <TouchableOpacity 
          style={tw`flex-1 bg-black/50 justify-end`}
          activeOpacity={1}
          onPress={() => setShowVegTypePicker(false)}
        >
          <View style={tw`bg-white rounded-t-3xl px-5 py-6`}>
            <Text style={tw.style(h6TextStyle, 'text-center mb-4')}>Select Dietary Type</Text>
            <View>
              {[
                { value: 'OMNI', label: 'Omnivore', description: 'Eats both plant and animal foods' },
                { value: 'VEGETARIAN', label: 'Vegetarian', description: 'No meat, but includes dairy and eggs' },
                { value: 'VEGAN', label: 'Vegan', description: 'No animal products at all' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={tw`py-4 border-b border-strokecream`}
                  onPress={() => {
                    if (setVegType) {
                      setVegType(item.value as 'OMNI' | 'VEGETARIAN' | 'VEGAN');
                    }
                    setShowVegTypePicker(false);
                  }}
                >
                  <Text style={tw.style(bodyLargeBold, 'mb-1')}>{item.label}</Text>
                  <Text style={tw.style(bodyMediumRegular, 'text-stone')}>{item.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
