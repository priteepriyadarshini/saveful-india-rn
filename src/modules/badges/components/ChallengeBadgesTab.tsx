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

  const renderListHeader = () => (
    <View style={tw.style('mx-4 mb-3 mt-1 overflow-hidden rounded-2xl border border-strokecream bg-white', cardDrop)}>
      <ImageBackground
        source={require('../../../../assets/ribbons/ingredients-ribbons/lemon2.png')}
        resizeMode="cover"
        imageStyle={{ opacity: 0.14 }}
      >
        <View style={tw`flex-row items-center justify-between px-4 py-3.5`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="trophy-outline" size={16} color={tw.color('eggplant') || '#4B2176'} />
            <Text style={tw.style(subheadSmallUppercase, 'ml-1.5 text-eggplant')}>
              Challenge Badges
            </Text>
          </View>
          <View style={tw`rounded-full border border-strokecream bg-creme px-2.5 py-1`}>
            <Text style={tw.style(bodySmallBold, 'text-eggplant')}>{challengeBadges.length}</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  const renderBadgeItem = ({ item }: { item: UserBadge }) => {
    const badge = typeof item.badgeId === 'object' ? item.badgeId as Badge : null;
    
    if (!badge) return null;

    const metadata = item.metadata;

    return (
      <View style={tw.style('mx-4 mb-4 overflow-hidden rounded-2xl border border-strokecream bg-white', cardDrop)}>
        <ImageBackground
          source={require('../../../../assets/ribbons/ingredients-ribbons/eggplant-light.png')}
          resizeMode="cover"
          style={tw`overflow-hidden`}
          imageStyle={{ opacity: 0.1 }}
        >
          <View style={tw`p-4`}>
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
                <Ionicons name="chevron-forward" size={16} color={tw.color('stone') || '#6D6D72'} />
              </View>
              
              <Text
                style={tw.style(bodySmallRegular, 'mb-3 text-stone')}
                numberOfLines={2}
              >
                {badge.description}
              </Text>

              {/* Challenge Metadata */}
              {metadata?.challengeName && (
                <View style={tw`mb-3 flex-row items-center rounded-full border border-strokecream bg-white px-3 py-2`}>
                  <Ionicons name="flame" size={14} color={tw.color('eggplant-vibrant')} />
                  <Text style={tw.style(bodySmallBold, 'ml-2 flex-1 text-xs text-eggplant')} numberOfLines={1}>
                    {metadata.challengeName}
                  </Text>
                </View>
              )}

              {/* Stats Pills */}
              <View style={tw`mb-3 flex-row flex-wrap items-center gap-2`}>
                {metadata?.rank && (
                  <View style={tw`flex-row items-center rounded-full border border-lemon bg-lemon/40 px-3 py-1.5`}>
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
                  <View style={tw`flex-row items-center rounded-full border border-mint bg-mint/30 px-3 py-1.5`}>
                    <Ionicons name="checkmark-circle" size={12} color={tw.color('kale')} />
                    <Text style={tw.style(bodySmallBold, 'ml-1.5 text-xs text-kale')}>
                      {item.achievedValue} pts
                    </Text>
                  </View>
                )}
                
                {badge.rarityScore > 0 && (
                  <View style={tw`flex-row items-center rounded-full border border-radish bg-radish/30 px-3 py-1.5`}>
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
        </View>
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
        contentContainerStyle={tw`pb-5 pt-3`}
        ListHeaderComponent={renderListHeader}
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
