import SavefulHaptics from '../../../common/helpers/haptics';
import tw from '../../../common/tailwind';
import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { bodyMediumRegular } from '../../../theme/typography';

export default function IngredientsList({
  offset,
  data,
  selectedIngredients,
  setSelectedIngredients,
}: {
  offset: Animated.Value;
  data: { id: string; title: string }[];
  selectedIngredients: string[];
  setSelectedIngredients: (ingredient: string) => void;
}) {
  const isSelected = (value: string) => {
    return selectedIngredients.findIndex(x => x === value) !== -1;
  };

  return (
    <ScrollView
      style={tw`w-full flex-1`}
      contentContainerStyle={tw`p-5 pt-0`}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: offset } } }],
        { useNativeDriver: false },
      )}
    >
      {data
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(item => (
          <Pressable
            key={item.id}
            style={tw`flex-row items-center gap-2 border-b border-strokecream py-3.5`}
            onPress={() => {
              SavefulHaptics.selectionAsync();
              setSelectedIngredients(item.id);
            }}
          >
            <View style={tw.style('rounded-full border border-stone p-1')}>
              <View
                style={tw.style('h-2 w-2 rounded-full bg-eggplant opacity-0', {
                  'opacity-100': isSelected(item.id),
                })}
              />
            </View>
            <Text style={tw.style(bodyMediumRegular)}>{item.title}</Text>
          </Pressable>
        ))}
      <View style={tw``} />
    </ScrollView>
  );

  // return (
  //   <AlphabetList
  //     data={data.map(x => ({ value: x.title, key: x.id }))}
  //     indexLetterStyle={tw.style(
  //       subheadSmallUppercase,
  //       'text-stone opacity-70',
  //     )}
  //     renderCustomItem={item => (
  //       <Pressable
  //         style={tw`flex-row items-center gap-2 border-b border-strokecream py-3.5`}
  //         onPress={() => {
  //           SavefulHaptics.selectionAsync();
  //           setSelectedIngredients(item.key);
  //         }}
  //       >
  //         <View style={tw.style('rounded-full border border-stone p-1')}>
  //           <View
  //             style={tw.style('h-2 w-2 rounded-full bg-eggplant opacity-0', {
  //               'opacity-100': isSelected(item.key),
  //             })}
  //           />
  //         </View>
  //         <Text style={tw.style(bodyMediumRegular)}>{item.value}</Text>
  //       </Pressable>
  //     )}
  //     letterListContainerStyle={tw`hidden gap-0.5`}
  //     indexContainerStyle={tw`w-5`}
  //     renderCustomSectionHeader={() => <></>}
  //     scrollEventThrottle={16}
  //     showsVerticalScrollIndicator={false}
  //     onScroll={Animated.event(
  //       [{ nativeEvent: { contentOffset: { y: offset } } }],
  //       { useNativeDriver: false },
  //     )}
  //     style={tw`w-full p-5`}
  //   />
  // );
}
