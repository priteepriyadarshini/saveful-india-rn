import { Feather } from '@expo/vector-icons';
import SavefulHaptics from '../../../common/helpers/haptics';
import tw from '../../../common/tailwind';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { bodyMediumRegular } from '../../../theme/typography';

export default function CheckGroupWithImage({
  values,
  selectedValues,
  setSelectedValues,
}: {
  values: {
    id: string;
    title: string;
    image?: { uri: string };
  }[];
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
}) {
  const [, updateState] = React.useState<unknown>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const isChecked = (value: string) => {
    return selectedValues.findIndex(x => x === value) !== -1;
  };

  const onValueChecked = (value: string) => {
    const valueIndex = selectedValues.findIndex(x => x === value);

    if (valueIndex === -1) {
      setSelectedValues([...selectedValues, value]);
    } else {
      const updatedArray = [...selectedValues];
      updatedArray.splice(valueIndex, 1);

      setSelectedValues(updatedArray);
    }

    forceUpdate();
  };

  return (
    <View style={tw`w-full flex-row flex-wrap gap-3`}>
      {values.map(checkboxItem => {
        return (
          <Pressable
            key={checkboxItem.id}
            accessibilityRole="button"
            onPress={() => {
              SavefulHaptics.selectionAsync();
              onValueChecked(checkboxItem.id);
            }}
            style={tw`grow`}
          >
            <View
              style={tw.style(
                'relative w-full items-center rounded-2lg border border-radish bg-white py-2',
                {
                  'border-eggplant-vibrant bg-radish': isChecked(
                    checkboxItem.id,
                  ),
                },
              )}
            >
              {checkboxItem.image && (
                <Image
                  resizeMode="contain"
                  // style={tw`h-[70px]`}
                  source={checkboxItem.image}
                  accessibilityIgnoresInvertColors
                />
              )}
              <View
                style={tw`flex-row items-center justify-center gap-1.5 pt-1`}
              >
                <Text style={tw.style(bodyMediumRegular)}>
                  {checkboxItem.title}
                </Text>
                {isChecked(checkboxItem.id) && (
                  <Feather name="check" size={18} color={tw.color('black')} />
                )}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
