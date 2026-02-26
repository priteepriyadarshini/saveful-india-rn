import React, { useMemo, useState } from 'react';
import { View, Text, Image, Modal, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Animatable from 'react-native-animatable';
import tw from '../../../common/tailwind';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import { h7TextStyle, bodyMediumRegular, subheadMediumUppercase, bodySmallRegular } from '../../../theme/typography';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import useEnvironment from '../../environment/hooks/useEnvironment';
import { useCreateFeedbackMutation, useGetFeedbacksForFrameworkQuery, useUpdateFeedbackMutation } from '../../track/api/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InitialStackParamList } from '../../navigation/navigator/InitialNavigator';

interface RateRecipeModalProps {
  isVisible: boolean;
  recipeId: string;
  recipeName: string;
  recipeImage?: string;
  mealId?: string; 
  onClose: () => void;
}

const CarrotIcon = ({ size = 24, filled = false }: { size?: number; filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36">
    <Path fill={filled ? '#77B255' : '#D1D5DB'} d="M31.096 8.933c3.535-2.122 4.408-8.32 3.701-7.613c.707-.707-5.657 0-7.778 3.536c0-1.414-1.414-7.071-3.535-2.121c-2.122 4.95-1.415 5.657-1.415 7.071c0 1.414 2.829 1.414 2.829 1.414s-.125 2.704 1.29 2.704c1.414 0 1.997.583 6.946-1.538c4.95-2.122-.624-3.453-2.038-3.453z" />
    <Path fill={filled ? '#F4900C' : '#D1D5DB'} d="M22.422 23.594C14.807 31.209 2.27 36.675.502 34.907c-1.768-1.768 3.699-14.305 11.313-21.92c7.615-7.615 11.53-7.562 14.85-4.243c3.319 3.32 3.372 7.235-4.243 14.85z" />
    <Path fill={filled ? '#D67503' : '#9CA3AF'} d="M21.875 14.56c-.972-.972-2.77-2.785-4.692-6.106a25.419 25.419 0 0 0-2.409 1.808c2.803 3.613 8.121 5.317 7.101 4.298zm-7.485 8.072c-1.041-1.041-3.03-3.05-5.105-6.846a48.86 48.86 0 0 0-1.98 2.57c2.807 3.597 8.101 5.292 7.085 4.276zm9.301-.351c-3.581-2.008-5.49-3.91-6.502-4.921c-1.02-1.022.692 4.315 4.317 7.114a94.795 94.795 0 0 0 2.185-2.193zm-12.183 9.324a54.359 54.359 0 0 0 2.715-1.597c-3.273-1.905-5.069-3.683-6.034-4.648c-.922-.923.386 3.347 3.319 6.245z" />
  </Svg>
);

export default function RateRecipeModal({
  isVisible,
  recipeId,
  recipeName,
  recipeImage,
  mealId,
  onClose,
}: RateRecipeModalProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const env = useEnvironment();
  const navigation = useNavigation<NativeStackNavigationProp<InitialStackParamList>>();
  const [createFeedback, { isLoading: isCreateLoading }] = useCreateFeedbackMutation();
  const [updateFeedback, { isLoading: isUpdateLoading }] = useUpdateFeedbackMutation();
  const { data: existingFeedbacks } = useGetFeedbacksForFrameworkQuery(
    { id: recipeId },
    { skip: !isVisible }
  );

  const effectiveMealId = useMemo(() => mealId ?? recipeId, [mealId, recipeId]);
  const isLoading = isCreateLoading || isUpdateLoading;

  const handleSubmitRating = async () => {
    if (!selectedRating) {
      Alert.alert('Please select a rating', 'Choose how many carrots you\'d give this recipe');
      return;
    }

    try {
      const existingForMeal = existingFeedbacks?.find(f => f.data?.meal_id === effectiveMealId);

      console.log('[RateRecipeModal] Submitting rating:', {
        existingForMeal,
        selectedRating,
        review,
        effectiveMealId,
      });

      if (existingForMeal) {
        console.log('[RateRecipeModal] Updating existing feedback with ID:', existingForMeal.id);
        await updateFeedback({
          id: existingForMeal.id?.toString() || existingForMeal.id,
          rating: selectedRating,
          review: review.trim() || undefined,
          didYouLikeIt: selectedRating >= 4,
          mealId: effectiveMealId,
        }).unwrap();
      } else {
        console.log('[RateRecipeModal] Creating new feedback');
        await createFeedback({
          frameworkId: recipeId,
          prompted: false,
          didYouLikeIt: selectedRating >= 4,
          foodSaved: 0,
          mealId: effectiveMealId,
          rating: selectedRating,
          review: review.trim() || undefined,
        }).unwrap();
      }

      Alert.alert('Thanks!', 'Your rating has been submitted');
      handleClose();
    } catch (error: any) {
      console.error('[RateRecipeModal] Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleClose = () => {
    // Reset state
    setSelectedRating(null);
    setReview('');
    onClose();
    // Navigate to Make home
    navigation.navigate('Root', {
      screen: 'Make',
      params: { screen: 'MakeHome' },
    } as const);
  };

  const ratingDescriptions = [
    '', 
    'Not Good',
    'Could Be Better',
    'Good',
    'Great',
    'Amazing!',
  ];

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible}>
      <View style={tw`z-10 flex-1 items-center justify-center bg-black bg-opacity-50 px-5`}>
        <Animatable.View
          animation="fadeInUp"
          duration={500}
          useNativeDriver
          style={tw`w-full max-w-[380px] rounded-3xl bg-white p-6 shadow-2xl`}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Recipe Image */}
            <View style={tw`items-center pb-4`}>
              {recipeImage ? (
                <Image
                  source={bundledSource(recipeImage, env.useBundledContent)}
                  style={tw`h-24 w-24 rounded-2xl`}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/placeholder/frying-pan.png' }}
                  style={tw`h-24 w-24`}
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Title */}
            <Text style={tw.style(h7TextStyle, 'pb-1 text-center text-eggplant')} maxFontSizeMultiplier={1}>
              How was your meal?
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'pb-5 text-center text-midgray')}>
              {recipeName}
            </Text>

            {/* Carrot Rating */}
            <View style={tw`items-center pb-2`}>
              <Text style={tw.style(subheadMediumUppercase, 'pb-4 text-center text-midgray')}>
                Tap to rate
              </Text>
              <View style={tw`flex-row gap-3`}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Pressable
                    key={rating}
                    onPress={() => setSelectedRating(rating)}
                    style={tw`items-center`}
                  >
                    <CarrotIcon
                      size={44}
                      filled={selectedRating !== null && rating <= selectedRating}
                    />
                  </Pressable>
                ))}
              </View>
              {selectedRating !== null && (
                <Text style={tw.style(bodyMediumRegular, 'pt-3 font-sans-bold text-[#FF6B35]')}>
                  {ratingDescriptions[selectedRating]}
                </Text>
              )}
            </View>

            {/* Optional Review */}
            <View style={tw`pb-5 pt-4`}>
              <Text style={tw.style(subheadMediumUppercase, 'pb-2 text-midgray')}>
                Add a review (optional)
              </Text>
              <TextInput
                style={tw`min-h-20 rounded-xl border border-strokecream bg-white px-3 py-2.5 text-base`}
                placeholder="Tell us what you thought..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                value={review}
                onChangeText={setReview}
                maxLength={500}
              />
              <Text style={tw`pt-1 text-right text-xs text-midgray`}>
                {review.length}/500
              </Text>
            </View>

            {/* Buttons */}
            <View style={tw`pt-2`}>
              <SecondaryButton
                style={tw`rounded-full`}
                onPress={handleSubmitRating}
                loading={isLoading}
                disabled={!selectedRating || isLoading}
              >
                Submit Rating
              </SecondaryButton>
              <Pressable onPress={handleSkip} style={tw`mt-3 py-2`}>
                <Text style={tw`text-center text-sm text-midgray underline`}>
                  Skip for now
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animatable.View>
      </View>
      <Image
        style={tw`absolute h-full w-full bg-eggplant`}
        resizeMode="cover"
        source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/placeholder/background-modal.png' }}
      />
    </Modal>
  );
}
