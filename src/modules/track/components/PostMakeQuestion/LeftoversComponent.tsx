import { useLinkTo, useNavigation } from '@react-navigation/native';
import SecondaryButton from '../../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../../common/tailwind';
import { IFramework } from '../../../../models/craft';
import { ITrackPostMakeIngredient } from '../../../../modules/track/components/TrackPostMakeIngredients';
import TrackPostMakeLeftovers from '../../../../modules/track/components/TrackPostMakeLeftovers';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { cardDrop } from '../../../../theme/shadow';
import { 
  h6TextStyle, 
  bodyMediumRegular, 
  h7TextStyle, 
  bodyMediumBold, 
  bodySmallRegular 
} from '../../../../theme/typography';
import { InitialStackParamList } from '../../../navigation/navigator/InitialNavigator';
import type { NavigationProp } from '@react-navigation/native';


export default function LeftoversComponent({
  framework,
  isLoading,
  setIsIngredient,
  onFeedbackComplete,
}: {
  framework: IFramework;
  setIsIngredient: (value: boolean) => void;
  setIsCompleted: (value: boolean) => void;
  selectedIngredients: ITrackPostMakeIngredient[];
  isLoading: boolean;
  onFeedbackComplete: () => void;
}) {
  //const linkTo = useLinkTo();
  const navigation = useNavigation<NavigationProp<InitialStackParamList>>();

  return (
    <View style={tw`h-full w-full justify-between`}>
      <ScrollView contentContainerStyle={tw`px-5`}>
        <Text style={tw.style(h6TextStyle, 'pb-2  text-center text-white')}>
          Nice one!
        </Text>
        <Text
          style={tw.style(bodyMediumRegular, 'pb-2 text-center text-white')}
        >
          Save time and money by storing what’s left – then remix them into
          something new!
        </Text>
        {/* Saving this dish */}
        <View
          style={[
            tw.style(`px-4.5 my-2 min-h-[225px] rounded-lg bg-white py-6`),
            cardDrop,
          ]}
        >
          <View>
            <Text
              style={tw.style(`text-center`, h7TextStyle)}
              maxFontSizeMultiplier={1}
            >
              SAVING THIS DISH
            </Text>
          </View>
          <View style={tw.style(`border-b border-strokecream pt-2.5`)} />
          <View style={tw.style('relative flex-row pt-2.5')}>
            <Image
              resizeMode="contain"
              source={require('../../../../../assets/placeholder/fridge.png')}
              accessibilityIgnoresInvertColors
            />
            <View style={tw.style('max-w-[200px]')}>
              <View style={tw.style('flex-col items-start pl-5')}>
                <Text style={tw.style(bodyMediumBold)}>In the freezer</Text>
                <Text style={tw.style(bodySmallRegular, 'pt-1 text-stone')}>
                  Store in an airtight container for up to 3 months.
                </Text>
              </View>
              <View style={tw.style('flex-col items-start pl-5 pt-4')}>
                <Text style={tw.style(bodyMediumBold)}>In the fridge</Text>
                <Text style={tw.style(bodySmallRegular, 'pt-1 text-stone')}>
                  Use within 3 days.
                </Text>
              </View>
            </View>
          </View>
        </View>
        {/* Meals from leftovers */}
        <TrackPostMakeLeftovers meals={framework.useLeftoversIn} />
      </ScrollView>
      <View>
        <SecondaryButton
          style={tw.style('mt-4.5 mx-5 mb-2')}
          onPress={() => {
            // Close survey by completing feedback now
            console.log('[LeftoversComponent] Next pressed. Completing feedback.');
            try {
              // Let parent handle dismiss (handlePresentModalDismiss) after submit
              // This also ensures rating/review are included
              (typeof onFeedbackComplete === 'function') && onFeedbackComplete();
            } catch (_e) {
              // Non-blocking; parent will still manage navigation if needed
            }
          }}
          disabled={isLoading}
          loading={isLoading}
        >
          Next
        </SecondaryButton>
      </View>
    </View>
  );
}
