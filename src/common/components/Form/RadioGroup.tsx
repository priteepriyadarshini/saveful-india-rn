import { Feather } from '@expo/vector-icons';
import SavefulHaptics from '../../../common/helpers/haptics';
import tw from '../../../common/tailwind';
import React from 'react';
import {
  FieldError,
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import { bodyLargeMedium } from '../../../theme/typography';

interface RadioGroupProps {
  values: string[];
  error?: FieldError;
}

type Props<T extends FieldValues> = RadioGroupProps & UseControllerProps<T>;

// Controlled text input that can infer the type of the form based on the controller passed in
// This way the "name" prop will work know what types are suitable
export default function RadioGroup<T extends FieldValues>(props: Props<T>) {
  const { field } = useController(props);
  const { values } = props;

  const isChecked = (value: string) => {
    return field.value === value.toLowerCase();
  };

  return (
    <View style={tw`w-full gap-1`}>
      {values.map(item => {
        return (
          <Pressable
            key={item}
            accessibilityRole="button"
            onPress={() => {
              SavefulHaptics.selectionAsync();
              // onValueChecked(item);
              field.onChange(item.toLowerCase());
            }}
          >
            <View
              key={item}
              style={[
                tw.style(
                  'py-4.5 w-full shrink-0 flex-row items-center rounded border border-radish bg-white px-4 shadow-sm',
                  { 'border-eggplant-light bg-radish': isChecked(item) },
                ),
                cardDrop,
              ]}
            >
              <View style={tw`flex-1`}>
                <Text
                  style={tw.style(bodyLargeMedium)}
                  maxFontSizeMultiplier={1}
                >
                  {item}
                </Text>
              </View>
              <View
                style={tw.style(
                  'h-5 w-5 items-center justify-center rounded-md opacity-0',
                  { 'opacity-100': isChecked(item) },
                )}
                accessibilityRole="button"
              >
                <Feather name="check" size={20} color="black" />
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
