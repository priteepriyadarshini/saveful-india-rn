import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
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
import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
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
}: IPrepComponent) {
  const [selectedOptionalIngredients, setSelectedOptionalIngredients] =
    useState<string[]>([]);

  const insets = useSafeAreaInsets();
  const paddingBottom = `pb-${insets.bottom + 44}px`;
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ['1%', '90%'], []);

  // // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, [bottomSheetModalRef]);
  const handlePresentModalDismiss = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, [bottomSheetModalRef]);

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
                  key={item.id}
                  id={item.id}
                  index={index}
                  recommendedIngredient={item.recommendedIngredient}
                  quantity={item.quantity}
                  preparation={item.preparation}
                  alternativeIngredients={item.alternativeIngredients}
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
                      key={optionalIngredient.id}
                      ingredient={optionalIngredient}
                      index={index}
                      onIngredientChecked={onOptionalIngredientChecked}
                    />
                  );
                })}
              </View>
            )}

            {/* Show this only when no required ingredients */}
            {(!requiredIngredients || requiredIngredients.length === 0) &&
              selectedOptionalIngredients.length === 0 && (
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

            <Pressable
              onPress={handlePresentModalPress}
              style={tw.style('flex-row justify-center pt-1.5')}
            >
              <Feather name="plus-circle" size={18} color={tw.color('kale')} />
              <Text
                style={tw.style(
                  bodyMediumBold,
                  'ml-2 mt-[1px] flex-row text-kale',
                )}
              >
                {buttonText ?? 'add extra flavour'}
              </Text>
            </Pressable>

            {/* Modal with optional ingredients list */}
            <BottomSheetModal
              ref={bottomSheetModalRef}
              index={1}
              snapPoints={snapPoints}
              // onChange={handleSheetChanges}
              containerStyle={{ backgroundColor: 'rgba(26, 26, 27, 0.7)' }}
              style={tw.style(
                'overflow-hidden rounded-2.5xl border border-strokecream',
              )}
              handleStyle={tw.style('hidden')}
              enableContentPanningGesture={false}
            >
              <ScrollView style={tw.style('px-5')}>
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

                <OptionalIngredientsList
                  ingredients={optionalIngredients
                    .map(item => ({
                      id: item.ingredient[0].id,
                      title: item.ingredient[0].title,
                    }))
                    .sort((a, b) => a.title.localeCompare(b.title))}
                  selectedOptionalIngredients={selectedOptionalIngredients}
                  setSelectedOptionalIngredients={onOptionalIngredientChecked}
                />
              </ScrollView>
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
            </BottomSheetModal>
          </View>
        )}
      </View>
    </View>
  );
}
