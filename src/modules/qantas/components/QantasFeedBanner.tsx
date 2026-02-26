import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import tw from '../../../common/tailwind';
import { mixpanelEventName } from '../../analytics/analytics';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import { useGetFFNQuery, useGetQantasDashboardQuery } from '../../qantas/api/api';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import {
  bodyMediumRegular,
  bodySmallBold,
  bodySmallRegular,
  h7TextStyle,
} from '../../../theme/typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FeedStackParamList } from '../../feed/navigation/FeedNavigation';

export default function QantasFeedBanner() {
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const { data: qantasFFN } = useGetFFNQuery();
  const { data: dashboard } = useGetQantasDashboardQuery(undefined, {
    skip: !qantasFFN,
  });

  const isLinked = !!qantasFFN;

  const onLinkPressed = React.useCallback(() => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: 'qantas_banner_link_pressed',
      },
    });
    // Navigate to Track > SettingsAccountsQantasLink
    (navigation as any).navigate('Track', {
      screen: 'SettingsAccountsQantasLink',
      params: {},
    });
  }, [navigation, newCurrentRoute, sendAnalyticsEvent]);

  const onDashboardPressed = React.useCallback(() => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: 'qantas_banner_dashboard_pressed',
      },
    });
    (navigation as any).navigate('Track', {
      screen: 'QantasDashboard',
      params: {},
    });
  }, [navigation, newCurrentRoute, sendAnalyticsEvent]);

  // ── Not linked: show "Link your account" CTA ──
  if (!isLinked) {
    return (
      <View style={tw`mx-5 mb-5 overflow-hidden rounded-xl border border-qantas`}>
        {/* Red header */}
        <View style={tw`bg-qantas px-5 py-3`}>
          <Text
            style={[
              tw.style(bodySmallBold, 'text-center uppercase text-white'),
              { letterSpacing: 1.5 },
            ]}
          >
            Link your Qantas{'\n'}Frequent Flyer account
          </Text>
        </View>

        {/* White body */}
        <View style={tw`items-center bg-white px-6 py-5`}>
          <Image
            resizeMode="contain"
            source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/qantas/frequent-flyer.png' }}
            accessibilityIgnoresInvertColors
            style={tw`mb-3 h-[60px] w-[160px]`}
          />
          <Text
            style={tw.style(
              bodyMediumRegular,
              'mb-4 text-center text-midgray',
            )}
          >
            Link your Qantas Frequent Flyer account and complete four weekly
            surveys to earn 100 Qantas Points and get closer to achieving Green
            Tier.
          </Text>
          <Pressable
            onPress={onLinkPressed}
            style={tw`flex-row items-center justify-center pt-1`}
          >
            <Text
              style={[
                tw.style(bodySmallBold, 'pr-1 uppercase underline'),
                { letterSpacing: 1.5 },
              ]}
            >
              Link your account
            </Text>
            <Feather name="arrow-right" size={16} color={tw.color('black')} />
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Linked: show progress / dashboard preview ──
  const surveysInCycle = dashboard?.surveysInCycle ?? 0;
  const surveysRequired = dashboard?.surveysRequired ?? 4;
  const progress = dashboard?.progress ?? 0;
  const greenTierUnlocked = dashboard?.greenTierUnlocked ?? false;
  const isRewarded = dashboard?.isRewarded ?? false;
  const pendingAllocation = dashboard?.pendingAllocation ?? false;

  return (
    <Pressable
      onPress={onDashboardPressed}
      style={tw`mx-5 mb-5 overflow-hidden rounded-xl border border-qantas`}
    >
      {/* Red header */}
      <View style={tw`bg-qantas px-5 py-3`}>
        <Text
          style={[
            tw.style(bodySmallBold, 'text-center uppercase text-white'),
            { letterSpacing: 1.5 },
          ]}
        >
          {greenTierUnlocked
            ? 'Green Tier Unlocked!'
            : 'Your Qantas Progress'}
        </Text>
      </View>

      {/* White body */}
      <View style={tw`items-center bg-white px-6 py-5`}>
        <Image
          resizeMode="contain"
          source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/qantas/frequent-flyer.png' }}
          accessibilityIgnoresInvertColors
          style={tw`mb-3 h-[50px] w-[140px]`}
        />

        {/* Progress bar */}
        <View style={tw`w-full py-2`}>
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

        <View style={tw`mt-3 h-px w-full bg-strokecream`} />

        <Text
          style={tw.style(bodySmallRegular, 'mt-3 text-center')}
          maxFontSizeMultiplier={1}
        >
          {isRewarded
            ? `Congratulations! You've earned ${dashboard?.totalPointsAwarded ?? 100} Qantas Points!`
            : pendingAllocation
            ? 'Your Qantas Points are being processed!'
            : `${surveysRequired - surveysInCycle} survey${surveysRequired - surveysInCycle !== 1 ? 's' : ''} to go — earn 100 Qantas Points!`}
        </Text>

        <Pressable
          onPress={onDashboardPressed}
          style={tw`mt-3 flex-row items-center justify-center`}
        >
          <Text
            style={[
              tw.style(bodySmallBold, 'pr-1 uppercase underline'),
              { letterSpacing: 1.5 },
            ]}
          >
            View dashboard
          </Text>
          <Feather name="arrow-right" size={16} color={tw.color('black')} />
        </Pressable>
      </View>
    </Pressable>
  );
}
