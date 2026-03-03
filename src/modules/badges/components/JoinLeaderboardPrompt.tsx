import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import {
  bodyMediumRegular,
  bodySmallBold,
  bodySmallRegular,
  h5TextStyle,
  h6TextStyle,
  subheadSmallUppercase,
} from '../../../theme/typography';
import { cardDrop } from '../../../theme/shadow';
import { useJoinLeaderboardMutation } from '../api/api';

interface Props {
  onJoined: () => void;
}

export default function JoinLeaderboardPrompt({ onJoined }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [joinLeaderboard, { isLoading }] = useJoinLeaderboardMutation();

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 220, animated: true });
      }, 60);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleJoin = async () => {
    const trimmed = displayName.trim();
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (trimmed.length > 30) {
      setError('Name must be 30 characters or less');
      return;
    }
    setError('');
    try {
      await joinLeaderboard({ displayName: trimmed }).unwrap();
      onJoined();
    } catch (e: any) {
      setError(e?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-creme`}
    >
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw.style(
          'flex-grow px-6 items-center',
          isKeyboardVisible ? 'justify-start pt-2 pb-8' : 'justify-center',
        )}
      >
        <View
          style={[
            tw`mb-6 h-28 w-28 items-center justify-center rounded-full`,
            { backgroundColor: '#F3EDFF' },
          ]}
        >
          <View
            style={[
              tw`h-20 w-20 items-center justify-center rounded-full`,
              { backgroundColor: '#EFE7FF' },
            ]}
          >
            <Ionicons name="trophy" size={44} color="#4B2176" />
          </View>
        </View>

        {/* Title */}
        <Text style={tw.style(h5TextStyle, 'text-center text-black mb-2')}>
          Join the Leaderboard
        </Text>

        {/* Description */}
        <Text style={tw.style(bodyMediumRegular, 'text-center text-stone mb-8 px-4 leading-5')}>
          Compete with other users! Choose a display name that will appear on the leaderboard rankings.
        </Text>

        <View style={tw`mb-4 w-full rounded-2xl border border-strokecream bg-white px-4 py-3`}>
          <Text style={tw.style(subheadSmallUppercase, 'text-stone mb-1')}>Live Preview</Text>
          <Text style={tw.style(h6TextStyle, 'text-eggplant')} numberOfLines={1}>
            {displayName.trim() || 'Your display name'}
          </Text>
        </View>

        {/* Card */}
        <View
          style={[
            tw`w-full rounded-3xl bg-white overflow-hidden`,
            { borderWidth: 1, borderColor: '#EEE4D7' },
            cardDrop,
          ]}
        >
          {/* Header strip */}
          <View style={[tw`px-5 py-4`, { backgroundColor: '#F3EDFF' }]}>
            <View style={tw`flex-row items-center`}>
              <View
                style={[
                  tw`h-9 w-9 items-center justify-center rounded-full mr-3`,
                  { backgroundColor: '#4B2176' },
                ]}
              >
                <Ionicons name="person" size={18} color="#FFFFFF" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw.style(bodySmallBold, 'text-black text-sm')}>
                  Your Display Name
                </Text>
                <Text style={tw.style(subheadSmallUppercase, 'text-stone mt-0.5')}>
                  visible to other players
                </Text>
              </View>
            </View>
          </View>

          {/* Input area */}
          <View style={tw`px-5 py-5`}>
            <View
              style={[
                tw`flex-row items-center rounded-2xl border px-4 py-3`,
                {
                  borderColor: error ? '#EF4444' : '#EEE4D7',
                  backgroundColor: '#FFFCF9',
                },
              ]}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={error ? '#EF4444' : '#4B2176'}
                style={tw`mr-3`}
              />
              <TextInput
                style={[
                  tw.style(bodyMediumRegular, 'flex-1 text-black'),
                  { fontSize: 16, paddingVertical: 0 },
                ]}
                placeholder="Enter your display name"
                placeholderTextColor={tw.color('stone')}
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  if (error) setError('');
                }}
                maxLength={30}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
                onFocus={() => {
                  setTimeout(() => {
                    scrollRef.current?.scrollTo({ y: 260, animated: true });
                  }, 80);
                }}
              />
              <Text style={tw.style(subheadSmallUppercase, 'text-stone ml-2')}>
                {displayName.length}/30
              </Text>
            </View>

            {error ? (
              <View style={tw`flex-row items-center mt-2 px-1`}>
                <Ionicons name="alert-circle" size={14} color="#EF4444" style={tw`mr-1`} />
                <Text style={tw.style(bodySmallRegular, 'text-red-500 text-xs')}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Join button */}
            <TouchableOpacity
              onPress={handleJoin}
              disabled={isLoading || displayName.trim().length < 2}
              style={[
                tw`mt-5 items-center justify-center rounded-2xl py-4`,
                {
                  backgroundColor:
                    isLoading || displayName.trim().length < 2
                      ? '#D1C4E9'
                      : '#4B2176',
                },
              ]}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="rocket" size={18} color="#FFFFFF" style={tw`mr-2`} />
                  <Text style={tw.style(bodySmallBold, 'text-white text-base')}>
                    Join Leaderboard
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy note */}
        <View style={tw`flex-row items-center mt-5 px-4`}>
          <Ionicons name="shield-checkmark-outline" size={14} color={tw.color('stone')} style={tw`mr-1.5`} />
          <Text style={tw.style(subheadSmallUppercase, 'text-stone')}>
            Only your display name is shown publicly
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
