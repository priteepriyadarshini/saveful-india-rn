import { Feather } from '@expo/vector-icons';
// Replacing BottomSheet with a reliable RN Modal for consistent display
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../common/tailwind';
import { IFrameworkComponent } from '../../../models/craft';
import OptionalIngredient from '../../../modules/prep/components/OptionalIngredient';
import OptionalIngredientsList from '../../../modules/prep/components/OptionalIngredientsList';
import RequiredIngredient from '../../../modules/prep/components/RequiredIngredient';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cardDrop } from '../../../theme/shadow';
import {
  bodyMediumBold,
  bodyMediumRegular,
  bodySmallRegular,
  h7TextStyle,
  subheadLargeUppercase,
} from '../../../theme/typography';

interface IPrepComponent extends IFrameworkComponent {
  index: number;
  allRequiredIngredients: {
    id: string;
    title: string;
    quantity: string;
    preparation?: string | undefined;
    ingredientId: string;
  }[][];
  setAllRequiredIngredients: {
    remove: (index: number) => void;
    insertAtIndex: (
      index: number,
      item: {
        id: string;
        title: string;
        quantity: string;
        preparation?: string;
        ingredientId: string;
      }[],
    ) => void;
  };
  setAllOptionalIngredients: {
    remove: (index: number) => void;
    insertAtIndex: (
      index: number,
      item: {
        id: string;
        title: string;
        quantity: string;
        preparation?: string;
        ingredientId: string;
      }[],
    ) => void;
  };
  /** Pre-computed scaled quantities: ingredient ID or name key → scaled qty string */
  scaledQuantities?: Record<string, string>;
}

export default function PrepComponent({
  id,
  componentInstructions,
  componentTitle,
  requiredIngredients,
  // Optional ingredients props
  optionalIngredients,
  stronglyRecommended,
  choiceInstructions,
  buttonText,
  //
  index: componentIndex,
  allRequiredIngredients,
  setAllRequiredIngredients,
  setAllOptionalIngredients,
  scaledQuantities,
}: IPrepComponent) {
  const [selectedOptionalIngredients, setSelectedOptionalIngredients] =
    useState<string[]>([]);
  const [optionalSearchQuery, setOptionalSearchQuery] = useState<string>('');

  const insets = useSafeAreaInsets();
  const paddingBottom = `pb-${insets.bottom + 44}px`;
  
  /* https://github.com/gorhom/react-native-bottom-sheet/issues/1560#issuecomment-1750466864
  Added fixes for ios / android users who uses reduce motion */
  const reducedMotion = useReducedMotion();
  
  // Modal visibility state (replaces BottomSheet)
  const [isOptionalModalVisible, setIsOptionalModalVisible] = useState(false);

  // // callbacks
  const handlePresentModalPress = useCallback(() => {
    setIsOptionalModalVisible(true);
  }, [optionalIngredients]);
  const handlePresentModalDismiss = useCallback(() => {
    setIsOptionalModalVisible(false);
  }, []);

  const onOptionalIngredientChecked = (value: string) => {
    const valueIndex = selectedOptionalIngredients.findIndex(x => x === value);

    if (valueIndex === -1) {
      setSelectedOptionalIngredients([...selectedOptionalIngredients, value]);
    } else {
      const updatedArray = [...selectedOptionalIngredients];
      updatedArray.splice(valueIndex, 1);

      setSelectedOptionalIngredients(updatedArray);
    }
  };

  useEffect(() => {
    setAllOptionalIngredients.remove(componentIndex);
    setAllOptionalIngredients.insertAtIndex(
      componentIndex,
      selectedOptionalIngredients.map(ingredientId => {
        const optionalIngredient = optionalIngredients.find(
          item => item.ingredient[0].id === ingredientId,
        );

        return {
          id,
          title: optionalIngredient?.ingredient[0].title || '',
          quantity: optionalIngredient?.quantity || '',
          preparation: optionalIngredient?.preparation || '',
          ingredientId,
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptionalIngredients]);

  return (
    <>
      <View style={tw.style(`px-5 pt-6`)}>
        <View style={tw.style('mb-2')}>
          <Text
            style={tw.style(
              subheadLargeUppercase,
              'text-midgray',
              componentInstructions ? 'mb-2' : 'mb-0',
            )}
          >
            {componentTitle}
          </Text>
          {componentInstructions && (
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
              {componentInstructions}
            </Text>
          )}
        </View>
      <View
        style={[
          tw.style('rounded-md border border-radish bg-white py-5'),
          cardDrop,
        ]}
      >
        {/* Required ingredients */}
        {requiredIngredients && requiredIngredients.length > 0 && (
          <View>
            {requiredIngredients.map((item, index) => {
              return (
                <RequiredIngredient
                  key={`${id}-req-${index}`}
                  id={item.id}
                  index={index}
                  recommendedIngredient={item.recommendedIngredient}
                  quantity={item.quantity}
                  preparation={item.preparation}
                  alternativeIngredients={item.alternativeIngredients}
                  scaledQuantities={scaledQuantities}
                  setSelectedRequiredIngredients={(item, index) => {
                    const selectedRequiredIngredients =
                      allRequiredIngredients[componentIndex];
                    selectedRequiredIngredients.splice(index, 1, item);
                    setAllRequiredIngredients.remove(componentIndex);
                    setAllRequiredIngredients.insertAtIndex(
                      componentIndex,
                      selectedRequiredIngredients.map(item => ({
                        ...item,
                        id,
                      })),
                    );

                    // remove(index);
                    // insertAtIndex(index, item);
                  }}
                />
              );
            })}
          </View>
        )}

        {/* Optional ingredients */}
        {optionalIngredients && optionalIngredients.length > 0 && (
          <View
            style={tw.style(
              'gap-2.5 px-5',
              requiredIngredients && requiredIngredients.length > 0
                ? 'mt-3.5 border-t border-strokecream pt-3.5'
                : '',
            )}
          >
            {/* Selected optional ingredients list */}
            {selectedOptionalIngredients.length > 0 && (
              <View>
                {selectedOptionalIngredients.map((ingredientId, index) => {
                  const optionalIngredient = optionalIngredients.find(
                    item => item.ingredient[0].id === ingredientId,
                  );

                  if (!optionalIngredient) return null;

                  return (
                    <OptionalIngredient
                      key={`${id}-opt-${index}`}
                      ingredient={optionalIngredient}
                      index={index}
                      onIngredientChecked={onOptionalIngredientChecked}
                      scaledQuantities={scaledQuantities}
                    />
                  );
                })}
              </View>
            )}

            {/* Show tag and description when no required ingredients or when no optional ingredients selected yet */}
            {((!requiredIngredients || requiredIngredients.length === 0) &&
              selectedOptionalIngredients.length === 0) && (
                <View
                  style={tw.style(
                    `items-center gap-2.5 border-b border-radish pb-3.5`,
                    selectedOptionalIngredients.length > 0 ? 'pt-2' : 'pt-0',
                  )}
                >
                  <Text
                    style={[
                      tw.style(
                        subheadLargeUppercase,
                        `uppercase`,
                        stronglyRecommended.includes('stronglyRecommended')
                          ? 'text-kale'
                          : 'text-eggplant',
                      ),
                    ]}
                  >
                    {stronglyRecommended.includes('stronglyRecommended')
                      ? 'Strongly recommended'
                      : 'Optional'}
                  </Text>
                  {choiceInstructions && (
                    <Text style={[tw.style(bodySmallRegular)]}>
                      {choiceInstructions}
                    </Text>
                  )}
                </View>
              )}

            {/* Show plus button for all optional ingredients sections */}
            <Pressable
              onPress={handlePresentModalPress}
              style={tw.style(
                'flex-row justify-center pt-1.5',
                selectedOptionalIngredients.length > 0 ? 'border-t border-strokecream pt-3.5' : '',
              )}
            >
              <Feather 
                name="plus-circle" 
                size={18} 
                color={tw.color(
                  stronglyRecommended.includes('stronglyRecommended') ? 'kale' : 'eggplant'
                )} 
              />
              <Text
                style={tw.style(
                  bodyMediumBold,
                  'ml-2 mt-[1px] flex-row',
                  stronglyRecommended.includes('stronglyRecommended')
                    ? 'text-kale'
                    : 'text-eggplant',
                )}
              >
                {buttonText ?? 'add extra flavour'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>

    {/* Modal with optional ingredients list - reliable overlay implementation */}
    {optionalIngredients && optionalIngredients.length > 0 && (
      <Modal
        animationType={reducedMotion ? 'none' : 'slide'}
        transparent
        visible={isOptionalModalVisible}
        onRequestClose={handlePresentModalDismiss}
      >
        <View style={tw`flex-1 bg-black bg-opacity-70`}> 
          <View
            style={tw.style(
              'absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-2.5xl border border-strokecream bg-white',
              'max-h-[80%]',
            )}
          >
            {/* Fixed header */}
            <View style={tw.style('px-5')}>
              <View style={tw.style('items-end py-4')}>
                <Pressable onPress={handlePresentModalDismiss}>
                  <Feather name={'x'} size={16} color="black" />
                </Pressable>
              </View>

              <View style={tw.style('mb-[9px] items-center justify-center')}>
                <Text style={tw.style(h7TextStyle)}>
                  {buttonText ?? 'add extra flavour'}
                </Text>
                {choiceInstructions && (
                  <Text style={tw.style(bodyMediumRegular, 'mt-1.5')}>
                    {choiceInstructions}
                  </Text>
                )}
              </View>

              {/* Search bar */}
              <View style={tw.style('mb-3')}>
                <View style={tw.style('flex-row items-center rounded-md border border-strokecream bg-white px-3 py-2')}>
                  <Feather name="search" size={16} color={tw.color('stone')} />
                  <TextInput
                    value={optionalSearchQuery}
                    onChangeText={setOptionalSearchQuery}
                    placeholder="Search ingredients"
                    placeholderTextColor={tw.color('stone')}
                    style={tw.style('ml-2 flex-1 text-stone')}
                  />
                  {optionalSearchQuery.length > 0 && (
                    <Pressable onPress={() => setOptionalSearchQuery('')}>
                      <Feather name="x" size={16} color={tw.color('stone')} />
                    </Pressable>
                  )}
                </View>
              </View>
            </View>

            {/* Scrollable ingredient list */}
            <ScrollView
              style={tw`flex-1`}
              contentContainerStyle={tw`px-5`}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <OptionalIngredientsList
                ingredients={(() => {
                  const mapped = optionalIngredients.map(item => ({
                    id: item.ingredient[0].id,
                    title: item.ingredient[0].title,
                  })).sort((a, b) => a.title.localeCompare(b.title));
                  const q = optionalSearchQuery.trim().toLowerCase();
                  const filtered = q.length === 0
                    ? mapped
                    : mapped.filter(x =>
                        (x.title || '').toLowerCase().includes(q) ||
                        (x.id || '').toLowerCase().includes(q)
                      );
                  return filtered;
                })()}
                selectedOptionalIngredients={selectedOptionalIngredients}
                setSelectedOptionalIngredients={onOptionalIngredientChecked}
              />
            </ScrollView>

            {/* Fixed footer button */}
            <View style={tw.style('px-5', paddingBottom)}>
              <PrimaryButton
                onPress={() => {
                  handlePresentModalDismiss();
                }}
                width="full"
              >
                {'Add to your meal'}
              </PrimaryButton>
            </View>
          </View>
        </View>
      </Modal>
    )}
    </>
  );
}
