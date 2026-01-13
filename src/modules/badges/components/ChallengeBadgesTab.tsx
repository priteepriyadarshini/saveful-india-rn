import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { useGetMyBadgesQuery } from '../api/api';
import { UserBadge, Badge, BadgeCategory } from '../api/types';
import { bodyMediumRegular, h6TextStyle, bodySmallRegular, subheadSmallUppercase, bodySmallBold } from '../../../theme/typography';
import { cardDrop } from '../../../theme/shadow';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAutoFinalizeGroupChallengesMutation } from '../../groups/api/api';

export default function ChallengeBadgesTab() {
  const { data: userBadges, isLoading, refetch, isFetching } = useGetMyBadgesQuery();
  const [autoFinalize, { isLoading: isAutoFinalizing }] = useAutoFinalizeGroupChallengesMutation();

  React.useEffect(() => {
    const maybeFinalize = async () => {
      try {
        const key = 'challenge:autoFinalize:lastRun';
        const last = await AsyncStorage.getItem(key);
        const now = Date.now();
        const ttlMs = 12 * 60 * 60 * 1000; // 12 hours
        if (!last || now - Number(last) > ttlMs) {
          await autoFinalize({ topWinnersCount: 3 }).unwrap().catch(() => {});
          await AsyncStorage.setItem(key, String(now));
          // Refetch badges to reflect any new awards
          refetch();
        }
      } catch {}
    };
    maybeFinalize();
  }, [autoFinalize, refetch]);

  // Filter only challenge badges
  const challengeBadges = React.useMemo(() => {
    if (!userBadges) return [];
    return userBadges.filter((item: any) => {
      const badge = typeof item.badgeId === 'object' ? item.badgeId as Badge : null;
      return badge?.category === BadgeCategory.CHALLENGE_WINNER;
    });
  }, [userBadges]);

  const renderBadgeItem = ({ item }: { item: UserBadge }) => {
    const badge = typeof item.badgeId === 'object' ? item.badgeId as Badge : null;
    
    if (!badge) return null;

    const metadata = item.metadata;
    const gradientColors: readonly [string, string] = ['#F3E5F5', '#FFFFFF'] as const;

    return (
      <View style={tw.style('mx-4 mb-4 overflow-hidden rounded-2xl bg-white border border-strokecream', cardDrop)}>
        <ImageBackground
          source={require('../../../../assets/ribbons/ingredients-ribbons/eggplant-light.png')}
          resizeMode="cover"
          style={tw`overflow-hidden`}
          imageStyle={{ opacity: 0.08 }}
        >
          <LinearGradient
            colors={gradientColors}
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
                    <Ionicons name="medal-outline" size={40} color={tw.color('eggplant-vibrant')} />
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

              {/* Challenge Metadata */}
              {metadata?.challengeName && (
                <View style={tw`mb-3 flex-row items-center rounded-full bg-white/90 px-3 py-2 shadow-sm`}>
                  <Ionicons name="flame" size={14} color={tw.color('eggplant-vibrant')} />
                  <Text style={tw.style(bodySmallBold, 'ml-2 flex-1 text-xs text-eggplant')} numberOfLines={1}>
                    {metadata.challengeName}
                  </Text>
                </View>
              )}

              {/* Stats Pills */}
              <View style={tw`mb-3 flex-row flex-wrap items-center gap-2`}>
                {metadata?.rank && (
                  <View style={tw`flex-row items-center rounded-full bg-lemon/40 px-3 py-1.5`}>
                    <Ionicons name="trophy" size={12} color={tw.color('orange')} />
                    <Text style={tw.style(bodySmallBold, 'ml-1.5 text-xs text-orange')}>
                      Rank #{metadata.rank}
                    </Text>
                    {metadata.totalParticipants && (
                      <Text style={tw.style(bodySmallRegular, 'ml-1 text-xs text-stone')}>
                        / {metadata.totalParticipants}
                      </Text>
                    )}
                  </View>
                )}
                
                {item.achievedValue !== undefined && item.achievedValue > 0 && (
                  <View style={tw`flex-row items-center rounded-full bg-mint/30 px-3 py-1.5`}>
                    <Ionicons name="checkmark-circle" size={12} color={tw.color('kale')} />
                    <Text style={tw.style(bodySmallBold, 'ml-1.5 text-xs text-kale')}>
                      {item.achievedValue} pts
                    </Text>
                  </View>
                )}
                
                {badge.rarityScore > 0 && (
                  <View style={tw`flex-row items-center rounded-full bg-radish/30 px-3 py-1.5`}>
                    <Ionicons name="diamond" size={10} color={tw.color('eggplant')} />
                    <Text style={tw.style(bodySmallBold, 'ml-1.5 text-xs text-eggplant')}>
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
      <View style={tw`mb-6 h-24 w-24 items-center justify-center rounded-full bg-radish/20`}>
        <Ionicons name="medal-outline" size={48} color={tw.color('eggplant')} />
      </View>
      <Text style={tw.style(h6TextStyle, 'mb-3 text-center text-black')}>
        No Challenge Badges Yet
      </Text>
      <Text style={tw.style(bodyMediumRegular, 'text-center text-stone leading-relaxed')}>
        Join and win challenges{`\n`}to earn your first challenge badge!
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
        data={challengeBadges}
        renderItem={renderBadgeItem}
        keyExtractor={item => item._id}
        contentContainerStyle={tw`py-4`}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={tw.color('eggplant')}
          />
        }
      />
    </SafeAreaView>
  );
}
