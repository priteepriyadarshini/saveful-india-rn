import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { useNavigation } from '@react-navigation/native';
import {
  bodyMediumRegular,
  bodyMediumBold,
  h6TextStyle,
} from '../../../theme/typography';
import { useGetWasteAnalyticsQuery } from '../api/inventoryApi';

const WASTE_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  wet_waste: { label: 'Wet Waste', color: '#22C55E', icon: 'leaf-outline' },
  dry_waste: { label: 'Dry Waste', color: '#3B82F6', icon: 'cube-outline' },
  hazardous: { label: 'Hazardous', color: '#EF4444', icon: 'warning-outline' },
};

const REASON_CONFIG: Record<string, { label: string; icon: string }> = {
  expired: { label: 'Expired', icon: 'time-outline' },
  spoiled: { label: 'Spoiled', icon: 'sad-outline' },
  leftover: { label: 'Leftover', icon: 'restaurant-outline' },
  unused: { label: 'Unused', icon: 'close-circle-outline' },
  cooked: { label: 'Cooked', icon: 'flame-outline' },
};

export default function WasteAnalyticsScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, isError, refetch } = useGetWasteAnalyticsQuery();

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* Header */}
      <View style={tw`px-5 pt-3 pb-2 flex-row items-center`}>
        <Pressable onPress={() => navigation.goBack()} style={tw`mr-3`}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={tw.style(h6TextStyle, 'text-gray-900')}>
          Waste Tracker
        </Text>
      </View>

      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center px-5`}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={tw.style(bodyMediumRegular, 'text-red-500 mt-2')}>
            Failed to load analytics
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={tw`mt-3 bg-purple-600 px-6 py-2 rounded-full`}
          >
            <Text style={tw.style(bodyMediumBold, 'text-white')}>Retry</Text>
          </Pressable>
        </View>
      ) : !data || data.totalDiscarded === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-5`}>
          <Ionicons name="leaf-outline" size={64} color="#22C55E" />
          <Text style={tw.style(bodyMediumBold, 'text-green-600 mt-3')}>
            Zero waste so far!
          </Text>
          <Text style={tw.style(bodyMediumRegular, 'text-gray-400 mt-1 text-center')}>
            Great job keeping your kitchen waste-free
          </Text>
        </View>
      ) : (
        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={tw`px-5 pb-10 pt-3 gap-4`}
        >
          {/* Total Summary */}
          <View style={tw`bg-purple-50 rounded-2xl p-5 items-center`}>
            <Text style={tw`text-4xl font-bold text-purple-700`}>
              {data.totalDiscarded}
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'text-purple-600')}>
              Total Items Discarded
            </Text>
          </View>

          {/* Waste Type Breakdown */}
          <View>
            <Text style={tw.style(bodyMediumBold, 'text-gray-800 mb-2')}>
              By Waste Type
            </Text>
            <View style={tw`flex-row gap-2`}>
              {Object.entries(data.byWasteType).map(([type, count]) => {
                const config = WASTE_TYPE_CONFIG[type] || {
                  label: type,
                  color: '#6B7280',
                  icon: 'help-outline',
                };
                return (
                  <View
                    key={type}
                    style={[
                      tw`flex-1 rounded-xl p-3 items-center`,
                      { backgroundColor: config.color + '15' },
                    ]}
                  >
                    <Ionicons
                      name={config.icon as any}
                      size={22}
                      color={config.color}
                    />
                    <Text
                      style={[
                        tw`text-2xl font-bold mt-1`,
                        { color: config.color },
                      ]}
                    >
                      {count}
                    </Text>
                    <Text style={tw`text-xs text-gray-500 mt-0.5`}>
                      {config.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Discard Reasons */}
          <View>
            <Text style={tw.style(bodyMediumBold, 'text-gray-800 mb-2')}>
              Why Items Were Discarded
            </Text>
            {Object.entries(data.byReason).map(([reason, count]) => {
              const config = REASON_CONFIG[reason] || {
                label: reason,
                icon: 'help-outline',
              };
              const percentage = Math.round(
                (count / data.totalDiscarded) * 100,
              );
              return (
                <View
                  key={reason}
                  style={tw`flex-row items-center py-2.5 border-b border-gray-50`}
                >
                  <Ionicons
                    name={config.icon as any}
                    size={18}
                    color="#6B7280"
                  />
                  <Text
                    style={tw.style(
                      bodyMediumRegular,
                      'text-gray-700 flex-1 ml-2',
                    )}
                  >
                    {config.label}
                  </Text>
                  <Text style={tw.style(bodyMediumBold, 'text-gray-800 mr-2')}>
                    {count}
                  </Text>
                  <View style={tw`w-16 h-2 bg-gray-100 rounded-full overflow-hidden`}>
                    <View
                      style={[
                        tw`h-full rounded-full bg-purple-500`,
                        { width: `${percentage}%` },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Top Wasted Items */}
          {data.topWastedItems.length > 0 && (
            <View>
              <Text style={tw.style(bodyMediumBold, 'text-gray-800 mb-2')}>
                Most Wasted Items
              </Text>
              {data.topWastedItems.map((item, index) => (
                <View
                  key={item.name}
                  style={tw`flex-row items-center py-2.5 border-b border-gray-50`}
                >
                  <View style={tw`w-6 h-6 rounded-full bg-gray-100 items-center justify-center mr-2`}>
                    <Text style={tw`text-xs font-bold text-gray-500`}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    style={tw.style(bodyMediumRegular, 'text-gray-700 flex-1')}
                  >
                    {item.name}
                  </Text>
                  <Text style={tw`text-xs text-gray-500`}>
                    {item.count}× discarded
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Monthly Trend */}
          {data.byMonth.length > 0 && (
            <View>
              <Text style={tw.style(bodyMediumBold, 'text-gray-800 mb-2')}>
                Monthly Trend
              </Text>
              {data.byMonth.slice(0, 6).map((m) => (
                <View
                  key={m.month}
                  style={tw`flex-row items-center py-2 border-b border-gray-50`}
                >
                  <Text style={tw.style(bodyMediumRegular, 'text-gray-600 w-20')}>
                    {m.month}
                  </Text>
                  <View style={tw`flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mx-2`}>
                    <View
                      style={[
                        tw`h-full rounded-full bg-red-400`,
                        {
                          width: `${Math.min((m.count / Math.max(...data.byMonth.map((x) => x.count))) * 100, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={tw`text-xs text-gray-500 w-8 text-right`}>
                    {m.count}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
