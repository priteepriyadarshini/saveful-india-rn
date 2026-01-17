import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { useGetLeaderboardQuery } from '../api/api';
import { LeaderboardEntry, TimeFilter, MetricFilter } from '../api/types';
import { bodyMediumRegular, h6TextStyle, bodySmallRegular, bodySmallBold, subheadSmallUppercase } from '../../../theme/typography';
import { cardDrop } from '../../../theme/shadow';

export default function LeaderboardTab() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('all');
  const { data: leaderboard, isLoading, refetch, isFetching } = useGetLeaderboardQuery({ 
    limit: 100,
    period: timeFilter,
    metric: metricFilter 
  });

  const timeFilters: { key: TimeFilter; label: string; icon: any }[] = [
    { key: 'today', label: 'Today', icon: 'today' },
    { key: 'weekly', label: 'Weekly', icon: 'calendar' },
    { key: 'monthly', label: 'Monthly', icon: 'calendar-outline' },
    { key: 'all', label: 'All Time', icon: 'infinite' },
  ];

  const metricFilters: { key: MetricFilter; label: string; icon: any; color: string; bgColor: string }[] = [
    { key: 'all', label: 'Overall', icon: 'trophy', color: '#623eae', bgColor: '#F3EDFF' },
    { key: 'meals', label: 'Meals', icon: 'restaurant', color: '#6B35E8', bgColor: '#EFE7FF' },
    { key: 'saved', label: 'Food', icon: 'leaf', color: '#2D8659', bgColor: '#E8F5EE' },
    { key: 'money', label: 'Money', icon: 'cash', color: '#E87722', bgColor: '#FFF4E6' },
    { key: 'badges', label: 'Badges', icon: 'ribbon', color: '#9D6FFF', bgColor: '#F5F0FF' },
    { key: 'co2', label: 'CO2e', icon: 'cloud-outline', color: '#4A5568', bgColor: '#F7FAFC' },
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
    const foodSavedKg = ((item.foodSavedGrams || 0) / 1000).toFixed(2);
    const co2SavedKg = item.totalCo2SavedKg || 0;

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
            style={tw`px-4 py-3`}
          >
            {/* Header Row: Rank + Name */}
            <View style={tw`mb-3 flex-row items-center`}>
              {/* Rank Badge */}
              <View style={tw`mr-3`}>
                {config.icon ? (
                  <View style={tw`items-center`}>
                    <View style={tw.style('h-10 w-10 items-center justify-center rounded-full', {
                      backgroundColor: `${config.color}15`,
                    })}>
                      <Ionicons name={config.icon as any} size={20} color={config.color} />
                    </View>
                  </View>
                ) : (
                  <View style={tw`h-10 w-10 items-center justify-center rounded-full bg-creme-2`}>
                    <Text style={tw.style(bodySmallBold, 'text-eggplant')}>{rank}</Text>
                  </View>
                )}
              </View>

              {/* User Name */}
              <View style={tw`flex-1`}>
                <Text
                  style={tw.style(bodyMediumRegular, 'font-bold text-black text-base')}
                  numberOfLines={1}
                >
                  {item.userName || 'Anonymous User'}
                </Text>
              </View>

              {/* Rank Number Badge for top 3 */}
              {isTopThree && (
                <View style={tw.style('ml-2 rounded-full px-2.5 py-1', {
                  backgroundColor: `${config.color}20`,
                })}>
                  <Text style={tw.style(bodySmallBold, 'text-xs')} selectable={false}>
                    #{rank}
                  </Text>
                </View>
              )}
            </View>

            {/* Stats Row: All metrics in one line */}
            <View style={tw`flex-row items-center justify-between gap-1.5`}>
              {/* Meals */}
              <View style={tw`items-center`}>
                <View style={tw`mb-1 flex-row items-center rounded-full bg-white px-2 py-1 shadow-sm`}>
                  <Ionicons name="restaurant" size={11} color={tw.color('eggplant-vibrant') || '#7E42FF'} />
                  <Text style={tw.style(bodySmallBold, 'ml-1 text-eggplant text-[10px]')}>
                    {item.mealsCooked || 0}
                  </Text>
                </View>
                <Text style={tw.style(subheadSmallUppercase, 'text-stone text-[8px]')}>
                  Meals
                </Text>
              </View>

              {/* Food Saved */}
              <View style={tw`items-center`}>
                <View style={tw`mb-1 flex-row items-center rounded-full bg-white px-2 py-1 shadow-sm`}>
                  <Ionicons name="leaf" size={11} color={tw.color('kale') || '#3A7E52'} />
                  <Text style={tw.style(bodySmallBold, 'ml-1 text-kale text-[10px]')}>
                    {foodSavedKg}
                  </Text>
                </View>
                <Text style={tw.style(subheadSmallUppercase, 'text-stone text-[8px]')}>
                  Saved
                </Text>
              </View>

              {/* Money */}
              <View style={tw`items-center`}>
                <View style={tw`mb-1 flex-row items-center rounded-full bg-white px-2 py-1 shadow-sm`}>
                  <Ionicons name="cash" size={11} color={tw.color('orange') || '#F99C46'} />
                  <Text style={tw.style(bodySmallBold, 'ml-1 text-orange text-[10px]')}>
                    ₹{(item.totalMoneySaved || 0).toFixed(0)}
                  </Text>
                </View>
                <Text style={tw.style(subheadSmallUppercase, 'text-stone text-[8px]')}>
                  Money
                </Text>
              </View>

              {/* Badges */}
              <View style={tw`items-center`}>
                <View style={tw`mb-1 flex-row items-center rounded-full bg-white px-2 py-1 shadow-sm`}>
                  <Ionicons name="ribbon" size={11} color={tw.color('eggplant-light') || '#9D6FFF'} />
                  <Text style={tw.style(bodySmallBold, 'ml-1 text-eggplant text-[10px]')}>
                    {item.badgeCount || 0}
                  </Text>
                </View>
                <Text style={tw.style(subheadSmallUppercase, 'text-stone text-[8px]')}>
                  Badges
                </Text>
              </View>

              {/* CO2e */}
              <View style={tw`items-center`}>
                <View style={tw`mb-1 flex-row items-center rounded-full bg-white px-2 py-1 shadow-sm`}>
                  <Ionicons name="cloud-outline" size={11} color={tw.color('stone') || '#6D6D72'} />
                  <Text style={tw.style(bodySmallBold, 'ml-1 text-stone text-[10px]')}>
                    {co2SavedKg.toFixed(2)}
                  </Text>
                </View>
                <Text style={tw.style(subheadSmallUppercase, 'text-stone text-[8px]')}>
                  CO2e kg
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

      {/* Metric Filter Tabs */}
      <View style={tw`bg-white border-t border-strokecream`}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-4 py-3 gap-2.5`}
        >
          {metricFilters.map((filter) => {
            const isActive = metricFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setMetricFilter(filter.key)}
                style={[
                  tw`flex-row items-center rounded-xl px-4 py-2.5 min-w-[90px]`,
                  isActive 
                    ? { backgroundColor: filter.color, shadowColor: filter.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 3 }
                    : { backgroundColor: filter.bgColor }
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Ionicons
                  name={filter.icon}
                  size={18}
                  color={isActive ? '#FFFFFF' : filter.color}
                  style={tw`mr-2`}
                />
                <Text
                  style={[
                    tw.style(bodySmallBold, 'text-sm'),
                    { color: isActive ? '#FFFFFF' : filter.color }
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
