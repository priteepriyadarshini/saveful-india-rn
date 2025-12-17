import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import tw from '../../../common/tailwind';
import React, { useRef } from 'react';
import {
  FieldError,
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';
import {
  Dimensions,
  Image,
  ImageRequireSource,
  Text,
  View,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { FlatList } from 'react-native-gesture-handler';
import { h7TextStyle } from '../../../theme/typography';

interface CarouselItem {
  id: string;
  title: string;
  image: ImageRequireSource;
}

interface FavouriteDishesProps {
  data: CarouselItem[];
  error?: FieldError;
}

type Props<T extends FieldValues> = FavouriteDishesProps &
  UseControllerProps<T>;

// Controlled text input that can infer the type of the form based on the controller passed in
// This way the "name" prop will work know what types are suitable
export default function FavouriteDishes<T extends FieldValues>(
  props: Props<T>,
) {
  const { field } = useController(props);

  // export default function FavouriteDishes({ data }: { data: CarouselItem[] }) {
  const { data } = props;
  const [orderedData, setOrderedData] = React.useState<CarouselItem[]>(data); // This is the state that will be updated when the user reorders the list.
  const flatListRef = useRef<FlatList<CarouselItem>>(null);

  return (
    <DraggableFlatList
      ref={flatListRef}
      keyExtractor={item => `${item.id}`}
      data={orderedData}
      onDragEnd={({ data }) => {
        setOrderedData(data);
        field.onChange(data.map(item => item.title));
      }}
      renderItem={({ item, drag, isActive }) => {
        return (
          <ScaleDecorator>
            <TouchableOpacity
              activeOpacity={1}
              onLongPress={drag}
              disabled={isActive}
              style={tw`w-[${Dimensions.get('window').width - 40}px] mb-1.5`}
              key={item.id}
            >
              <View
                style={tw`w-full flex-row items-center justify-between gap-4 rounded-[10px] border border-strokecream bg-white py-2 pl-2`}
              >
                <Image
                  style={tw.style('h-20 w-20 rounded-2lg')}
                  resizeMode="cover"
                  source={item.image}
                />

                <Text
                  style={tw.style(h7TextStyle, 'w-full shrink text-left')}
                  maxFontSizeMultiplier={1}
                >
                  {item.title}
                </Text>

                <View style={tw`p-2`}>
                  <Feather name="menu" size={24} color={tw.color('stone/30')} />
                </View>
              </View>
            </TouchableOpacity>
          </ScaleDecorator>
        );
      }}
      renderToHardwareTextureAndroid
      viewabilityConfig={{
        itemVisiblePercentThreshold: 100,
      }}
    />
  );
}
