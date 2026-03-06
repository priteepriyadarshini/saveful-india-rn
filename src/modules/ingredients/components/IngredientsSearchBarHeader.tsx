import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import tw from '../../../common/tailwind';
import { bodyMediumRegular } from '../../../theme/typography';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Alert, Animated, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  isSpeechRecognitionAvailable,
} from '../../inventory/utils/speechRecognition';

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
  const [isListening, setIsListening] = useState(false);
  const finalTranscriptRef = useRef('');

  const headerOpacity = animatedValue.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useSpeechRecognitionEvent('result', (event) => {
    const latest = event.results?.[0]?.transcript || '';
    if (!latest) return;

    if (event.isFinal) {
      finalTranscriptRef.current = latest;
    }
    setSearchInput(latest);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('error', () => {
    setIsListening(false);
  });

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (ExpoSpeechRecognitionModule) {
      ExpoSpeechRecognitionModule.stop();
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!isSpeechRecognitionAvailable || !ExpoSpeechRecognitionModule) {
      Alert.alert('Voice unavailable', 'Voice input requires a development build.');
      return;
    }

    try {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Microphone permission is needed for voice input.');
        return;
      }

      finalTranscriptRef.current = '';
      setIsListening(true);

      ExpoSpeechRecognitionModule.start({
        lang: 'en-IN',
        interimResults: true,
        continuous: false,
      });
    } catch (error) {
      setIsListening(false);
      Alert.alert('Error', 'Unable to start voice input on this device.');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);

  return (
    <View style={tw`relative z-10`}>
      <Animated.View
        style={[
          tw`absolute left-0 right-0 z-10 h-full bg-white shadow-md`,
          {
            opacity: headerOpacity,
          },
        ]}
      />
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
            <View
              style={tw`flex-row items-center justify-between rounded-md border border-strokecream bg-white px-4 py-3`}
            >
              <TextInput
                style={tw.style(bodyMediumRegular, 'grow text-midgray')}
                placeholderTextColor={'#575757'}
                placeholder={isListening ? 'Listening…' : 'Search ingredients'}
                value={searchInput}
                onChangeText={setSearchInput}
              />
              {searchInput.length > 0 ? (
                <Pressable onPress={() => setSearchInput('')}>
                  <Feather name="x" size={20} color={tw.color('black')} />
                </Pressable>
              ) : (
                <Feather name="search" size={20} color={tw.color('black')} />
              )}
              <Pressable
                onPress={isListening ? stopListening : startListening}
                style={tw.style(
                  'w-8 h-8 rounded-full items-center justify-center ml-2',
                  isListening ? 'bg-red-100' : 'bg-purple-100',
                )}
                accessibilityRole="button"
                accessibilityLabel={isListening ? 'Stop voice input' : 'Start voice input'}
              >
                <Ionicons
                  name={isListening ? 'stop' : 'mic'}
                  size={16}
                  color={isListening ? '#EF4444' : '#7C3AED'}
                />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
