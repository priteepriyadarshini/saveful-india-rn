import SecondaryButton from '../../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../../common/tailwind';
import TrackPostMakeIngredients, { 
  ITrackPostMakeIngredient 
} from '../TrackPostMakeIngredients';
import React from 'react';
import TrackLinearGradient from '../TrackLinearGradient';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { 
  h6TextStyle, 
  bodyMediumRegular, 
  bodySmallRegular 
} from '../../../../theme/typography';


export default function PostMakeQ2({
  item,
  setNextIndex,
  list,
  selectedIngredients,
  setSelectedIngredients,
  emptyIngredients,
}: {
  item?: any;
  setNextIndex: (index: number) => void;
  list: ITrackPostMakeIngredient[];
  selectedIngredients: ITrackPostMakeIngredient[];
  setSelectedIngredients: (
    ingredient: ITrackPostMakeIngredient | undefined,
  ) => void;
  emptyIngredients: () => void;
}) {
  return (
    <View style={tw`h-full w-full px-5`}>
      <Text
        style={tw.style(h6TextStyle, 'px-10 pb-2 pt-10 text-center text-white')}
        maxFontSizeMultiplier={1}
      >
        {item.title}
      </Text>
      <Text style={tw.style(bodyMediumRegular, 'pb-2 text-center text-white')}>
        {item.description}
      </Text>
      <ScrollView contentContainerStyle={tw`relative`}>
        <View style={tw.style('w-full')}>
          <TrackPostMakeIngredients
            list={list}
            selectedIngredients={selectedIngredients}
            setSelectedIngredients={setSelectedIngredients as any}
          />
        </View>
      </ScrollView>
      <TrackLinearGradient
        style={`${
          selectedIngredients.length < 1 ? 'top-[650px]' : 'top-[700px]'
        } right-[20px]`}
      />
      <SecondaryButton
        style={tw.style('mt-4.5 mb-2')}
        onPress={() => {
          setNextIndex(2);
        }}
      >
        Next
      </SecondaryButton>

      <Pressable
        onPress={() => {
          setNextIndex(2);
          emptyIngredients();
        }}
      >
        <Text
          style={tw.style(
            bodySmallRegular,
            'my-3 text-center text-white underline',
          )}
        >
          I didn’t have any of the ingredients
        </Text>
      </Pressable>
    </View>
  );
}
