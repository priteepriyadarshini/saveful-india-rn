import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import React from 'react';
import { Pressable, Text, TextInput, View, ViewStyle } from 'react-native';
import { bodyMediumRegular, subheadMediumUppercase } from '../../../theme/typography';

export default function TextBoxInput({
  heading,
  placeholder,
  value,
  onChangeText,
  headerSpacing = 0,
  secureTextEntry = false,
  iconRight,
  keyboardType = 'default',
  headingStyle,
  inputStyle,
}: {
  heading?: string;
  placeholder?: string;
  value: any;
  headerSpacing?: number;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  iconRight?: 'search' | 'eye' | 'eye-off';
  keyboardType?: 'default' | 'number-pad';
  headingStyle?: ViewStyle;
  inputStyle?: ViewStyle;
}) {
  return (
    <View>
      {heading && (
        <Text
          style={[
            tw.style(subheadMediumUppercase, 'pb-2 text-stone', headingStyle),
            { letterSpacing: headerSpacing === 0 ? 0 : headerSpacing },
          ]}
        >
          {heading}
        </Text>
      )}
      <View
        style={tw`flex-row items-center justify-between rounded-md border border-strokecream bg-white px-4 py-3`}
      >
        <TextInput
          style={tw.style(bodyMediumRegular, 'grow text-midgray', inputStyle)}
          placeholderTextColor={'#575757'}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
        />
        {iconRight && (
          <Pressable
            disabled={value.length === 0}
            onPress={() => {
              onChangeText('');
            }}
          >
            {value.length > 0 ? (
              <Feather name={'x'} size={20} color={tw.color('black')} />
            ) : (
              <Feather name={iconRight} size={20} color={tw.color('black')} />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
