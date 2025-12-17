import tw from '../../../common/tailwind';
import React from 'react';
import { FieldError } from 'react-hook-form';
import { Text, ViewStyle } from 'react-native';
import { subheadMediumUppercase } from '../../../theme/typography';

export default function FormLabel({
  children,
  style,
  error,
}: {
  children: React.ReactNode;
  style?: string | ViewStyle;
  error?: FieldError;
}) {
  return (
    <Text
      style={[
        tw.style(
          subheadMediumUppercase,
          'pb-2 text-stone',
          { 'text-validation': error !== undefined },
          style,
        ),
      ]}
    >
      {children}
    </Text>
  );
}
