import React, { useEffect, useState } from 'react';
import { View, Text, Image, Modal, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import tw from '../../../common/tailwind';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import { h7TextStyle, bodyMediumRegular, subheadMediumUppercase, bodySmallRegular } from '../../../theme/typography';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import useEnvironment from '../../environment/hooks/useEnvironment';
import axios from 'axios';
import EnvironmentManager from '../../environment/environmentManager';
import useAccessToken from '../../auth/hooks/useSessionToken';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InitialStackParamList } from '../../navigation/navigator/InitialNavigator';

interface RatingTag {
  _id: string;
  name: string;
  order: number;
  description?: string;
}

interface RateRecipeModalProps {
  isVisible: boolean;
  recipeId: string;
  recipeName: string;
  recipeImage?: string;
  onClose: () => void;
}

export default function RateRecipeModal({
  isVisible,
  recipeId,
  recipeName,
  recipeImage,
  onClose,
}: RateRecipeModalProps) {
  const [ratingTags, setRatingTags] = useState<RatingTag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const env = useEnvironment();
  const navigation = useNavigation<NativeStackNavigationProp<InitialStackParamList>>();
  const accessToken = useAccessToken();

  useEffect(() => {
    if (isVisible) {
      fetchRatingTags();
    }
  }, [isVisible]);

  const fetchRatingTags = async () => {
    try {
      setIsLoadingTags(true);
      const baseUrl = EnvironmentManager.shared.apiUrl();
      const response = await axios.get(`${baseUrl}/api/rating-tags/active`);
      // Sort by order descending (highest first)
      const sortedTags = response.data.sort((a: RatingTag, b: RatingTag) => b.order - a.order);
      setRatingTags(sortedTags);
    } catch (error) {
      console.error('Error fetching rating tags:', error);
      Alert.alert('Error', 'Failed to load rating options');
    } finally {
      setIsLoadingTags(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedTagId) {
      Alert.alert('Please select a rating', 'Choose how you feel about this recipe');
      return;
    }

    try {
      setIsLoading(true);
      const baseUrl = EnvironmentManager.shared.apiUrl();

      const payload = {
        recipeId,
        ratingTagId: selectedTagId,
        review: review.trim() || undefined,
      };

      await axios.post(
        `${baseUrl}/api/recipe-ratings`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      Alert.alert('Thanks!', 'Your rating has been submitted');
      handleClose();
    } catch (error: any) {
      console.error('[RateRecipeModal] Error submitting rating:', error);
      console.error('[RateRecipeModal] Error response:', error.response?.data);
      
      if (error.response?.status === 409) {
        Alert.alert('Already rated', 'You have already rated this recipe');
      } else if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Please log in again to submit your rating');
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Invalid data provided';
        Alert.alert('Validation Error', `Failed to submit rating: ${Array.isArray(message) ? message.join(', ') : message}`);
      } else {
        Alert.alert('Error', 'Failed to submit rating. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleClose = () => {
    // Reset state
    setSelectedTagId(null);
    setReview('');
    onClose();
    // Navigate to Make home
    navigation.navigate('Root', {
      screen: 'Make',
      params: { screen: 'MakeHome' },
    } as const);
  };

  const COLOR_PALETTE = [
    '#F87171', // Red/Pink
    '#FBBF24', // Yellow
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#F59E0B', // Orange
    '#14B8A6', // Teal
    '#6366F1', // Indigo
    '#EF4444', // Red
  ];

  const getRatingColor = (index: number): string => {
    return COLOR_PALETTE[index % COLOR_PALETTE.length];
  };

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible}>
      <View style={tw`z-10 flex-1 items-center justify-center bg-black bg-opacity-0`}>
        <Animatable.View
          animation="fadeInUp"
          duration={500}
          useNativeDriver
          style={tw`mx-5 w-full max-w-md rounded-2lg border bg-white pb-6`}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Recipe Image */}
            <View style={tw`items-center pt-6`}>
              {recipeImage ? (
                <Image
                  source={bundledSource(recipeImage, env.useBundledContent)}
                  style={tw`h-40 w-40 rounded-2lg`}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../../../../assets/placeholder/frying-pan.png')}
                  style={tw`h-40 w-40`}
                  resizeMode="contain"
                />
              )}
            </View>

            <View style={tw`px-6 pt-6`}>
              {/* Title */}
              <Text style={tw.style(h7TextStyle, 'pb-1 text-center text-eggplant')} maxFontSizeMultiplier={1}>
                How was your meal?
              </Text>
              <Text style={tw.style(bodyMediumRegular, 'pb-6 text-center text-midgray')}>
                {recipeName}
              </Text>

              {/* Rating Tags */}
              <View style={tw`pb-5`}>
                <Text style={tw.style(subheadMediumUppercase, 'pb-3 text-center text-midgray')}>
                  Rate this recipe
                </Text>
                {isLoadingTags ? (
                  <View style={tw`py-8`}>
                    <Text style={tw`text-center text-midgray`}>Loading...</Text>
                  </View>
                ) : (
                  <View style={tw`gap-2.5`}>
                    {ratingTags.map((tag, index) => {
                      const isSelected = selectedTagId === tag._id;
                      const color = getRatingColor(index);
                      return (
                        <Pressable
                          key={tag._id}
                          onPress={() => setSelectedTagId(tag._id)}
                          style={[
                            tw`flex-row items-center justify-between rounded-lg border-2 px-4 py-3.5`,
                            {
                              borderColor: isSelected ? color : '#E5E7EB',
                              backgroundColor: isSelected ? `${color}15` : 'white',
                            },
                          ]}
                        >
                          <View style={tw`flex-1`}>
                            <Text
                              style={[
                                tw.style(bodyMediumRegular, 'font-sans-bold'),
                                { color: isSelected ? color : '#000' },
                              ]}
                            >
                              {tag.name}
                            </Text>
                            {tag.description && (
                              <Text style={tw.style(bodySmallRegular, 'pt-1 text-midgray')}>
                                {tag.description}
                              </Text>
                            )}
                          </View>
                          {isSelected && (
                            <View
                              style={[
                                tw`ml-2 h-6 w-6 items-center justify-center rounded-full`,
                                { backgroundColor: color },
                              ]}
                            >
                              <Text style={tw`font-sans-bold text-sm text-white`}>✓</Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Optional Review */}
              <View style={tw`pb-5`}>
                <Text style={tw.style(subheadMediumUppercase, 'pb-2 text-midgray')}>
                  Add a review (optional)
                </Text>
                <TextInput
                  style={tw`min-h-24 rounded-lg border border-strokecream bg-white px-3 py-2.5 text-base`}
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
              <View>
                <SecondaryButton
                  style={tw`rounded-md`}
                  onPress={handleSubmitRating}
                  loading={isLoading}
                  disabled={!selectedTagId || isLoading}
                >
                  Submit Rating
                </SecondaryButton>
                <Pressable onPress={handleSkip} style={tw`mt-4 py-2`}>
                  <Text style={tw`text-center text-midgray underline`}>
                    Skip for now
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </Animatable.View>
      </View>
      <Image
        style={tw`absolute h-full w-full bg-eggplant opacity-80`}
        resizeMode="cover"
        source={require('../../../../assets/placeholder/background-modal.png')}
      />
    </Modal>
  );
}
