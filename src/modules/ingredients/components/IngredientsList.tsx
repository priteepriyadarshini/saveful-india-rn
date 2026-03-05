import SavefulHaptics from '../../../common/helpers/haptics';
import tw from '../../../common/tailwind';
import React, { useCallback, useMemo } from 'react';
import { Animated, FlatList, Pressable, Text, View } from 'react-native';
import { bodyMediumRegular } from '../../../theme/typography';

type Item = { id: string; title: string };

// Memoised row — only re-renders when its own isSelected or id/title changes
const IngredientRow = React.memo(({
  item,
  isSelected,
  onPress,
}: {
  item: Item;
  isSelected: boolean;
  onPress: (id: string) => void;
}) => (
  <Pressable
    style={tw`flex-row items-center gap-2 border-b border-strokecream py-3.5`}
    onPress={() => {
      SavefulHaptics.selectionAsync();
      onPress(item.id);
    }}
  >
    <View style={tw.style('rounded-full border border-stone p-1')}>
      <View
        style={tw.style('h-2 w-2 rounded-full bg-eggplant opacity-0', {
          'opacity-100': isSelected,
        })}
      />
    </View>
    <Text style={tw.style(bodyMediumRegular)}>{item.title}</Text>
  </Pressable>
));

export default function IngredientsList({
  offset,
  data,
  selectedIngredients,
  setSelectedIngredients,
}: {
  offset: Animated.Value;
  data: Item[];
  selectedIngredients: string[];
  setSelectedIngredients: (ingredient: string) => void;
}) {
  // O(1) lookup instead of O(n) findIndex per row
  const selectedSet = useMemo(
    () => new Set(selectedIngredients),
    [selectedIngredients],
  );

  // Sort once when data changes, not on every render
  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.title.localeCompare(b.title)),
    [data],
  );

  // Stable callback so IngredientRow siblings don't re-render when one is tapped
  const handlePress = useCallback(
    (id: string) => setSelectedIngredients(id),
    [setSelectedIngredients],
  );

  return (
    <FlatList
      style={tw`w-full flex-1`}
      contentContainerStyle={tw`px-5 pb-5`}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: offset } } }],
        { useNativeDriver: false },
      )}
      data={sortedData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <IngredientRow
          item={item}
          isSelected={selectedSet.has(item.id)}
          onPress={handlePress}
        />
      )}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
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
