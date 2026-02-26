import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../common/tailwind';
import * as WebBrowser from 'expo-web-browser';
import { useGetQantasDashboardQuery, useGetFFNQuery, useUnlinkFFNMutation } from '../../qantas/api/api';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Progress from 'react-native-progress';
import LottieView from 'lottie-react-native';
import { Svg, Circle } from 'react-native-svg';
import {
  bodyLargeRegular,
  bodyMediumRegular,
  bodySmallBold,
  bodySmallRegular,
  h5TextStyle,
  h6TextStyle,
  h7TextStyle,
  subheadLargeUppercase,
} from '../../../theme/typography';
import { cardDrop } from '../../../theme/shadow';

const screenWidth = Dimensions.get('window').width;

function SurveyProgressRing({
  progress,
  surveysInCycle,
  surveysRequired,
}: {
  progress: number;
  surveysInCycle: number;
  surveysRequired: number;
}) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={tw`items-center justify-center`}>
      <View style={tw`h-[${size}px] w-[${size}px] items-center justify-center`}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            stroke={tw.color('strokecream')}
            strokeWidth={strokeWidth}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
          />
          <AnimatedCircle
            stroke={tw.color('kale')}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          />
        </Svg>
        <View style={tw`absolute items-center justify-center`}>
          <Text style={tw.style(h5TextStyle, 'text-kale')}>
            {surveysInCycle}/{surveysRequired}
          </Text>
          <Text style={tw.style(bodySmallRegular, 'text-midgray')}>surveys</Text>
        </View>
      </View>
    </View>
  );
}

export default function QantasDashboardScreen() {
  const navigation = useNavigation();
  const { data: ffnData, isLoading: isFFNLoading } = useGetFFNQuery();
  const { data: dashboard, isLoading: isDashboardLoading, refetch } = useGetQantasDashboardQuery(
    undefined,
    { skip: !ffnData },
  );

  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<LottieView>(null);
  const prevIsRewarded = useRef<boolean | null>(null);

  const [unlinkFFN, { isLoading: isUnlinking }] = useUnlinkFFNMutation();

  const isLoading = isFFNLoading || isDashboardLoading;

  const surveysInCycle = dashboard?.surveysInCycle ?? 0;
  const surveysRequired = dashboard?.surveysRequired ?? 4;
  const progress = dashboard?.progress ?? 0;
  const greenTierUnlocked = dashboard?.greenTierUnlocked ?? false;
  const totalPoints = dashboard?.totalPointsAwarded ?? 0;
  const pointsHistory = dashboard?.pointsHistory ?? [];
  const isRewarded = dashboard?.isRewarded ?? false;
  const pendingAllocation = dashboard?.pendingAllocation ?? false;
  const maskedFFN = ffnData ? `****${ffnData.memberId.slice(-4)}` : '—';

  useEffect(() => {
    if (prevIsRewarded.current === false && isRewarded === true) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
    prevIsRewarded.current = isRewarded;
  }, [isRewarded]);

  if (isLoading) {
    return (
      <View style={tw`flex-1 bg-creme items-center justify-center`}>
        <ActivityIndicator size="large" color={tw.color('eggplant')} />
        <FocusAwareStatusBar statusBarStyle="dark" />
      </View>
    );
  }

  if (!ffnData) {
    return (
      <View style={tw`flex-1 bg-creme`}>
        <SafeAreaView style={tw`flex-1 items-center justify-center px-5`}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={tw`absolute left-4 top-4`}
          >
            <Feather name="arrow-left" size={24} color={tw.color('black')} />
          </Pressable>
          <Image
            resizeMode="contain"
            source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/qantas/frequent-flyer.png' }}
            accessibilityIgnoresInvertColors
            style={tw`mb-6 h-[80px] w-[200px]`}
          />
          <Text style={tw.style(bodyMediumRegular, 'text-center text-midgray mb-6')}>
            You haven't linked a Qantas Frequent Flyer account yet.
          </Text>
          <PrimaryButton
            onPress={() => {
              (navigation as any).navigate('SettingsAccountsQantasLink');
            }}
          >
            Link your account
          </PrimaryButton>
        </SafeAreaView>
        <FocusAwareStatusBar statusBarStyle="dark" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-creme`}>
      {/* Confetti overlay */}
      {showConfetti && (
        <View style={tw`absolute inset-0 z-50`} pointerEvents="none">
          <LottieView
            ref={confettiRef}
            source={require('../../../../assets/groups/confetti.json')}
            autoPlay
            loop={false}
            style={tw`absolute inset-0`}
            resizeMode="cover"
          />
        </View>
      )}

      <SafeAreaView style={tw`flex-1`}>
        {/* Header */}
        <View style={tw`flex-row items-center justify-between px-4 py-3`}>
          <Pressable onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={tw.color('black')} />
          </Pressable>
          <Text style={tw.style(h7TextStyle, 'text-center')}>
            Qantas Dashboard
          </Text>
          <Pressable onPress={() => refetch()}>
            <Feather name="refresh-cw" size={20} color={tw.color('midgray')} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={tw`px-5 pb-10`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`items-center mt-2 mb-4`}>
            <Image
              resizeMode="contain"
              source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/qantas/frequent-flyer.png' }}
              accessibilityIgnoresInvertColors
              style={tw`h-[60px] w-[160px]`}
            />
            <Text style={tw.style(bodySmallRegular, 'mt-1 text-midgray')}>
              FFN: {maskedFFN}
            </Text>
          </View>

          {greenTierUnlocked && (
            <View style={tw`mb-4 items-center rounded-2xl bg-kale/10 py-4`}>
              <Image
                resizeMode="contain"
                source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/qantas/green-tier.png' }}
                accessibilityIgnoresInvertColors
                style={tw`h-[48px] w-[48px] mb-2`}
              />
              <Text style={tw.style(h7TextStyle, 'text-kale')}>
                Green Tier Achieved!
              </Text>
              <Text style={tw.style(bodySmallRegular, 'text-midgray mt-1 text-center px-6')}>
                You've unlocked extra benefits when you fly next with Qantas.
              </Text>
            </View>
          )}

          <View
            style={[
              tw`mb-4 rounded-2xl bg-white p-6`,
              cardDrop,
            ]}
          >
            <Text
              style={[
                tw.style(subheadLargeUppercase, 'text-center text-midgray mb-4'),
                { letterSpacing: 2 },
              ]}
            >
              Survey Progress
            </Text>

            <SurveyProgressRing
              progress={progress}
              surveysInCycle={surveysInCycle}
              surveysRequired={surveysRequired}
            />

            <View style={tw`mt-4 w-full`}>
              <Progress.Bar
                progress={progress > 0 ? progress : 0.05}
                color={tw.color('kale')}
                unfilledColor={tw.color('strokecream')}
                animated
                borderWidth={0}
                height={8}
                borderRadius={9999}
                width={null}
              />
              <Image
                resizeMode="contain"
                source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/qantas/green-tier.png' }}
                accessibilityIgnoresInvertColors
                style={tw`absolute -bottom-3 -right-1 h-[28px] w-[28px]`}
              />
            </View>

            <View style={tw`mt-5 h-px bg-strokecream`} />

            <Text
              style={tw.style(bodySmallRegular, 'mt-3 text-center')}
              maxFontSizeMultiplier={1}
            >
              {isRewarded
                ? "You've already earned your Qantas Points for this membership year. Keep surveying to maintain your streak!"
                : pendingAllocation
                ? 'Your Qantas Points are being processed — check back soon!'
                : `Complete ${surveysRequired - surveysInCycle} more survey${
                    surveysRequired - surveysInCycle !== 1 ? 's' : ''
                  } to earn ${dashboard?.pointsPerCycle ?? 100} Qantas Points and unlock Green Tier.`}
            </Text>
          </View>

          <View
            style={[
              tw`mb-4 rounded-2xl bg-white p-6`,
              cardDrop,
            ]}
          >
            <Text
              style={[
                tw.style(subheadLargeUppercase, 'text-center text-midgray mb-4'),
                { letterSpacing: 2 },
              ]}
            >
              Points Earned
            </Text>

            <View style={tw`flex-row items-center justify-center`}>
              <Text style={tw.style(h5TextStyle, 'text-qantas')}>
                {totalPoints}
              </Text>
              <Text style={tw.style(bodyMediumRegular, 'ml-2 text-midgray')}>
                Qantas Points
              </Text>
            </View>

            {pointsHistory.length > 0 && (
              <>
                <View style={tw`mt-4 h-px bg-strokecream`} />
                <Text
                  style={[
                    tw.style(subheadLargeUppercase, 'mt-4 mb-2 text-midgray'),
                    { letterSpacing: 1.5 },
                  ]}
                >
                  History
                </Text>
                {pointsHistory.map((entry, index) => (
                  <View
                    key={`${entry.awardedAt}-${index}`}
                    style={tw`flex-row items-center justify-between py-2 ${
                      index < pointsHistory.length - 1 ? 'border-b border-strokecream' : ''
                    }`}
                  >
                    <View style={tw`flex-1`}>
                      <Text style={tw.style(bodySmallRegular)}>
                        {entry.reason}
                      </Text>
                      <Text style={tw.style(bodySmallRegular, 'text-midgray text-xs')}>
                        {new Date(entry.awardedAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <Text style={tw.style(bodySmallBold, 'text-kale')}>
                      +{entry.points} pts
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* Links */}
          <View style={tw`mt-2 flex-row justify-evenly`}>
            <Pressable
              onPress={() => {
                WebBrowser.openBrowserAsync(
                  'https://www.qantas.com/au/en/frequent-flyer/status-and-clubs/green-tier.html',
                );
              }}
            >
              <Text style={tw.style(bodySmallRegular, 'text-midgray underline')}>
                What is Green Tier?
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                WebBrowser.openBrowserAsync('https://www.saveful.com/qantasterms');
              }}
            >
              <Text style={tw.style(bodySmallRegular, 'text-midgray underline')}>
                Terms & conditions
              </Text>
            </Pressable>
          </View>

          {/* Take Survey CTA */}
          <View style={tw`mt-6`}>
            <PrimaryButton
              buttonSize="large"
              onPress={() => {
                (navigation as any).navigate('Survey', {
                  screen: 'SurveyWeekly',
                });
              }}
            >
              Take this week's survey
            </PrimaryButton>
          </View>

          {/* Unlink */}
          <SecondaryButton
            style={tw`mt-3`}
            loading={isUnlinking}
            onPress={async () => {
              try {
                await unlinkFFN().unwrap();
                navigation.goBack();
              } catch {
              }
            }}
          >
            Unlink Frequent Flyer Account
          </SecondaryButton>
        </ScrollView>
      </SafeAreaView>

      <FocusAwareStatusBar statusBarStyle="dark" />
    </View>
  );
}
