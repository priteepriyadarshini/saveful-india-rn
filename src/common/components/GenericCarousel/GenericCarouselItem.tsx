import React from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { ClassInput } from 'twrnc'; //may cause some error while bundling
import tw from '../../tailwind';


interface Props<T> {
  item: T;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  isSuperGreen: boolean;
  tailwindStyle?: ClassInput;
  containerStyle?: ViewStyle;
  style?: StyleProp<ViewStyle>;
  onTappedItem?: (item: T) => void;
}
export default function GenericCarouselItem<T>({
  item,
  tailwindStyle,
  containerStyle,
  style,
  onTappedItem,
}: Props<T>) {
  return (
    <Pressable
      style={tw.style('mr-4 w-40', containerStyle)}
      accessibilityRole="button"
      onPress={() => onTappedItem?.(item)}
    >
      <View
        style={[
          tw.style(
            'h-[180px] w-40 overflow-hidden rounded-[10px] bg-white',
            tailwindStyle,
          ),
          style,
        ]}
      ></View>
    </Pressable>
  );
}
