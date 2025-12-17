import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import TextBoxInput from '../../../common/components/Form/TextBoxInput';
import tw from '../../../common/tailwind';
import React from 'react';
import { Animated, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IngredientsSearchBarHeader({
  animatedValue,
  searchInput,
  setSearchInput,
}: {
  animatedValue: Animated.Value;
  searchInput: string;
  setSearchInput: (value: string) => void;
}) {
  const navigation = useNavigation();
  const headerOpacity = animatedValue.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    // The first view is just a container for the bg and the search
    <View style={tw`relative z-10`}>
      {/* The animated view will change the opacity of the BG */}
      <Animated.View
        style={[
          tw`absolute left-0 right-0 z-10 h-full bg-white shadow-md`,
          {
            opacity: headerOpacity,
          },
        ]}
      />
      {/* Search will always be here */}
      <View style={tw`z-20`}>
        <SafeAreaView
          edges={['top']}
          style={tw`z-20 flex-row items-center justify-between gap-3 py-3`}
        >
          <Pressable
            style={tw`ml-5 flex h-5 w-5 items-center justify-center`}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <Feather name="arrow-left" color="black" size={20} />
          </Pressable>
          <View style={tw`mr-5 grow`}>
            <TextBoxInput
              value={searchInput}
              placeholder="Search ingredients"
              onChangeText={setSearchInput}
              iconRight="search"
            />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
