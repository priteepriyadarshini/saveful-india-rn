import { Entypo } from '@expo/vector-icons';
import { skipToken } from '@reduxjs/toolkit/query';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import tw from '../../../common/tailwind';
import { IChallenge } from '../../../models/craft';
import { useGetUserChallengeQuery } from '../../../modules/challenges/api/api';
import useEnvironment from '../../../modules/environment/hooks/useEnvironment';
import { CircularProgress } from '../../../modules/feed/components/CircularProgress';
import { useGetStatsQuery } from '../../../modules/track/api/api';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import {
  h6TextStyle,
  subheadLargeUppercase,
  subheadSmallUppercase,
} from '../../../theme/typography';

export default function FeedSaved({
  challenge,
  isChallengeSeason,
  toggleChallengeModal,
  toggleChallengeStatusOpened,
}: {
  challenge?: IChallenge;
  isChallengeSeason?: boolean;
  toggleChallengeModal?: () => void;
  toggleChallengeStatusOpened?: () => void;
}) {
  const env = useEnvironment();
  const { data: stats, isLoading: isGetStatsLoading } = useGetStatsQuery();

  const { data: userChallenge } = useGetUserChallengeQuery(
    challenge?.slug ? { slug: challenge.slug } : skipToken,
  );

  const currentUserChallenge =
    userChallenge?.data?.challengeStatus === 'joined' ? userChallenge : null;

  const currentBonusAchievement =
    challenge?.bonusAchievements.find(item => {
      return (
        currentUserChallenge &&
        item.foodSavedTarget >= currentUserChallenge?.data.foodSaved
      );
    }) ?? challenge?.bonusAchievements[0];

  if (!stats || isGetStatsLoading) return null;

  return (
    <View style={tw`relative`}>
      <View
        style={[
          tw.style(
            `mx-5 overflow-hidden rounded-2lg border border-radish bg-black shadow-sm`,
          ),
          cardDrop,
        ]}
      >
        <View style={tw`border-b border-radish py-3`}>
          <Text
            style={tw.style(subheadLargeUppercase, 'text-center text-creme')}
          >
            Stats and potential savings
          </Text>
        </View>

        <View style={tw`flex-row items-center justify-between gap-3 px-2 py-3`}>
          {/* <View style={tw`grow items-center gap-1`}>
          <Text
            style={tw.style(
              subheadSmallUppercase,
              'mx-auto text-center text-white',
            )}
            maxFontSizeMultiplier={1}
          >
            You’ve cooked
          </Text>
          <Text
            style={tw.style(h6TextStyle, 'text-radish')}
            maxFontSizeMultiplier={1}
          >
            {stats.completed_meals_count}
          </Text>
          <Text
            style={tw.style(subheadSmallUppercase, 'text-center text-white')}
            maxFontSizeMultiplier={1}
          >
            Meals
          </Text>
        </View>
        <View style={tw`h-full w-[1px] bg-radish`} /> */}
          {challenge && currentUserChallenge && (
            <>
              <Pressable
                style={tw`items-center gap-2`}
                onPress={toggleChallengeStatusOpened}
              >
                <CircularProgress
                  progress={
                    (currentUserChallenge.data.noOfCooks * 100) /
                    challenge.numberOfCooks
                  }
                >
                  {challenge.challengeBadge &&
                    challenge.challengeBadge[0].url && (
                      <Image
                        source={bundledSource(
                          challenge.challengeBadge[0].url,
                          env.useBundledContent,
                        )}
                        resizeMode="cover"
                        style={tw`max-h-full max-w-full`}
                      />
                    )}
                </CircularProgress>
                <Text
                  style={tw.style(
                    subheadSmallUppercase,
                    'text-center text-white',
                  )}
                  maxFontSizeMultiplier={1}
                >
                  {challenge.title}
                </Text>
              </Pressable>
              <View style={tw`h-full w-[1px] bg-radish`} />
            </>
          )}
          {!!stats.food_savings_user && !currentUserChallenge && (
            <>
              <View style={tw`grow items-center gap-1`}>
                <Text
                  style={tw.style(
                    subheadSmallUppercase,
                    'mx-auto text-center text-white',
                  )}
                  maxFontSizeMultiplier={1}
                >
                  You’ve saved
                </Text>
                <Text
                  style={tw.style(h6TextStyle, 'text-radish')}
                  maxFontSizeMultiplier={1}
                >
                  {Number(stats.food_savings_user).toFixed(2)}
                </Text>
                <Text
                  style={tw.style(
                    subheadSmallUppercase,
                    'text-center text-white',
                  )}
                  maxFontSizeMultiplier={1}
                >
                  Kg of food
                </Text>
              </View>
              <View style={tw`h-full w-[1px] bg-radish`} />
            </>
          )}
          <View style={tw`grow items-center gap-1 overflow-hidden`}>
            {currentUserChallenge && (
              <Image
                style={tw.style('mx-auto h-[31px] w-[60px]')}
                resizeMode="contain"
                source={require('../../../../assets/intro/logo-white.png')}
              />
            )}
            <Text
              style={tw.style(
                subheadSmallUppercase,
                'mx-auto text-center text-white',
              )}
              maxFontSizeMultiplier={1}
            >
              {`${currentUserChallenge ? '' : `Saveful `}has saved`}
            </Text>
            <Text
              style={tw.style(h6TextStyle, 'text-mint')}
              maxFontSizeMultiplier={1}
            >
              {Number(stats.food_savings_all_users).toFixed(2)}
            </Text>
            <Text
              style={tw.style(subheadSmallUppercase, 'text-center text-white')}
              maxFontSizeMultiplier={1}
            >
              Kg of food
            </Text>
          </View>
          {challenge &&
            currentUserChallenge &&
            currentBonusAchievement &&
            currentBonusAchievement.achievementEarnedBadge &&
            currentBonusAchievement.achievementEarnedBadge[0].url && (
              <>
                <View style={tw`h-full w-[1px] bg-radish`} />
                <Pressable
                  style={tw`items-center gap-2`}
                  onPress={toggleChallengeStatusOpened}
                >
                  <CircularProgress
                    progress={
                      (currentUserChallenge.data.foodSaved * 100) /
                      currentBonusAchievement.foodSavedTarget
                    }
                  >
                    <Image
                      source={bundledSource(
                        currentBonusAchievement.achievementEarnedBadge[0].url,
                        env.useBundledContent,
                      )}
                      resizeMode="cover"
                      style={tw`max-h-full max-w-full`}
                    />
                  </CircularProgress>
                  <Text
                    style={tw.style(
                      subheadSmallUppercase,
                      'text-center text-white',
                    )}
                    maxFontSizeMultiplier={1}
                  >
                    {currentBonusAchievement.achievementTitle}
                  </Text>
                </Pressable>
              </>
            )}
        </View>

        {isChallengeSeason && !currentUserChallenge && (
          <Pressable
            style={tw`flex-row items-center justify-center gap-2 bg-radish py-2`}
            onPress={() => {
              if (toggleChallengeModal) {
                toggleChallengeModal();
              }
            }}
          >
            <Entypo name="medal" size={12} color={tw.color('eggplant')} />
            <Text
              style={tw.style(
                subheadSmallUppercase,
                'text-center text-eggplant',
              )}
              maxFontSizeMultiplier={1}
            >
              It’s challenge season
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

