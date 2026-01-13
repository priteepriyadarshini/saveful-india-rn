import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { useGetLeaderboardQuery } from '../api/api';
import { LeaderboardEntry, TimeFilter } from '../api/types';
import { bodyMediumRegular, h6TextStyle, bodySmallRegular, bodySmallBold, subheadSmallUppercase } from '../../../theme/typography';
import { cardDrop } from '../../../theme/shadow';

export default function LeaderboardTab() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const { data: leaderboard, isLoading, refetch, isFetching } = useGetLeaderboardQuery({ 
    limit: 100,
    period: timeFilter 
  });

  const timeFilters: { key: TimeFilter; label: string; icon: any }[] = [
    { key: 'today', label: 'Today', icon: 'today' },
    { key: 'weekly', label: 'Weekly', icon: 'calendar' },
    { key: 'monthly', label: 'Monthly', icon: 'calendar-outline' },
    { key: 'all', label: 'All Time', icon: 'infinite' },
  ];

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const rank = index + 1;
    const isTopThree = rank <= 3;
    
    const getRankConfig = (rank: number) => {
      switch (rank) {
        case 1:
          return { 
            icon: 'trophy', 
            color: '#FFD700',
            gradient: ['#FFF9E6', '#FFFFFF'] as const,
            borderColor: '#FFD700'
          };
        case 2:
          return { 
            icon: 'trophy', 
            color: '#C0C0C0',
            gradient: ['#F5F5F5', '#FFFFFF'] as const,
            borderColor: '#C0C0C0'
          };
        case 3:
          return { 
            icon: 'trophy', 
            color: '#CD7F32',
            gradient: ['#FFF0E6', '#FFFFFF'] as const,
            borderColor: '#CD7F32'
          };
        default:
          return {
            icon: null,
            color: tw.color('stone') || '#6D6D72',
            gradient: ['#FFFFFF', '#FFFFFF'] as const,
            borderColor: tw.color('strokecream') || '#EEE4D7'
          };
      }
    };

    const config = getRankConfig(rank);
    const foodSavedKg = (item.foodSavedGrams / 1000).toFixed(2);

    return (
      <View style={tw.style('mx-4 mb-3 overflow-hidden rounded-2xl border bg-white', cardDrop, {
        borderColor: config.borderColor,
        borderWidth: isTopThree ? 2 : 1,
      })}>
        <ImageBackground
          source={require('../../../../assets/ribbons/ingredients-ribbons/lemon.png')}
          resizeMode="cover"
          style={tw`overflow-hidden`}
          imageStyle={{ opacity: 0.08 }}
        >
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          style={tw`p-4`}
        >
          <View style={tw`flex-row items-center`}>
            {/* Rank Badge */}
            <View style={tw`mr-3 w-16 items-center justify-center`}>
              {config.icon ? (
                <View style={tw`items-center`}>
                  <View style={tw.style('mb-1 h-12 w-12 items-center justify-center rounded-full', {
                    backgroundColor: `${config.color}15`,
                  })}>
                    <Ionicons name={config.icon as any} size={24} color={config.color} />
                  </View>
                  <Text style={tw.style(subheadSmallUppercase, 'text-black')}>#{rank}</Text>
                </View>
              ) : (
                <View style={tw`h-12 w-12 items-center justify-center rounded-full bg-creme-2`}>
                  <Text style={tw.style(h6TextStyle, 'text-sm text-eggplant')}>#{rank}</Text>
                </View>
              )}
            </View>

            {/* User Info */}
            <View style={tw`flex-1`}>
              <Text
                style={tw.style(bodyMediumRegular, 'mb-1 font-bold text-black')}
                numberOfLines={1}
              >
                {item.userName || 'Anonymous User'}
              </Text>
              {item.userEmail && (
                <Text
                  style={tw.style(bodySmallRegular, 'text-stone')}
                  numberOfLines={1}
                >
                  {item.userEmail}
                </Text>
              )}
            </View>
          </View>

          {/* Stats Pills */}
          <View style={tw`mt-4 flex-row items-center justify-around`}>
            {/* Meals Cooked */}
            <View style={tw`flex-1 items-center`}>
              <View style={tw`mb-1.5 flex-row items-center rounded-full bg-white px-3 py-2 shadow-sm`}>
                <Ionicons name="restaurant" size={14} color={tw.color('eggplant-vibrant') || '#7E42FF'} />
                <Text style={tw.style(bodySmallBold, 'ml-1.5 text-eggplant')}>
                  {item.mealsCooked || 0}
                </Text>
              </View>
              <Text style={tw.style(subheadSmallUppercase, 'text-stone')}>
                Meals
              </Text>
            </View>

            {/* Food Saved */}
            <View style={tw`flex-1 items-center`}>
              <View style={tw`mb-1.5 flex-row items-center rounded-full bg-white px-3 py-2 shadow-sm`}>
                <Ionicons name="leaf" size={14} color={tw.color('kale') || '#3A7E52'} />
                <Text style={tw.style(bodySmallBold, 'ml-1.5 text-kale')}>
                  {foodSavedKg} kg
                </Text>
              </View>
              <Text style={tw.style(subheadSmallUppercase, 'text-stone')}>
                Saved
              </Text>
            </View>

            {/* Badge Count */}
            <View style={tw`flex-1 items-center`}>
              <View style={tw`mb-1.5 flex-row items-center rounded-full bg-white px-3 py-2 shadow-sm`}>
                <Ionicons name="ribbon" size={14} color={tw.color('orange') || '#F99C46'} />
                <Text style={tw.style(bodySmallBold, 'ml-1.5 text-orange')}>
                  {item.badgeCount || 0}
                </Text>
              </View>
              <Text style={tw.style(subheadSmallUppercase, 'text-stone')}>
                Badges
              </Text>
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
        <Ionicons name="podium-outline" size={48} color={tw.color('stone')} />
      </View>
      <Text style={tw.style(h6TextStyle, 'mb-3 text-center text-black')}>
        No Active Users Yet
      </Text>
      <Text style={tw.style(bodyMediumRegular, 'text-center text-stone leading-relaxed')}>
        Start cooking and saving food{`\n`}to appear on the leaderboard!
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
    <View style={tw`flex-1 bg-creme`}>
      {/* Time Filter Tabs with Enhanced Design */}
      <View style={tw`bg-white px-3 py-3 shadow-sm`}>
        <View style={tw`flex-row justify-between gap-2`}>
          {timeFilters.map((filter) => {
            const isActive = timeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setTimeFilter(filter.key)}
                style={tw.style(
                  'flex-1 items-center rounded-xl py-3',
                  isActive ? 'bg-eggplant shadow-sm' : 'bg-creme'
                )}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Ionicons
                  name={filter.icon}
                  size={20}
                  color={isActive ? 'white' : tw.color('stone')}
                />
                <Text
                  style={tw.style(
                    subheadSmallUppercase,
                    'mt-1.5',
                    isActive ? 'text-white' : 'text-stone'
                  )}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Leaderboard List */}
      <FlatList
        data={leaderboard || []}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item, index) => `${item.userId}-${index}`}
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
    </View>
  );
}
