import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import DebouncedPressable from '../../../common/components/DebouncePressable';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import tw from '../../../common/tailwind';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import OutlineButton from '../../../common/components/ThemeButtons/OutlineButton';
import { useCreateGroupChallengeMutation } from '../../../modules/groups/api/api';
import { bodySmallRegular, h5TextStyle } from '../../../theme/typography';
import { useGetCookedRecipesQuery } from '../../analytics/api/api';

export default function CreateChallengeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };

  const [challengeName, setChallengeName] = useState('');
  const [description, setDescription] = useState('');
  const [challengeGoals, setChallengeGoals] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  ); // 1 week from now
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [createChallenge, { isLoading }] = useCreateGroupChallengeMutation();
  const { data: cookedSummary } = useGetCookedRecipesQuery();

  const handleCreateChallenge = async () => {
    if (!challengeName.trim()) {
      Alert.alert('Error', 'Please enter a challenge name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a challenge description');
      return;
    }

    const goalsNumber = parseInt(challengeGoals);
    if (!challengeGoals.trim() || isNaN(goalsNumber) || goalsNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid goal (Meals to be cooked)');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    try {
      await createChallenge({
        communityId: groupId,
        challengeName: challengeName.trim(),
        description: description.trim(),
        startDate,
        endDate,
        challengeGoals: goalsNumber,
      }).unwrap();

      Alert.alert('Success', 'Challenge created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      const { getSafeErrorMessage } = require('../../../modules/forms/validation');
      Alert.alert(
        'Error',
        getSafeErrorMessage(error, 'Failed to create challenge. Please try again.'),
      );
    }
  };

  return (
    <SafeAreaView style={tw.style('flex-1 bg-creme')}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw.style('flex-1')}
      >
        <ScrollView
          contentContainerStyle={tw.style('p-5')}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={tw.style('mb-4 flex-row items-center justify-between')}>
            <DebouncedPressable onPress={() => navigation.goBack()} style={tw.style('w-10 h-10 items-center justify-center')}>
              <Feather name="arrow-left" size={24} color="#1F1F1F" />
            </DebouncedPressable>
            <Text style={tw.style(h5TextStyle, 'text-darkgray')}>Create a Challenge</Text>
            <View style={tw.style('w-10')} />
          </View>

          {/* Your Meals Cooked (context) */}
          <View style={tw.style('mb-4 rounded-2xl border border-strokecream bg-white p-4')}>            
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>Your meals cooked</Text>
            <Text style={tw.style('mt-1 font-saveful-bold text-darkgray') as any}>
              {cookedSummary?.numberOfMealsCooked ?? 0}
            </Text>
          </View>

          {/* Challenge Name */}
          <View style={tw.style('mb-4')}>
            <Text style={tw.style(bodySmallRegular, 'mb-2 text-darkgray')}>
              Challenge Name *
            </Text>
            <TextInput
              style={tw.style(
                'rounded-lg border border-strokecream bg-white px-4 py-3 font-saveful text-base text-darkgray',
              )}
              placeholder="Enter challenge name"
              placeholderTextColor="#999"
              value={challengeName}
              onChangeText={setChallengeName}
              maxLength={50}
            />
          </View>

          {/* Description */}
          <View style={tw.style('mb-4')}>
            <Text style={tw.style(bodySmallRegular, 'mb-2 text-darkgray')}>
              Description *
            </Text>
            <TextInput
              style={tw.style(
                'rounded-lg border border-strokecream bg-white px-4 py-3 font-saveful text-base text-darkgray',
              )}
              placeholder="Describe the challenge"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text
              style={tw.style(
                bodySmallRegular,
                'mt-1 text-right text-midgray',
              )}
            >
              {description.length}/200
            </Text>
          </View>

          {/* Goal (Meals) */}
          <View style={tw.style('mb-4')}>
            <Text style={tw.style(bodySmallRegular, 'mb-2 text-darkgray')}>
              Goal (Meals to be cooked) *
            </Text>
            <TextInput
              style={tw.style(
                'rounded-lg border border-strokecream bg-white px-4 py-3 font-saveful text-base text-darkgray',
              )}
              placeholder="e.g., 20"
              placeholderTextColor="#999"
              value={challengeGoals}
              onChangeText={setChallengeGoals}
              keyboardType="numeric"
            />
            <Text style={tw.style(bodySmallRegular, 'mt-1 text-midgray')}>
              Tip: Challenge goal counts number of meals. Grams saved will still be tracked and shown.
            </Text>
          </View>

          {/* Start Date */}
          <View style={tw.style('mb-4')}>
            <Text style={tw.style(bodySmallRegular, 'mb-2 text-darkgray')}>
              Start Date *
            </Text>
            <OutlineButton onPress={() => setShowStartPicker(true)}>
              {startDate.toLocaleDateString()}
            </OutlineButton>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowStartPicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* End Date */}
          <View style={tw.style('mb-6')}>
            <Text style={tw.style(bodySmallRegular, 'mb-2 text-darkgray')}>
              End Date *
            </Text>
            <OutlineButton onPress={() => setShowEndPicker(true)}>
              {endDate.toLocaleDateString()}
            </OutlineButton>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                minimumDate={startDate}
                onChange={(event, selectedDate) => {
                  setShowEndPicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setEndDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Buttons */}
          <View style={tw.style('flex-row gap-2')}>
            <OutlineButton
              onPress={() => navigation.goBack()}
              style={tw.style('flex-1')}
              disabled={isLoading}
            >
              Cancel
            </OutlineButton>
            <PrimaryButton
              onPress={handleCreateChallenge}
              style={tw.style('flex-1')}
              disabled={
                isLoading ||
                !challengeName.trim() ||
                !description.trim() ||
                !challengeGoals.trim()
              }
            >
              {isLoading ? 'Creating...' : 'Create'}
            </PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
