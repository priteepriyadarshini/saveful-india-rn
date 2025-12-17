import SecondaryButton from '../../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../../common/tailwind';
import { ITrackPostMakeIngredient } from '../../../../modules/track/components/TrackPostMakeIngredients';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { bodyMediumRegular, h6TextStyle } from '../../../../theme/typography';

export default function PostMakeQ3({
  item,
  setIsAnyLeftovers,
  selectedIngredients,
  setIsIngredient,
  setIsCompleted,
  isLoading,
  onFeedbackComplete,
}: {
  item?: any;
  setIsAnyLeftovers: (value: string) => void;
  selectedIngredients: ITrackPostMakeIngredient[];
  setIsIngredient: (value: boolean) => void;
  setIsCompleted: (value: boolean) => void;
  isLoading: boolean;
  onFeedbackComplete: () => void;
}) {
  return (
    <View style={tw`h-full w-full px-5`}>
      <ScrollView contentContainerStyle={tw`relative`}>
        <View>
          <Image
            style={tw`mx-auto mb-7 h-[335px] w-[302px] max-w-full`}
            source={item.image}
            accessibilityIgnoresInvertColors
          />
          <Text
            style={tw.style(h6TextStyle, 'pb-2 text-center text-white')}
            maxFontSizeMultiplier={1}
          >
            Got any leftovers?
          </Text>
          <Text
            style={tw.style(bodyMediumRegular, 'pb-2 text-center text-white')}
          >
            {`Let us know if there’s any of your dish left and we’ll help you savour every last bit.`}
          </Text>
        </View>
        <View style={tw.style('pt-8')}>
          {item.buttonText.map(
            (button: { id: string; name: string }, index: number) => {
              return (
                <SecondaryButton
                  key={button.id}
                  style={tw.style('mb-2')}
                  onPress={() => {
                    if (index === 0) {
                      setIsAnyLeftovers('yes');
                      if (selectedIngredients.length > 0) {
                        setIsIngredient(false);
                      } else {
                        setIsIngredient(true);
                      }
                    } else {
                      setIsAnyLeftovers('no');
                      if (selectedIngredients.length > 0) {
                        setIsCompleted(true);
                        setIsIngredient(false);
                      } else {
                        setIsIngredient(true);
                      }
                    }
                    onFeedbackComplete();
                  }}
                  loading={isLoading}
                >
                  {button.name}
                </SecondaryButton>
              );
            },
          )}
        </View>
      </ScrollView>
    </View>
  );
}
