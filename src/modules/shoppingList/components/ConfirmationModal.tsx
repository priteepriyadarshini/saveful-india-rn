import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { bodyMediumRegular, bodyMediumBold, h6TextStyle } from '../../../theme/typography';

interface ConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'eggplant',
  icon = 'checkmark-circle',
  iconColor = 'kale',
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={tw`flex-1 bg-black bg-opacity-50 items-center justify-center px-5`}
        onPress={onClose}
      >
        <Pressable
          style={tw`bg-white rounded-3xl w-full max-w-sm overflow-hidden`}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Icon Header */}
          <View style={tw`items-center pt-8 pb-4`}>
            <View style={tw`h-20 w-20 rounded-full bg-${iconColor} bg-opacity-10 items-center justify-center mb-4`}>
              <Ionicons name={icon} size={40} color={tw.color(iconColor)} />
            </View>
            <Text style={tw.style(h6TextStyle, 'text-eggplant text-center px-6')}>
              {title}
            </Text>
          </View>

          {/* Message */}
          <View style={tw`px-6 pb-6`}>
            <Text style={tw.style(bodyMediumRegular, 'text-stone text-center')}>
              {message}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={tw`flex-row border-t border-strokecream`}>
            <Pressable
              onPress={onClose}
              style={tw`flex-1 py-4 items-center border-r border-strokecream`}
              disabled={isLoading}
            >
              <Text style={tw.style(bodyMediumBold, 'text-stone')}>
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={tw`flex-1 py-4 items-center`}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={tw.color(confirmColor)} />
              ) : (
                <Text style={tw.style(bodyMediumBold, `text-${confirmColor}`)}>
                  {confirmText}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
