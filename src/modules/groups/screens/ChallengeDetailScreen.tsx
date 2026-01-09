import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import tw from '../../../common/tailwind';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import OutlineButton from '../../../common/components/ThemeButtons/OutlineButton';
import {
  useGetGroupChallengeQuery,
  useJoinGroupChallengeMutation,
  useLeaveGroupChallengeMutation,
} from '../../../modules/groups/api/api';
import { bodyLargeBold, bodySmallRegular, h5TextStyle, h6TextStyle } from '../../../theme/typography';
import { cardDrop } from '../../../theme/shadow';

export default function ChallengeDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, challengeId } = route.params as {
    groupId: string;
    challengeId: string;
  };

  const { data: challenge, isLoading, refetch } = useGetGroupChallengeQuery({
    challengeId,
  });

  const [joinChallenge, { isLoading: isJoining }] =
    useJoinGroupChallengeMutation();
  const [leaveChallenge, { isLoading: isLeaving }] =
    useLeaveGroupChallengeMutation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleJoinChallenge = async () => {
    try {
      await joinChallenge({
        communityId: groupId,
        challnageId: challengeId,
      }).unwrap();
      Alert.alert('Success', 'Joined challenge successfully!');
      refetch();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to join challenge. Please try again.',
      );
    }
  };

  const handleLeaveChallenge = () => {
    Alert.alert(
      'Leave Challenge',
      'Are you sure you want to leave this challenge?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveChallenge({
                communityId: groupId,
                challengeId,
              }).unwrap();
              Alert.alert('Success', 'Left challenge successfully');
              refetch();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error?.data?.message || 'Failed to leave challenge',
              );
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={tw.style('flex-1 items-center justify-center bg-creme')}
      >
        <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView
        style={tw.style('flex-1 items-center justify-center bg-creme')}
      >
        <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
          Challenge not found
        </Text>
      </SafeAreaView>
    );
  }

  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  const isActive = challenge.isActive;

  return (
    <SafeAreaView style={tw.style('flex-1 bg-creme')}>
      <ScrollView
        contentContainerStyle={tw.style('p-5')}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Challenge Header */}
        <View style={tw.style('mb-6')}>
          <Text
            style={tw.style(h5TextStyle, 'mb-2 text-center text-darkgray')}
          >
            {challenge.challengeName}
          </Text>
          <Text
            style={tw.style(bodySmallRegular, 'text-center text-midgray')}
          >
            {challenge.description}
          </Text>
        </View>

        {/* Challenge Details */}
        <View
          style={tw.style(
            'mb-6 rounded-lg border border-strokecream bg-white p-4',
            cardDrop,
          )}
        >
          <View style={tw.style('mb-3 flex-row items-center justify-between')}>
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
              Goal
            </Text>
            <Text style={tw.style(bodyLargeBold, 'text-darkgray')}>
              {challenge.challengeGoal} meals
            </Text>
          </View>

          <View style={tw.style('mb-3 flex-row items-center justify-between')}>
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
              Participants
            </Text>
            <Text style={tw.style(bodyLargeBold, 'text-darkgray')}>
              {challenge.memberCount}
            </Text>
          </View>

          <View style={tw.style('mb-3 flex-row items-center justify-between')}>
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
              Food Saved
            </Text>
            <Text style={tw.style(bodyLargeBold, 'text-darkgray')}>
              {challenge.totalFoodSaved || 0}g
            </Text>
          </View>

          <View style={tw.style('mb-3 flex-row items-center justify-between')}>
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
              Start Date
            </Text>
            <Text style={tw.style(bodySmallRegular, 'text-darkgray')}>
              {startDate.toLocaleDateString()}
            </Text>
          </View>

          <View style={tw.style('flex-row items-center justify-between')}>
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
              End Date
            </Text>
            <Text style={tw.style(bodySmallRegular, 'text-darkgray')}>
              {endDate.toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={tw.style('mb-6 items-center')}>
          <View
            style={tw.style(
              'rounded-full px-4 py-2',
              isActive ? 'bg-green-100' : 'bg-gray-100',
            )}
          >
            <Text
              style={tw.style(
                bodySmallRegular,
                isActive ? 'text-green-700' : 'text-gray-700',
              )}
            >
              {isActive ? '● Active' : '● Inactive'}
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        <View
          style={tw.style(
            'mb-6 rounded-lg border border-strokecream bg-white p-4',
            cardDrop,
          )}
        >
          <Text style={tw.style(h6TextStyle, 'mb-3 text-darkgray')}>
            Progress
          </Text>
          <View style={tw.style('h-4 overflow-hidden rounded-full bg-gray-200')}>
            <View
              style={tw.style(
                'h-full bg-eggplant',
                `w-[${Math.min(
                  ((challenge.totalFoodSaved || 0) / challenge.challengeGoal) *
                    100,
                  100,
                )}%]`,
              )}
            />
          </View>
          <Text
            style={tw.style(
              bodySmallRegular,
              'mt-2 text-center text-midgray',
            )}
          >
            {((challenge.totalFoodSaved || 0) / challenge.challengeGoal * 100).toFixed(1)}% Complete
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={tw.style('gap-2')}>
          {isActive && (
            <>
              <PrimaryButton
                onPress={handleJoinChallenge}
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Challenge'}
              </PrimaryButton>
              <OutlineButton
                onPress={handleLeaveChallenge}
                disabled={isLeaving}
              >
                {isLeaving ? 'Leaving...' : 'Leave Challenge'}
              </OutlineButton>
            </>
          )}
          <OutlineButton onPress={() => navigation.goBack()}>
            Back to Group
          </OutlineButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
