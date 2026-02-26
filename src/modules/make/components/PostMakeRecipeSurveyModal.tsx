import React, { useState } from 'react';
import { View, Text, Image, Modal, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Animatable from 'react-native-animatable';
import tw from '../../../common/tailwind';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import { h7TextStyle, bodyMediumRegular, subheadMediumUppercase } from '../../../theme/typography';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import useEnvironment from '../../environment/hooks/useEnvironment';

interface PostMakeRecipeSurveyModalProps {
  isVisible: boolean;
  recipeId: string; // This is the framework_id / meal_id
  recipeName: string;
  recipeImage?: string;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
}

// Carrot Icon Component
const CarrotIcon = ({ size = 24, filled = false }: { size?: number; filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 504.123 504.123">
    <Path d="M331.232,154.963c0,43.725-35.446,349.16-79.171,349.16s-79.171-305.436-79.171-349.16s35.446-62.929,79.171-62.929C295.786,92.034,331.232,111.238,331.232,154.963z" fill={filled ? '#FF860D' : '#D1D5DB'} />
    <Path d="M296.724,154.963c0,43.725-20,349.16-44.662,349.16s-44.662-305.436-44.662-349.16s20-62.929,44.662-62.929S296.724,111.238,296.724,154.963z" fill={filled ? '#E56107' : '#D1D5DB'} />
    <Path d="M221.964,152.6c0,2.426-1.969,4.403-4.411,4.403h-18.251c-2.434,0-4.411-1.977-4.411-4.403l0,0c0-2.434,1.977-4.403,4.411-4.403h18.251C219.995,148.196,221.964,150.166,221.964,152.6L221.964,152.6z" fill={filled ? '#E56107' : '#D1D5DB'} />
    <Path d="M245.634,181.689c0,2.434-1.961,4.403-4.403,4.403H222.98c-2.442,0-4.411-1.969-4.411-4.403l0,0c0-2.426,1.969-4.403,4.411-4.403h18.251C243.673,177.294,245.634,179.271,245.634,181.689L245.634,181.689z" fill={filled ? '#FF860D' : '#D1D5DB'} />
    <Path d="M221.964,216.544c0,2.426-1.969,4.403-4.411,4.403h-18.251c-2.434,0-4.411-1.977-4.411-4.403l0,0c0-2.434,1.977-4.403,4.411-4.403h18.251C219.995,212.149,221.964,214.118,221.964,216.544L221.964,216.544z" fill={filled ? '#E56107' : '#D1D5DB'} />
    <Path d="M245.634,245.642c0,2.426-1.961,4.395-4.403,4.395H222.98c-2.442,0-4.411-1.969-4.411-4.395l0,0c0-2.426,1.969-4.403,4.411-4.403h18.251C243.673,241.239,245.634,243.216,245.634,245.642L245.634,245.642z" fill={filled ? '#FF860D' : '#D1D5DB'} />
    <Path d="M221.964,280.489c0,2.418-1.969,4.403-4.411,4.403h-18.251c-2.434,0-4.411-1.985-4.411-4.403l0,0c0-2.434,1.977-4.403,4.411-4.403h18.251C219.995,276.094,221.964,278.063,221.964,280.489L221.964,280.489z" fill={filled ? '#E56107' : '#D1D5DB'} />
    <Path d="M245.634,309.587c0,2.418-1.961,4.403-4.403,4.403H222.98c-2.442,0-4.411-1.985-4.411-4.403l0,0c0-2.434,1.969-4.403,4.411-4.403h18.251C243.673,305.184,245.634,307.153,245.634,309.587L245.634,309.587z" fill={filled ? '#FF860D' : '#D1D5DB'} />
    <Path d="M230.888,349.326c0,2.135-1.733,3.875-3.875,3.875h-16.077c-2.127,0-3.868-1.741-3.868-3.875l0,0c0-2.135,1.749-3.875,3.868-3.875h16.077C229.163,345.442,230.888,347.183,230.888,349.326L230.888,349.326z" fill={filled ? '#E56107' : '#D1D5DB'} />
    <Path d="M233.968,374.926c0,2.127-1.733,3.86-3.868,3.86h-16.085c-2.127,0-3.868-1.741-3.868-3.86l0,0c0-2.135,1.749-3.875,3.868-3.875h16.085C232.235,371.042,233.968,372.783,233.968,374.926L233.968,374.926z" fill={filled ? '#FF860D' : '#D1D5DB'} />
    <Path d="M232.968,412.058c0,1.725-1.386,3.119-3.111,3.119h-12.918c-1.709,0-3.111-1.402-3.111-3.119l0,0c0-1.709,1.402-3.111,3.111-3.111h12.918C231.582,408.954,232.968,410.356,232.968,412.058L232.968,412.058z" fill={filled ? '#E56107' : '#D1D5DB'} />
    <Path d="M249.698,432.632c0,1.709-1.386,3.111-3.111,3.111h-12.918c-1.709,0-3.111-1.402-3.111-3.111l0,0c0-1.725,1.402-3.111,3.111-3.111h12.918C248.312,429.521,249.698,430.907,249.698,432.632L249.698,432.632z" fill={filled ? '#FF860D' : '#D1D5DB'} />
    <Path d="M282.151,152.6c0,2.426,1.969,4.403,4.419,4.403h18.251c2.434,0,4.411-1.977,4.411-4.403l0,0c0-2.434-1.977-4.403-4.411-4.403H286.57C284.121,148.196,282.151,150.166,282.151,152.6L282.151,152.6z" fill={filled ? '#E56107' : '#D1D5DB'} />
    <Path d="M258.481,181.689c0,2.434,1.969,4.403,4.411,4.403h18.251c2.434,0,4.411-1.969,4.411-4.403l0,0c0-2.426-1.977-4.403-4.411-4.403h-18.251C260.45,177.294,258.481,179.271,258.481,181.689L258.481,181.689z" fill={filled ? '#FF860D' : '#D1D5DB'} />
    <Path d="M282.151,216.544c0,2.426,1.969,4.403,4.419,4.403h18.251c2.434,0,4.411-1.977,4.411-4.403l0,0c0-2.434-1.977-4.403-4.411-4.403H286.57C284.121,212.149,282.151,214.118,282.151,216.544L282.151,216.544z" fill={filled ? '#E56107' : '#D1D5DB'} />
    <Path d="M258.481,245.642c0,2.426,1.969,4.395,4.411,4.395h18.251c2.434,0,4.411-1.969,4.411-4.395l0,0c0-2.426-1.977-4.403-4.411-4.403h-18.251C260.45,241.239,258.481,243.216,258.481,245.642L258.481,245.642z" fill={filled ? '#FF860D' : '#D1D5DB'} />
    <Path d="M282.151,280.489c0,2.418,1.969,4.403,4.419,4.403h18.251c2.434,0,4.411-1.985,4.411-4.403l0,0c0-2.434-1.977-4.403-4.411-4.403H286.57C284.121,276.094,282.151,278.063,282.151,280.489L282.151,280.489z" fill={filled ? '#E56107' : '#D1D5DB'} />
    <Path d="M258.481,309.587c0,2.418,1.969,4.403,4.411,4.403h18.251c2.434,0,4.411-1.985,4.411-4.403l0,0c0-2.434-1.977-4.403-4.411-4.403h-18.251C260.45,305.184,258.481,307.153,258.481,309.587L258.481,309.587z" fill={filled ? '#FF860D' : '#D1D5DB'} />
    <Path d="M273.235,349.326c0,2.135,1.733,3.875,3.868,3.875h16.085c2.127,0,3.868-1.741,3.868-3.875l0,0c0-2.135-1.749-3.875-3.868-3.875h-16.085C274.96,345.442,273.235,347.183,273.235,349.326L273.235,349.326z" fill={filled ? '#E56107' : '#D1D5DB'} />
    <Path d="M268.635,374.926c0,2.127,1.733,3.86,3.875,3.86h16.077c2.127,0,3.868-1.741,3.868-3.86l0,0c0-2.135-1.749-3.875-3.868-3.875H272.51C270.36,371.042,268.635,372.783,268.635,374.926L268.635,374.926z" fill={filled ? '#FF860D' : '#D1D5DB'} />
    <Path d="M271.155,412.058c0,1.725,1.386,3.119,3.111,3.119h12.918c1.709,0,3.104-1.402,3.104-3.119l0,0c0-1.709-1.394-3.111-3.104-3.111h-12.918C272.542,408.954,271.155,410.356,271.155,412.058L271.155,412.058z" fill={filled ? '#E56107' : '#D1D5DB'} />
    <Path d="M254.417,432.632c0,1.709,1.394,3.111,3.119,3.111h12.918c1.709,0,3.111-1.402,3.111-3.111l0,0c0-1.725-1.402-3.111-3.111-3.111h-12.918C255.811,429.521,254.417,430.907,254.417,432.632L254.417,432.632z" fill={filled ? '#FF860D' : '#D1D5DB'} />
    <Path d="M319.835,118.603c-13.855-18.18-38.975-26.569-67.773-26.569s-53.918,8.389-67.773,26.569c4.001,15.699,32.784,10.862,67.773,10.862C287.035,129.465,315.833,134.302,319.835,118.603z" fill={filled ? '#FFAF10' : '#D1D5DB'} />
    <Path d="M252.062,129.465c15.848,0,30.381,0.985,41.96,0.614c-6.207-26.167-22.638-38.046-41.96-38.046c-19.33,0-35.753,11.878-41.96,38.046C221.68,130.45,236.213,129.465,252.062,129.465z" fill={filled ? '#FF860D' : '#D1D5DB'} />
    <Path d="M214.693,32.855c3.891,5.467,43.827,70.955,38.361,74.854c-5.467,3.899-54.304-55.257-58.21-60.723c-3.899-5.474-2.631-13.084,2.851-16.983C203.177,26.096,210.786,27.38,214.693,32.855z" fill={filled ? '#68AD27' : '#D1D5DB'} />
    <Path d="M206.281,61.07c4.049,3.135,47.474,42.157,44.339,46.19c-3.135,4.049-51.688-28.412-55.721-31.555c-4.041-3.143-4.781-8.964-1.631-13.013C196.387,58.652,202.232,57.927,206.281,61.07z" fill={filled ? '#5C8729' : '#D1D5DB'} />
    <Path d="M237.214,25.726c2.158,6.372,21.48,80.597,15.1,82.755c-6.372,2.15-36.013-68.592-38.179-74.965c-2.143-6.365,1.268-13.28,7.648-15.439C228.147,15.927,235.071,19.346,237.214,25.726z" fill={filled ? '#7FCC2E' : '#D1D5DB'} />
    <Path d="M289.43,32.855c-3.899,5.467-43.835,70.955-38.361,74.854c5.467,3.899,54.303-55.257,58.21-60.723c3.899-5.474,2.623-13.084-2.844-16.983C300.946,26.096,293.337,27.38,289.43,32.855z" fill={filled ? '#68AD27' : '#D1D5DB'} />
    <Path d="M297.842,61.07c-4.049,3.135-47.482,42.157-44.339,46.19c3.135,4.049,51.688-28.412,55.721-31.555c4.033-3.143,4.773-8.964,1.631-13.013C307.728,58.652,301.891,57.927,297.842,61.07z" fill={filled ? '#5C8729' : '#D1D5DB'} />
    <Path d="M266.91,25.726c-2.15,6.372-21.48,80.597-15.108,82.755c6.388,2.15,36.021-68.592,38.187-74.965c2.135-6.365-1.276-13.28-7.648-15.439C275.976,15.927,269.052,19.346,266.91,25.726z" fill={filled ? '#7FCC2E' : '#D1D5DB'} />
    <Path d="M265.255,13.194c0,7.294-5.908,95.752-13.194,95.752s-13.194-88.458-13.194-95.752C238.868,5.908,244.775,0,252.062,0S265.255,5.908,265.255,13.194z" fill={filled ? '#5C8729' : '#D1D5DB'} />
  </Svg>
);

export default function PostMakeRecipeSurveyModal({
  isVisible,
  recipeId,
  recipeName,
  recipeImage,
  onClose,
  onSubmit,
}: PostMakeRecipeSurveyModalProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const env = useEnvironment();

  const handleSubmitSurvey = () => {
    if (!selectedRating) {
      Alert.alert('Please select a rating', 'Choose how many carrots you\'d give this recipe');
      return;
    }

    // Submit rating to parent and let parent control visibility.
    // Do not call onClose here, as some parents use onClose to indicate skip.
    onSubmit(selectedRating, review.trim());
    setSelectedRating(null);
    setReview('');
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleClose = () => {
    setSelectedRating(null);
    setReview('');
    onClose();
  };

  const ratingDescriptions = [
    '', // 0 - no rating
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
                onPress={handleSubmitSurvey}
                disabled={!selectedRating}
              >
                Continue
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
