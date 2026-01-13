import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { useCheckMyMilestonesMutation, useGetMyBadgesQuery } from '../api/api';
import { UserBadge, Badge } from '../api/types';
import { bodyMediumRegular, h6TextStyle, bodySmallRegular, subheadSmallUppercase, bodySmallBold } from '../../../theme/typography';
import { cardDrop } from '../../../theme/shadow';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AllBadgesTab() {
  const { data: userBadges, isLoading, refetch, isFetching } = useGetMyBadgesQuery();
  const [checkMyMilestones] = useCheckMyMilestonesMutation();

  const lastCheckKey = useRef('badges:lastMilestoneCheck');
  // Run background milestone check at most once per 30 minutes on open
  const CHECK_TTL_MS = 30 * 60 * 1000;

  const maybeCheckMilestones = useCallback(async () => {
    try {
      const ts = await AsyncStorage.getItem(lastCheckKey.current);
      const last = ts ? parseInt(ts, 10) : 0;
      const now = Date.now();
      if (!last || now - last > CHECK_TTL_MS) {
        await checkMyMilestones().unwrap();
        await AsyncStorage.setItem(lastCheckKey.current, String(now));
        // Mutation invalidates tags; list will auto-refresh if mounted
      }
    } catch (_) {
      // Silent failure: do not block UI
    }
  }, [checkMyMilestones]);

  useEffect(() => {
    if (!isLoading) {
      // Fire and forget; keeps UI responsive
      void maybeCheckMilestones();
    }
  }, [isLoading, maybeCheckMilestones]);

  const renderBadgeItem = ({ item }: { item: UserBadge }) => {
    const badge = typeof item.badgeId === 'object' ? item.badgeId as Badge : null;
    
    if (!badge) return null;

    const categoryConfig: Record<string, { gradient: readonly [string, string]; icon: any; iconColor: string; accentColor: string; ribbonPattern: any }> = {
      MILESTONE: {
        gradient: ['#E8F5E9', '#FFFFFF'] as const,
        icon: 'trophy-outline',
        iconColor: tw.color('kale') || '#3A7E52',
        accentColor: tw.color('kale') || '#3A7E52',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/mint.png'),
      },
      CHALLENGE_WINNER: {
        gradient: ['#F3E5F5', '#FFFFFF'] as const,
        icon: 'medal-outline',
        iconColor: tw.color('eggplant-vibrant') || '#7E42FF',
        accentColor: tw.color('eggplant') || '#4B2176',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/eggplant-light.png'),
      },
      SPECIAL: {
        gradient: ['#FFF9C4', '#FFFFFF'] as const,
        icon: 'star',
        iconColor: tw.color('orange') || '#F99C46',
        accentColor: tw.color('orange') || '#F99C46',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/lemon.png'),
      },
    };

    const badgeCategory = badge.category as string;
    const config = categoryConfig[badgeCategory] || categoryConfig.MILESTONE;

    return (
      <View style={tw.style('mx-4 mb-4 overflow-hidden rounded-2xl bg-white border border-strokecream', cardDrop)}>
        <ImageBackground
          source={config.ribbonPattern}
          resizeMode="cover"
          style={tw`overflow-hidden`}
          imageStyle={{ opacity: 0.08 }}
        >
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={tw`p-5`}
          >
          <View style={tw`flex-row items-start`}>
            {/* Badge Image with Elegant Frame */}
            <View style={tw`mr-4 items-center`}>
              <View style={tw.style('relative', !item.isViewed && 'mb-1')}>
                {badge.imageUrl && badge.imageUrl.startsWith('http') ? (
                  <View style={tw`rounded-2xl border-2 border-white bg-white p-1 shadow-sm`}>
                    <Image
                      source={{ uri: badge.imageUrl }}
                      style={tw`h-20 w-20 rounded-xl`}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <View style={tw`h-20 w-20 items-center justify-center rounded-2xl border-2 border-white bg-white shadow-sm`}>
                    <Ionicons name={config.icon} size={40} color={config.iconColor} />
                  </View>
                )}
                {!item.isViewed && (
                  <View style={tw`absolute -right-1.5 -top-1.5 h-4 w-4 items-center justify-center rounded-full bg-chilli`}>
                    <View style={tw`h-2 w-2 rounded-full bg-white`} />
                  </View>
                )}
              </View>
            </View>

            {/* Badge Details */}
            <View style={tw`flex-1`}>
              <View style={tw`mb-2 flex-row items-start justify-between`}>
                <Text style={tw.style(h6TextStyle, 'flex-1 text-black')} numberOfLines={2}>
                  {badge.name}
                </Text>
              </View>
              
              <Text
                style={tw.style(bodySmallRegular, 'mb-3 text-stone')}
                numberOfLines={2}
              >
                {badge.description}
              </Text>

              {/* Stats Pills */}
              <View style={tw`mb-3 flex-row flex-wrap items-center gap-2`}>
                <View style={tw`flex-row items-center rounded-full bg-white/80 px-3 py-1.5 shadow-sm`}>
                  <Ionicons name="ribbon" size={12} color={config.iconColor} />
                  <Text style={tw.style(bodySmallRegular, 'ml-1.5 text-xs text-black')}>
                    {badge.category.replace(/_/g, ' ')}
                  </Text>
                </View>
                
                {item.achievedValue !== undefined && item.achievedValue > 0 && (
                  <View style={tw`flex-row items-center rounded-full bg-mint/30 px-3 py-1.5`}>
                    <Ionicons name="checkmark-circle" size={12} color={tw.color('kale')} />
                    <Text style={tw.style(bodySmallBold, 'ml-1.5 text-xs text-kale')}>
                      {item.achievedValue}
                    </Text>
                  </View>
                )}
                
                {badge.rarityScore > 0 && (
                  <View style={tw`flex-row items-center rounded-full bg-lemon/30 px-3 py-1.5`}>
                    <Ionicons name="diamond" size={10} color={tw.color('orange')} />
                    <Text style={tw.style(bodySmallBold, 'ml-1.5 text-xs text-orange')}>
                      {badge.rarityScore}
                    </Text>
                  </View>
                )}
              </View>

              {/* Earned Date */}
              <View style={tw`flex-row items-center`}>
                <Ionicons name="time-outline" size={14} color={tw.color('stone')} />
                <Text style={tw.style(subheadSmallUppercase, 'ml-1.5 text-stone')}>
                  {moment(item.earnedAt).format('MMM DD, YYYY')}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        </ImageBackground>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={tw`flex-1 items-center justify-center px-8 py-20`}>
      <View style={tw`mb-6 h-24 w-24 items-center justify-center rounded-full bg-creme-2`}>
        <Ionicons name="ribbon-outline" size={48} color={tw.color('stone')} />
      </View>
      <Text style={tw.style(h6TextStyle, 'mb-3 text-center text-black')}>
        No Badges Yet
      </Text>
      <Text style={tw.style(bodyMediumRegular, 'text-center text-stone leading-relaxed')}>
        Complete challenges and reach milestones{`\n`}to earn your first badge!
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-creme`}>
        <ActivityIndicator size="large" color={tw.color('eggplant')} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={tw`flex-1 bg-creme`}>
      <FlatList
        data={userBadges || []}
        renderItem={renderBadgeItem}
        keyExtractor={item => item._id}
        contentContainerStyle={tw`py-4`}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={async () => {
              // On user-initiated refresh, force a check then refetch
              try {
                await checkMyMilestones().unwrap();
              } catch (_) {
                // ignore
              }
              refetch();
            }}
            tintColor={tw.color('eggplant')}
          />
        }
      />
    </SafeAreaView>
  );
}
