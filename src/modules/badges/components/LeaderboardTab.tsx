import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { useGetCurrentUserQuery } from '../../auth/api';
import { useGetLeaderboardQuery } from '../api/api';
import { LeaderboardEntry, MetricFilter, TimeFilter } from '../api/types';
import { getCurrencySymbol } from '../../../common/utils/currency';
import {
  bodyMediumRegular,
  bodySmallBold,
  bodySmallRegular,
  h6TextStyle,
  subheadSmallUppercase,
  subheadMediumUppercase,
} from '../../../theme/typography';
import { cardDrop } from '../../../theme/shadow';

// ─── Country helpers ──────────────────────────────────────────────────────────

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  india: 'IN',
  australia: 'AU',
  'new zealand': 'NZ',
  'united states': 'US',
  'united kingdom': 'GB',
  canada: 'CA',
  china: 'CN',
  japan: 'JP',
  'south korea': 'KR',
  singapore: 'SG',
  'united arab emirates': 'AE',
  germany: 'DE',
  france: 'FR',
};

const normalizeCountryCode = (country?: string) => {
  if (!country) return undefined;
  const trimmed = country.trim();
  if (!trimmed) return undefined;
  const upper = trimmed.toUpperCase();
  if (upper.length === 2) return upper;
  return COUNTRY_NAME_TO_CODE[trimmed.toLowerCase()];
};

// ─── Filter configs ───────────────────────────────────────────────────────────

const timeFilters: { key: TimeFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'today', label: 'Today', icon: 'today' },
  { key: 'weekly', label: 'Weekly', icon: 'calendar' },
  { key: 'monthly', label: 'Monthly', icon: 'calendar-outline' },
  { key: 'all', label: 'All Time', icon: 'infinite' },
];

const metricFilters: {
  key: MetricFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}[] = [
  { key: 'all',    label: 'Overall', icon: 'trophy',        color: '#4B2176', bgColor: '#F3EDFF' },
  { key: 'meals',  label: 'Meals',   icon: 'restaurant',    color: '#6B35E8', bgColor: '#EFE7FF' },
  { key: 'saved',  label: 'Food',    icon: 'leaf',          color: '#2D8659', bgColor: '#E8F5EE' },
  { key: 'money',  label: 'Money',   icon: 'cash',          color: '#C05E00', bgColor: '#FFF4E6' },
  { key: 'badges', label: 'Badges',  icon: 'ribbon',        color: '#7E42FF', bgColor: '#F5F0FF' },
  { key: 'co2',    label: 'CO2e',    icon: 'cloud-outline', color: '#4A5568', bgColor: '#F7FAFC' },
];

// ─── Rank theme helpers ───────────────────────────────────────────────────────

const RANK_THEMES = {
  1: { medal: 'star',   medalColor: '#F59E0B', borderColor: '#F59E0B', headerBg: '#FEF3C7', avatarBg: '#FFFBEB', textColor: '#92400E' },
  2: { medal: 'podium', medalColor: '#7B8FA1', borderColor: '#94A3B8', headerBg: '#F1F5F9', avatarBg: '#F8FAFC', textColor: '#475569' },
  3: { medal: 'flame',  medalColor: '#C87941', borderColor: '#D97706', headerBg: '#FEF9C3', avatarBg: '#FFFBEB', textColor: '#92400E' },
} as const;

function getRankAccentColor(rank: number) {
  if (rank <= 10) return '#4B2176';
  if (rank <= 25) return '#F99C46';
  return '#6D6D72';
}

function getTopCardRibbon(rank: number) {
  if (rank === 1) return require('../../../../assets/ribbons/ingredients-ribbons/lemon2.png');
  if (rank === 2) return require('../../../../assets/ribbons/ingredients-ribbons/mint2.png');
  return require('../../../../assets/ribbons/ingredients-ribbons/radish2.png');
}

function getListRibbon(rank: number) {
  const mod = rank % 3;
  if (mod === 1) return require('../../../../assets/ribbons/ingredients-ribbons/lemon2.png');
  if (mod === 2) return require('../../../../assets/ribbons/ingredients-ribbons/mint2.png');
  return require('../../../../assets/ribbons/ingredients-ribbons/chilli2.png');
}

function getUserInitials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ─── Metric helpers ───────────────────────────────────────────────────────────

function getMetricValue(entry: LeaderboardEntry, metric: MetricFilter) {
  switch (metric) {
    case 'meals':  return entry.mealsCooked || 0;
    case 'saved':  return entry.foodSavedGrams || 0;
    case 'money':  return entry.totalMoneySaved || 0;
    case 'badges': return entry.badgeCount || 0;
    case 'co2':    return entry.totalCo2SavedKg || 0;
    case 'all':
    default:
      return (
        (entry.mealsCooked || 0) +
        (entry.foodSavedGrams || 0) / 1000 +
        (entry.totalMoneySaved || 0) +
        (entry.badgeCount || 0) * 10 +
        (entry.totalCo2SavedKg || 0)
      );
  }
}

function formatMetric(entry: LeaderboardEntry, metric: MetricFilter): string {
  switch (metric) {
    case 'meals':  return `${entry.mealsCooked || 0}`;
    case 'saved':  return `${((entry.foodSavedGrams || 0) / 1000).toFixed(2)} kg`;
    case 'money':  return `${getCurrencySymbol(entry.country)}${(entry.totalMoneySaved || 0).toFixed(0)}`;
    case 'badges': return `${entry.badgeCount || 0}`;
    case 'co2':    return `${(entry.totalCo2SavedKg || 0).toFixed(2)} kg`;
    case 'all':
    default:
      return `${entry.mealsCooked || 0}`;
  }
}

function formatMetricLabel(metric: MetricFilter): string {
  switch (metric) {
    case 'meals':  return 'meals cooked';
    case 'saved':  return 'food saved';
    case 'money':  return 'money saved';
    case 'badges': return 'badges earned';
    case 'co2':    return 'CO2e saved';
    case 'all':
    default:       return 'meals cooked';
  }
}

function getMetricIcon(metric: MetricFilter): keyof typeof Ionicons.glyphMap {
  switch (metric) {
    case 'meals':  return 'restaurant';
    case 'saved':  return 'leaf';
    case 'money':  return 'cash';
    case 'badges': return 'ribbon';
    case 'co2':    return 'cloud-outline';
    default:       return 'trophy';
  }
}

// ─── PodiumCard (Top 3) ───────────────────────────────────────────────────────

function PodiumCard({ item, rank, metric }: { item: LeaderboardEntry; rank: 1 | 2 | 3; metric: MetricFilter }) {
  const theme = RANK_THEMES[rank];
  const initials = getUserInitials(item.userName);
  const metricVal = formatMetric(item, metric);
  const metricLabel = formatMetricLabel(metric);
  const metricIcon = getMetricIcon(metric);

  return (
    <View
      style={[
        tw`overflow-hidden rounded-3xl bg-white`,
        { width: 200, borderWidth: 1.5, borderColor: theme.borderColor },
        cardDrop,
      ]}
    >
      {/* Header strip */}
      <ImageBackground
        source={getTopCardRibbon(rank)}
        resizeMode="cover"
        imageStyle={{ opacity: 0.35 }}
      >
        <View style={[tw`items-center px-4 pt-5 pb-4`, { backgroundColor: theme.headerBg + 'CC' }]}>
          {/* Medal badge */}
          <View
            style={[
              tw`absolute top-3 right-3 h-8 w-8 items-center justify-center rounded-full`,
              { backgroundColor: theme.medalColor + '22' },
            ]}
          >
            <Ionicons name={theme.medal as keyof typeof Ionicons.glyphMap} size={17} color={theme.medalColor} />
          </View>

          {/* Rank label */}
          <View
            style={[
              tw`mb-3 h-6 min-w-[32px] items-center justify-center rounded-full px-2.5`,
              { backgroundColor: theme.medalColor },
            ]}
          >
            <Text style={tw.style(subheadSmallUppercase, 'text-white')}>#{rank}</Text>
          </View>

          {/* Avatar */}
          <View
            style={[
              tw`h-16 w-16 items-center justify-center rounded-full border-2`,
              { backgroundColor: theme.avatarBg, borderColor: theme.borderColor },
            ]}
          >
            <Text style={[tw.style(h6TextStyle, 'text-center'), { color: theme.textColor, fontSize: 20 }]}>
              {initials}
            </Text>
          </View>

          {/* Name */}
          <Text
            style={tw.style(bodySmallBold, 'mt-2.5 text-center text-black text-[15px]')}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.userName || 'Anonymous'}
          </Text>
        </View>
      </ImageBackground>

      {/* Metric body */}
      <View style={tw`px-4 py-4 bg-white`}>
        {/* Primary metric */}
        <View style={tw`mb-2.5 flex-row items-center justify-center gap-1.5`}>
          <View
            style={[
              tw`h-7 w-7 items-center justify-center rounded-full`,
              { backgroundColor: theme.medalColor + '22' },
            ]}
          >
            <Ionicons name={metricIcon} size={14} color={theme.medalColor} />
          </View>
          <Text
            style={[tw.style(h6TextStyle, 'text-center'), { color: theme.medalColor, fontSize: 22, lineHeight: 26 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {metricVal}
          </Text>
        </View>
        <Text style={tw.style(subheadSmallUppercase, 'text-center text-stone mb-3')}>
          {metricLabel}
        </Text>

        {/* Divider */}
        <View style={tw`h-px bg-strokecream mb-3`} />

        {/* Secondary stats */}
        <View style={tw`flex-row justify-between`}>
          <View style={tw`flex-1 items-center`}>
            <Ionicons name="restaurant-outline" size={13} color={tw.color('stone')} />
            <Text style={tw.style(bodySmallBold, 'mt-0.5 text-black text-xs')} numberOfLines={1}>
              {item.mealsCooked || 0}
            </Text>
            <Text style={tw.style(subheadSmallUppercase, 'text-stone')}>meals</Text>
          </View>
          <View style={[tw`w-px self-stretch`, { backgroundColor: '#EEE4D7' }]} />
          <View style={tw`flex-1 items-center`}>
            <Ionicons name="leaf-outline" size={13} color={tw.color('stone')} />
            <Text style={tw.style(bodySmallBold, 'mt-0.5 text-black text-xs')} numberOfLines={1}>
              {((item.foodSavedGrams || 0) / 1000).toFixed(1)}kg
            </Text>
            <Text style={tw.style(subheadSmallUppercase, 'text-stone')}>food</Text>
          </View>
          <View style={[tw`w-px self-stretch`, { backgroundColor: '#EEE4D7' }]} />
          <View style={tw`flex-1 items-center`}>
            <Ionicons name="ribbon-outline" size={13} color={tw.color('stone')} />
            <Text style={tw.style(bodySmallBold, 'mt-0.5 text-black text-xs')} numberOfLines={1}>
              {item.badgeCount || 0}
            </Text>
            <Text style={tw.style(subheadSmallUppercase, 'text-stone')}>badges</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── ListRow (Rank 4+) ────────────────────────────────────────────────────────

function ListRow({ item, rank, metric }: { item: LeaderboardEntry; rank: number; metric: MetricFilter }) {
  const accentColor = getRankAccentColor(rank);
  const initials = getUserInitials(item.userName);
  const metricVal = formatMetric(item, metric);
  const metricIcon = getMetricIcon(metric);
  const isTopTen = rank <= 10;

  return (
    <View
      style={[
        tw`mx-4 mb-3 overflow-hidden rounded-2xl bg-white`,
        { borderWidth: 1, borderColor: '#EEE4D7', borderLeftWidth: 4, borderLeftColor: accentColor },
        cardDrop,
      ]}
    >
      <ImageBackground
        source={getListRibbon(rank)}
        resizeMode="cover"
        imageStyle={{ opacity: 0.06 }}
      >
        <View style={tw`flex-row items-center px-3.5 py-3.5`}>

          {/* Rank badge */}
          <View
            style={[
              tw`mr-3 h-10 w-10 shrink-0 items-center justify-center rounded-xl`,
              isTopTen
                ? { backgroundColor: '#4B2176' }
                : { backgroundColor: '#F3EDFF', borderWidth: 1, borderColor: '#EEE4D7' },
            ]}
          >
            <Text
              style={[
                tw.style(bodySmallBold, 'text-xs'),
                { color: isTopTen ? '#FFFFFF' : '#4B2176' },
              ]}
            >
              #{rank}
            </Text>
          </View>

          {/* Avatar circle */}
          <View
            style={[
              tw`mr-3 h-10 w-10 shrink-0 items-center justify-center rounded-full`,
              { backgroundColor: accentColor + '18', borderWidth: 1, borderColor: accentColor + '40' },
            ]}
          >
            <Text style={[tw.style(bodySmallBold, 'text-xs'), { color: accentColor }]}>
              {initials}
            </Text>
          </View>

          {/* Name + secondary stats */}
          <View style={tw`flex-1 pr-2`}>
            <Text
              style={tw.style(bodySmallBold, 'text-black text-sm')}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.userName || 'Anonymous User'}
            </Text>
            <Text
              style={tw.style(bodySmallRegular, 'mt-0.5 text-stone text-xs leading-4')}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {((item.foodSavedGrams || 0) / 1000).toFixed(1)} kg food · {(item.totalCo2SavedKg || 0).toFixed(1)} kg CO₂
            </Text>
          </View>

          {/* Primary metric pill */}
          <View
            style={[
              tw`shrink-0 flex-row items-center rounded-xl px-3 py-2`,
              { backgroundColor: accentColor + '12', borderWidth: 1, borderColor: accentColor + '35' },
            ]}
          >
            <Ionicons name={metricIcon} size={13} color={accentColor} style={tw`mr-1`} />
            <Text
              style={[tw.style(bodySmallBold, 'text-xs'), { color: accentColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {metricVal}
            </Text>
          </View>

        </View>
      </ImageBackground>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LeaderboardTab() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('all');

  const { data: currentUser } = useGetCurrentUserQuery();
  const normalizedUserCountry = normalizeCountryCode(currentUser?.country);

  const { data: leaderboardRaw, isLoading, isFetching, refetch } = useGetLeaderboardQuery({
    limit: 100,
    period: timeFilter,
    metric: metricFilter,
    country: metricFilter === 'money' ? normalizedUserCountry : undefined,
  });

  const leaderboard = useMemo(() => {
    if (!leaderboardRaw) return [];
    const source =
      metricFilter === 'money' && normalizedUserCountry
        ? leaderboardRaw.filter(
            entry => normalizeCountryCode(entry.country) === normalizedUserCountry,
          )
        : leaderboardRaw;
    return [...source].sort((a, b) => getMetricValue(b, metricFilter) - getMetricValue(a, metricFilter));
  }, [leaderboardRaw, metricFilter, normalizedUserCountry]);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  const renderHeader = () => (
    <View>
      {/* ── Time filter tabs ── */}
      <ImageBackground
        source={require('../../../../assets/ribbons/ingredients-ribbons/eggplant-light2.png')}
        resizeMode="cover"
        imageStyle={{ opacity: 0.07 }}
      >
        <View style={tw`px-3 py-3`}>
          <View style={tw`flex-row gap-2`}>
            {timeFilters.map(filter => {
              const isActive = timeFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setTimeFilter(filter.key)}
                  style={tw.style(
                    'flex-1 items-center rounded-2xl border py-3',
                    isActive ? 'border-eggplant bg-eggplant' : 'border-strokecream bg-white',
                  )}
                >
                  <View
                    style={tw.style(
                      'mb-1.5 h-8 w-8 items-center justify-center rounded-full',
                      isActive ? 'bg-white/20' : 'bg-creme',
                    )}
                  >
                    <Ionicons
                      name={filter.icon}
                      size={16}
                      color={isActive ? '#FFFFFF' : tw.color('eggplant') || '#4B2176'}
                    />
                  </View>
                  <Text style={tw.style(subheadSmallUppercase, isActive ? 'text-white' : 'text-stone')}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ImageBackground>

      {/* ── Metric filter chips ── */}
      <View style={tw`border-t border-strokecream bg-white`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-4 py-3 gap-2`}
        >
          {metricFilters.map(filter => {
            const isActive = metricFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setMetricFilter(filter.key)}
                style={[
                  tw`flex-row items-center rounded-2xl border px-4 py-2.5`,
                  { minWidth: 104 },
                  isActive
                    ? { backgroundColor: filter.color, borderColor: filter.color }
                    : { backgroundColor: filter.bgColor, borderColor: '#EEE4D7' },
                ]}
              >
                <View
                  style={[
                    tw`h-6 w-6 items-center justify-center rounded-full mr-1.5`,
                    isActive ? { backgroundColor: 'rgba(255,255,255,0.22)' } : { backgroundColor: '#FFFFFF' },
                  ]}
                >
                  <Ionicons
                    name={filter.icon}
                    size={12}
                    color={isActive ? '#FFFFFF' : filter.color}
                  />
                </View>
                <Text style={tw.style(bodySmallBold, isActive ? 'text-white' : 'text-black')}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Money notice ── */}
      {metricFilter === 'money' && (
        <View style={tw`mx-4 mt-2 flex-row items-center rounded-2xl border border-strokecream bg-creme px-3.5 py-3`}>
          <Ionicons name="information-circle-outline" size={16} color={tw.color('stone')} style={tw`mr-2`} />
          <Text style={tw.style(bodySmallRegular, 'flex-1 text-stone text-xs leading-4')}>
            Money rankings are filtered to your country so currencies stay comparable.
          </Text>
        </View>
      )}

      {/* ── Podium section ── */}
      {topThree.length > 0 && (
        <View style={tw`mt-4 mb-2`}>
          {/* Section header */}
          <View style={tw`flex-row items-center px-5 mb-3`}>
            <View style={tw`flex-1 h-px bg-strokecream`} />
            <View style={tw`flex-row items-center mx-3 gap-1.5`}>
              <Ionicons name="trophy" size={14} color="#F59E0B" />
              <Text style={tw.style(subheadMediumUppercase, 'text-stone')}>Top Performers</Text>
              <Ionicons name="trophy" size={14} color="#F59E0B" />
            </View>
            <View style={tw`flex-1 h-px bg-strokecream`} />
          </View>

          {/* Podium cards horizontal scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`px-4 gap-3 pb-1`}
          >
            {topThree.map((item, index) => {
              const rank = (index + 1) as 1 | 2 | 3;
              return (
                <PodiumCard key={`${item.userId}-${rank}`} item={item} rank={rank} metric={metricFilter} />
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Rest of list header ── */}
      {remaining.length > 0 && (
        <View style={tw`flex-row items-center px-5 mt-3 mb-2`}>
          <View style={tw`flex-1 h-px bg-strokecream`} />
          <View style={tw`flex-row items-center mx-3 gap-1.5`}>
            <Ionicons name="list" size={13} color={tw.color('stone')} />
            <Text style={tw.style(subheadMediumUppercase, 'text-stone')}>Rankings</Text>
          </View>
          <View style={tw`flex-1 h-px bg-strokecream`} />
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-creme`}>
        <ActivityIndicator size="large" color={tw.color('eggplant') || '#4B2176'} />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-creme`}>
      <FlatList
        data={remaining}
        keyExtractor={(item, index) => `${item.userId}-${index}`}
        renderItem={({ item, index }) => (
          <ListRow item={item} rank={index + 4} metric={metricFilter} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={tw`items-center justify-center px-8 py-20`}>
            <View style={tw`mb-6 h-24 w-24 items-center justify-center rounded-full bg-creme-2`}>
              <Ionicons name="podium-outline" size={48} color={tw.color('stone')} />
            </View>
            <Text style={tw.style(h6TextStyle, 'mb-3 text-center text-black')}>
              No Active Users Yet
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
              Start cooking and saving food to appear on the leaderboard.
            </Text>
          </View>
        }
        contentContainerStyle={tw`pb-6 pt-2`}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={tw.color('eggplant') || '#4B2176'}
          />
        }
      />
    </View>
  );
}
