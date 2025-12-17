import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import React from 'react';
import {
  FieldError,
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import {
  bodyLargeBold,
  counterLarge,
  h7TextStyle,
  subheadLargeUppercase,
} from '../../../theme/typography';

interface ControlledSurveyCounterProps {
  title?: string;
  phrase?: string;
  theme?: 'light' | 'dark';
  error?: FieldError;
}

type Props<T extends FieldValues> = ControlledSurveyCounterProps &
  UseControllerProps<T>;

// Controlled text input that can infer the type of the form based on the controller passed in
// This way the "name" prop will work know what types are suitable
export default function ControlledSurveyCounter<T extends FieldValues>(
  props: Props<T>,
) {
  const { field } = useController(props);

  const contiditon =
    props.title?.toLowerCase() === 'dairy' ||
    props.title?.toLowerCase() === 'bread' ||
    props.title?.toLowerCase() === 'meat' ||
    props.title?.toLowerCase() === 'herbs' ||
    props.name?.toLowerCase() === 'scraps' ||
    props.name?.toLowerCase() === 'uneatenleftovers';

  const onChangeIncrementCounter = () => {
    if (contiditon) {
      field.onChange(field.value + 0.5);
    } else {
      field.onChange(field.value + 1);
    }
  };

  const onChangeDecrementCounter = () => {
    if (field.value > 0) {
      if (contiditon) {
        field.onChange(field.value - 0.5);
      } else {
        field.onChange(field.value - 1);
      }
    }
  };

  return (
    <>
      {props.title && (
        <Text
          style={tw.style(
            props.theme === 'dark' ? bodyLargeBold : h7TextStyle,
            props.theme === 'dark' ? 'text-black' : 'text-center text-white',
          )}
          maxFontSizeMultiplier={1}
        >
          {props.title}
        </Text>
      )}
      <View style={tw.style('flex-row items-center justify-between')}>
        <View
          style={tw.style(
            'h-14 w-14 items-center justify-center rounded-full bg-white',
            props.theme === 'dark' ? 'border border-eggplant-light' : '',
          )}
        >
          <Pressable onPress={onChangeDecrementCounter}>
            <Feather name="minus" size={32} color={tw.color('eggplant')} />
          </Pressable>
        </View>
        <Text
          style={tw.style(
            counterLarge,
            props.theme === 'dark' ? 'text-eggplant-vibrant' : 'text-white',
          )}
          maxFontSizeMultiplier={1}
        >
          {field.value}
        </Text>
        <View
          style={tw.style(
            'h-14 w-14 items-center justify-center rounded-full bg-white',
            props.theme === 'dark' ? 'border border-eggplant-light' : '',
          )}
        >
          <Pressable onPress={onChangeIncrementCounter}>
            <Feather name="plus" size={32} color={tw.color('eggplant')} />
          </Pressable>
        </View>
      </View>
      <Text
        style={tw.style(
          subheadLargeUppercase,
          `text-center text-white ${props.title ? 'pb-0' : 'pb-4'}`,
        )}
      >
        {props.phrase}
      </Text>
    </>
  );
}
