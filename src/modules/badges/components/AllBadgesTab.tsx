import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  Pressable,
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
import BadgeInfoModal from './BadgeInfoModal';

export default function AllBadgesTab() {
  const { data: userBadges, isLoading, refetch, isFetching } = useGetMyBadgesQuery();
  const [checkMyMilestones] = useCheckMyMilestonesMutation();
  const [selectedBadge, setSelectedBadge] = useState<{ badge: Badge; userBadge: UserBadge } | null>(null);
  const [showModal, setShowModal] = useState(false);

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
      ONBOARDING: {
        gradient: ['#E8F5E9', '#FFFFFF'] as const,
        icon: 'school-outline',
        iconColor: tw.color('kale') || '#3A7E52',
        accentColor: tw.color('kale') || '#3A7E52',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/mint.png'),
      },
      USAGE: {
        gradient: ['#E3F2FD', '#FFFFFF'] as const,
        icon: 'phone-portrait-outline',
        iconColor: tw.color('blueberry') || '#2196F3',
        accentColor: tw.color('blueberry') || '#2196F3',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/radish.png'),
      },
      COOKING: {
        gradient: ['#FFF3E0', '#FFFFFF'] as const,
        icon: 'restaurant-outline',
        iconColor: tw.color('orange') || '#FF9800',
        accentColor: tw.color('orange') || '#FF9800',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/orange.png'),
      },
      MONEY_SAVED: {
        gradient: ['#E8F5E9', '#FFFFFF'] as const,
        icon: 'cash-outline',
        iconColor: tw.color('kale') || '#4CAF50',
        accentColor: tw.color('kale') || '#4CAF50',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/mint.png'),
      },
      FOOD_SAVED: {
        gradient: ['#F1F8E9', '#FFFFFF'] as const,
        icon: 'leaf-outline',
        iconColor: '#8BC34A',
        accentColor: '#8BC34A',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/mint2.png'),
      },
      PLANNING: {
        gradient: ['#F3E5F5', '#FFFFFF'] as const,
        icon: 'clipboard-outline',
        iconColor: tw.color('eggplant-vibrant') || '#9C27B0',
        accentColor: tw.color('eggplant') || '#4B2176',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/eggplant-light.png'),
      },
      BONUS: {
        gradient: ['#FBE9E7', '#FFFFFF'] as const,
        icon: 'gift-outline',
        iconColor: tw.color('chilli') || '#FF5722',
        accentColor: tw.color('chilli') || '#FF5722',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/chilli.png'),
      },
      SPONSOR: {
        gradient: ['#FCE4EC', '#FFFFFF'] as const,
        icon: 'business-outline',
        iconColor: '#E91E63',
        accentColor: '#E91E63',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/radish.png'),
      },
      CHALLENGE_WINNER: {
        gradient: ['#FFF9C4', '#FFFFFF'] as const,
        icon: 'trophy-outline',
        iconColor: '#FFC107',
        accentColor: '#FFC107',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/lemon.png'),
      },
      SPECIAL: {
        gradient: ['#E0F7FA', '#FFFFFF'] as const,
        icon: 'star',
        iconColor: '#00BCD4',
        accentColor: '#00BCD4',
        ribbonPattern: require('../../../../assets/ribbons/ingredients-ribbons/radish.png'),
      },
    };

    const badgeCategory = badge.category as string;
    const config = categoryConfig[badgeCategory] || categoryConfig.ONBOARDING;

    const handleBadgePress = () => {
      setSelectedBadge({ badge, userBadge: item });
      setShowModal(true);
    };

    return (
      <Pressable 
        onPress={handleBadgePress}
        style={tw.style('mx-4 mb-4 overflow-hidden rounded-2xl bg-white border border-strokecream', cardDrop)}
      >
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
              
              {/* Sponsor Logo */}
              {badge.isSponsorBadge && badge.sponsorLogoUrl && (
                <View style={tw`mt-2`}>
                  <Image
                    source={{ uri: badge.sponsorLogoUrl }}
                    style={tw`h-8 w-16 rounded`}
                    resizeMode="contain"
                  />
                </View>
              )}
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
                
                {badge.isSponsorBadge && badge.sponsorName && (
                  <View style={tw`flex-row items-center rounded-full bg-pink-100 px-3 py-1.5`}>
                    <Ionicons name="business" size={12} color="#E91E63" />
                    <Text style={tw.style(bodySmallBold, 'ml-1.5 text-xs', { color: '#E91E63' })}>
                      {badge.sponsorName}
                    </Text>
                  </View>
                )}
                
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
      </Pressable>
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
      
      {/* Badge Info Modal */}
      {selectedBadge && (
        <BadgeInfoModal
          isVisible={showModal}
          badge={selectedBadge.badge}
          userBadge={selectedBadge.userBadge}
          onClose={() => {
            setShowModal(false);
            setSelectedBadge(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}
