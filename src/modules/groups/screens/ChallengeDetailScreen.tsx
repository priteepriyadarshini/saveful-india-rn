import React, { useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import OutlineButton from '../../../common/components/ThemeButtons/OutlineButton';
import DebouncedPressable from '../../../common/components/DebouncePressable';
import {
  useGetGroupChallengeQuery,
  useJoinGroupChallengeMutation,
  useLeaveGroupChallengeMutation,
} from '../../../modules/groups/api/api';
import { bodyLargeBold, bodySmallRegular, h5TextStyle, h6TextStyle } from '../../../theme/typography';
import { cardDrop } from '../../../theme/shadow';
import { useGetCookedRecipesQuery } from '../../analytics/api/api';
import { GroupChallengeParticipant } from '../api/types';

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
  const { data: cookedSummary } = useGetCookedRecipesQuery();

  // Prepare participants list BEFORE any early returns (hooks must be unconditional)
  const participants: GroupChallengeParticipant[] = useMemo(() => {
    if (!challenge) return [];
    const anyChallenge: any = challenge as any;
    return Array.isArray(anyChallenge?.participants)
      ? (anyChallenge.participants as GroupChallengeParticipant[])
      : [];
  }, [challenge]);

  const leaderboardByGrams = useMemo(() => {
    return [...participants]
      .filter(p => p.isActive)
      .sort((a, b) => (b.totalFoodSaved || 0) - (a.totalFoodSaved || 0))
      .slice(0, 5);
  }, [participants]);

  const leaderboardByMeals = useMemo(() => {
    return [...participants]
      .filter(p => p.isActive)
      .sort((a, b) => (b.totalMealsCompleted || 0) - (a.totalMealsCompleted || 0))
      .slice(0, 5);
  }, [participants]);

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
  const now = new Date();
  const isActive = challenge.isActive || (challenge.status && startDate <= now && endDate >= now);
  const isParticipant = challenge.isParticipant || false;
  const progressPercentage = Math.min(
    ((challenge.totalMealsCompleted || 0) / challenge.challengeGoal) * 100,
    100,
  );

  const getParticipantName = (p: GroupChallengeParticipant) => {
    const u: any = p.userId as any;
    if (typeof u === 'object') {
      return u?.name || u?._id || 'Member';
    }
    return u;
  };

  const challengeCompleted = (challenge.totalMealsCompleted || 0) >= challenge.challengeGoal;
  const currentLeader = leaderboardByMeals[0] || leaderboardByGrams[0];

  return (
    <SafeAreaView style={tw.style('flex-1 bg-creme')}>
      {/* Header */}
      <View style={tw.style('mb-4 flex-row items-center justify-between px-5 pt-2')}>
        <DebouncedPressable 
          onPress={() => navigation.goBack()} 
          style={tw.style('h-10 w-10 items-center justify-center')}
        >
          <Feather name="arrow-left" size={24} color="#1F1F1F" />
        </DebouncedPressable>
        <Text style={tw.style(h6TextStyle, 'text-darkgray')}>Challenge Details</Text>
        <View style={tw.style('w-10')} />
      </View>

      <ScrollView
        contentContainerStyle={tw.style('px-5 pb-10')}
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
            'mb-6 rounded-2xl border border-strokecream bg-white p-5',
            cardDrop,
          )}
        >
          <Text style={tw.style(h6TextStyle, 'mb-3 text-darkgray')}>
            About This Challenge
          </Text>
          
          <View style={tw.style('gap-3')}>
            <View style={tw.style('flex-row items-start')}>
              <Feather name="calendar" size={18} color={tw.color('midgray')} style={tw.style('mt-0.5')} />
              <View style={tw.style('ml-3 flex-1')}>
                <Text style={tw.style(bodySmallRegular, 'text-midgray')}>Duration</Text>
                <Text style={tw.style(bodySmallRegular, 'mt-0.5 text-darkgray')}>
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={tw.style('flex-row items-start')}>
              <Feather name="info" size={18} color={tw.color('midgray')} style={tw.style('mt-0.5')} />
              <View style={tw.style('ml-3 flex-1')}>
                <Text style={tw.style(bodySmallRegular, 'text-midgray')}>Description</Text>
                <Text style={tw.style(bodySmallRegular, 'mt-0.5 text-darkgray')}>
                  {challenge.description}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Motivational Message */}
        {challenge.memberCount === 1 && (
          <View style={tw.style('mb-6 rounded-2xl bg-eggplant-light p-4')}>
            <Text style={tw.style(bodySmallRegular, 'text-center text-darkgray')}>
              🎯 You're the first member! Invite others to join and make a bigger impact together.
            </Text>
          </View>
        )}

        {/* Status Badge */}
        <View style={tw.style('mb-4 items-center')}>
          <View
            style={tw.style(
              'rounded-full px-6 py-2',
              isActive ? 'bg-green-100' : 'bg-gray-200',
            )}
          >
            <Text
              style={tw.style(
                bodySmallRegular,
                'font-saveful-bold',
                isActive ? 'text-green-700' : 'text-gray-600',
              )}
            >
              {isActive ? '● Active' : '● Inactive'}
            </Text>
          </View>
          {!isActive && startDate > now && (
            <Text style={tw.style(bodySmallRegular, 'mt-2 text-center text-midgray')}>
              Starts {startDate.toLocaleDateString()}
            </Text>
          )}
          {!isActive && endDate < now && (
            <Text style={tw.style(bodySmallRegular, 'mt-2 text-center text-midgray')}>
              Ended {endDate.toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Progress Section */}
        <View
          style={tw.style(
            'mb-6 rounded-2xl border border-strokecream bg-white p-5',
            cardDrop,
          )}
        >
          <Text style={tw.style(h6TextStyle, 'mb-4 text-darkgray')}>
            Challenge Progress
          </Text>
          
          {/* Progress Bar */}
          <View style={tw.style('mb-3')}>
            <View style={tw.style('mb-2 h-6 overflow-hidden rounded-full bg-gray-200')}>
              <View
                style={[
                  tw.style('h-full bg-eggplant'),
                  { width: `${progressPercentage}%` }
                ]}
              />
            </View>
            <Text
              style={tw.style(
                bodySmallRegular,
                'text-center text-darkgray',
                'font-saveful-bold',
              )}
            >
              {progressPercentage.toFixed(1)}% Complete
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={tw.style('mt-4 flex-row justify-between')}>
            <View style={tw.style('flex-1 items-center')}>
              <Text style={tw.style(bodySmallRegular, 'text-midgray')}>Food Saved</Text>
              <Text style={tw.style(bodyLargeBold, 'mt-1 text-darkgray')}>
                {challenge.totalFoodSaved || 0}g
              </Text>
            </View>
            <View style={tw.style('w-px bg-strokecream')} />
            <View style={tw.style('flex-1 items-center')}>
              <Text style={tw.style(bodySmallRegular, 'text-midgray')}>Meals Goal</Text>
              <Text style={tw.style(bodyLargeBold, 'mt-1 text-darkgray')}>
                {challenge.challengeGoal}
              </Text>
            </View>
            <View style={tw.style('w-px bg-strokecream')} />
            <View style={tw.style('flex-1 items-center')}>
              <Text style={tw.style(bodySmallRegular, 'text-midgray')}>Members</Text>
              <Text style={tw.style(bodyLargeBold, 'mt-1 text-darkgray')}>
                {challenge.memberCount}
              </Text>
            </View>
          </View>
          {/* Meals Completed Metrics */}
          <View style={tw.style('mt-5 flex-row justify-between')}>
            <View style={tw.style('flex-1 items-center')}>
              <Text style={tw.style(bodySmallRegular, 'text-midgray')}>Meals Completed</Text>
              <Text style={tw.style(bodyLargeBold, 'mt-1 text-darkgray')}>
                {challenge.totalMealsCompleted || 0}
              </Text>
            </View>
            <View style={tw.style('w-px bg-strokecream')} />
            <View style={tw.style('flex-1 items-center')}>
              <Text style={tw.style(bodySmallRegular, 'text-midgray')}>Your meals cooked</Text>
              <Text style={tw.style(bodyLargeBold, 'mt-1 text-darkgray')}>
                {cookedSummary?.numberOfMealsCooked ?? 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Competition / Leaderboard */}
        <View
          style={tw.style(
            'mb-6 rounded-2xl border border-strokecream bg-white p-5',
            cardDrop,
          )}
        >
          <Text style={tw.style(h6TextStyle, 'mb-4 text-darkgray')}>
            Leaderboard
          </Text>

          {participants.length === 0 ? (
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
              Leaderboard will appear as members start cooking. Join and contribute!
            </Text>
          ) : (
            <>
              {/* Current leader and status */}
              {currentLeader && (
                <View style={tw.style('mb-4 rounded-xl bg-eggplant-light p-3')}>
                  <Text style={tw.style(bodySmallRegular, 'text-darkgray')}>
                    {challengeCompleted ? 'Winner (by meals cooked):' : 'Current leader (meals):'}
                  </Text>
                  <Text style={tw.style(bodyLargeBold, 'mt-1 text-darkgray')}>
                    {getParticipantName(currentLeader)}
                  </Text>
                  <Text style={tw.style(bodySmallRegular, 'mt-1 text-midgray')}>
                    {(currentLeader.totalMealsCompleted || 0)} meals · {(currentLeader.totalFoodSaved || 0)}g saved
                  </Text>
                </View>
              )}

              {/* Top by grams */}
              <Text style={tw.style(bodySmallRegular, 'mb-2 text-darkgray')}>Top by grams</Text>
              <View style={tw.style('mb-4 gap-2')}>
                {leaderboardByGrams.map((p, idx) => (
                  <View key={`${p._id}-g`} style={tw.style('flex-row items-center justify-between rounded-xl border border-strokecream p-3')}>
                    <Text style={tw.style(bodySmallRegular, 'text-darkgray')}>#{idx + 1}</Text>
                    <View style={tw.style('flex-1 px-3')}>
                      <Text style={tw.style(bodySmallRegular, 'text-darkgray')}>{getParticipantName(p)}</Text>
                      <Text style={tw.style(bodySmallRegular, 'text-midgray')}>{(p.totalFoodSaved || 0)}g · {(p.totalMealsCompleted || 0)} meals</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Top by meals */}
              <Text style={tw.style(bodySmallRegular, 'mb-2 text-darkgray')}>Top by meals</Text>
              <View style={tw.style('gap-2')}>
                {leaderboardByMeals.map((p, idx) => (
                  <View key={`${p._id}-m`} style={tw.style('flex-row items-center justify-between rounded-xl border border-strokecream p-3')}>
                    <Text style={tw.style(bodySmallRegular, 'text-darkgray')}>#{idx + 1}</Text>
                    <View style={tw.style('flex-1 px-3')}>
                      <Text style={tw.style(bodySmallRegular, 'text-darkgray')}>{getParticipantName(p)}</Text>
                      <Text style={tw.style(bodySmallRegular, 'text-midgray')}>{(p.totalMealsCompleted || 0)} meals · {(p.totalFoodSaved || 0)}g</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={tw.style('gap-3')}>
          {isActive && !isParticipant && (
            <PrimaryButton
              onPress={handleJoinChallenge}
              disabled={isJoining}
              width="full"
              buttonSize="large"
              variant="solid-black"
            >
              {isJoining ? 'Joining...' : 'Join Challenge'}
            </PrimaryButton>
          )}
          {isActive && isParticipant && (
            <OutlineButton
              onPress={handleLeaveChallenge}
              disabled={isLeaving}
            >
              {isLeaving ? 'Leaving...' : 'Leave Challenge'}
            </OutlineButton>
          )}
          {!isActive && (
            <View style={tw.style('rounded-2xl border border-strokecream bg-white p-4')}>
              <Text style={tw.style(bodySmallRegular, 'text-center text-midgray')}>
                {startDate > now 
                  ? 'This challenge hasn\'t started yet' 
                  : 'This challenge has ended'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
