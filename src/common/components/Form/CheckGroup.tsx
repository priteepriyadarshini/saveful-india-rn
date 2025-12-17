import { Feather } from '@expo/vector-icons';
import SavefulHaptics from '../../../common/helpers/haptics';
import tw from '../../../common/tailwind';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import { bodyLargeMedium } from '../../../theme/typography';

export default function CheckGroup({
  values,
  selectedValues,
  setSelectedValues,
}: {
  values: {
    id: string;
    title: string;
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
    <View style={tw`w-full gap-1`}>
      {values.map(item => {
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => {
              SavefulHaptics.selectionAsync();
              onValueChecked(item.id);
            }}
          >
            <View
              style={[
                tw.style(
                  'py-4.5 w-full shrink-0 flex-row items-center rounded border border-radish bg-white px-4',
                  {
                    'border-eggplant-light bg-radish': isChecked(item.id),
                  },
                ),
                cardDrop,
              ]}
            >
              <View style={tw`flex-1`}>
                <Text style={tw.style(bodyLargeMedium)}>{item.title}</Text>
              </View>
              <View
                style={tw.style(
                  'h-5 w-5 items-center justify-center rounded-md opacity-0',
                  { 'opacity-100': isChecked(item.id) },
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
