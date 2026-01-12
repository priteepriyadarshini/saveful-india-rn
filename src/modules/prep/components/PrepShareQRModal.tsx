import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import tw from '../../../common/tailwind';
import { h6TextStyle, bodyMediumBold, bodySmallRegular } from '../../../theme/typography';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';

interface PrepShareQRModalProps {
  isVisible: boolean;
  onClose: () => void;
  recipeSlug: string;
  recipeTitle: string;
}

export default function PrepShareQRModal({
  isVisible,
  onClose,
  recipeSlug,
  recipeTitle,
}: PrepShareQRModalProps) {
  // Create Expo-compatible deep link URL
  const recipeUrl = Linking.createURL(`make/prep/${recipeSlug}`);
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: ${recipeTitle}\n\nOpen in Saveful app:\n${recipeUrl}`,
        url: recipeUrl, // For iOS
        title: recipeTitle,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share recipe');
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-black/50`}>
        <SafeAreaView style={tw`flex-1`} edges={['top', 'bottom']}>
          <View style={tw`flex-1 justify-end`}>
            <View style={tw`bg-white rounded-t-3xl px-6 pt-6 pb-8`}>
              {/* Header */}
              <View style={tw`flex-row items-center justify-between mb-6`}>
                <Text style={tw.style(h6TextStyle)}>Share Recipe</Text>
                <Pressable
                  onPress={onClose}
                  style={tw`h-10 w-10 items-center justify-center`}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Feather name="x" size={24} color="black" />
                </Pressable>
              </View>

              {/* Recipe Title */}
              <Text style={tw.style(bodyMediumBold, 'text-center mb-2')}>
                {recipeTitle}
              </Text>

              {/* QR Code Container */}
              <View style={tw`items-center justify-center bg-white p-6 mb-6`}>
                <View style={tw`bg-white p-4 rounded-2xl shadow-lg`}>
                  <QRCode
                    value={recipeUrl}
                    size={240}
                    backgroundColor="white"
                    color="black"
                  />
                </View>
              </View>

              {/* Instructions */}
              <Text style={tw.style(bodySmallRegular, 'text-center text-gray-600 mb-6')}>
                Scan this QR code to view the recipe on any device
              </Text>

              {/* Share Button */}
              <PrimaryButton
                width="full"
                buttonSize="large"
                variant="solid-black"
                onPress={handleShare}
              >
                <View style={tw`flex-row items-center gap-2`}>
                  <Feather name="share-2" size={18} color="white" />
                  <Text style={tw`font-sans-bold text-lg text-white`}>
                    Share Link
                  </Text>
                </View>
              </PrimaryButton>

              {/* URL Display */}
              <View style={tw`mt-4 p-3 bg-gray-100 rounded-lg`}>
                <Text style={tw.style(bodySmallRegular, 'text-center text-gray-700')}>
                  {recipeUrl}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
