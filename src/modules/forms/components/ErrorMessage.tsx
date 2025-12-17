import tw from '../../../common/tailwind';
import React from 'react';
import { FieldError } from 'react-hook-form';
import { Text, View } from 'react-native';
import { bodySmallRegular, subheadMediumUppercase } from '../../../theme/typography';

export default function ErrorMessage({
  errors,
  centered,
}: {
  errors?: FieldError;
  centered?: boolean;
}) {
  if (!errors) return null;

  return (
    <View style={tw`mt-2 ${centered ? '' : 'flex-row'} items-center`}>
      <Text
        style={tw.style(
          centered ? subheadMediumUppercase : bodySmallRegular,
          'text-validation',
        )}
      >
        {errors.message}
      </Text>
    </View>
  );
}
