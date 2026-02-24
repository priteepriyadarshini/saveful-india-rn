import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { h5TextStyle, subheadSmallUppercase } from '../../../theme/typography';
import LeaderboardTab from '../components/LeaderboardTab';
import AllBadgesTab from '../components/AllBadgesTab';
import ChallengeBadgesTab from '../components/ChallengeBadgesTab';
import { useBadgeChecker } from '../hooks/useBadgeChecker';

const screenWidth = Dimensions.get('window').width;
const heroImageHeight = (Dimensions.get('screen').width * 400) / 374;

type TabType = 'leaderboard' | 'allBadges' | 'challengeBadges';

export default function LeaderboardScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');
  const { checkMilestonesNow, isCheckingMilestones } = useBadgeChecker();

  const tabs = [
    { key: 'leaderboard' as TabType, label: 'Leaderboard', icon: 'trophy' },
    { key: 'allBadges' as TabType, label: 'My Badges', icon: 'medal' },
    { key: 'challengeBadges' as TabType, label: 'Challenges', icon: 'ribbon' },
  ];

  const handleCheckBadges = async () => {
    await checkMilestonesNow();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leaderboard':
        return <LeaderboardTab />;
      case 'allBadges':
        return <AllBadgesTab />;
      case 'challengeBadges':
        return <ChallengeBadgesTab />;
      default:
        return <LeaderboardTab />;
    }
  };

  return (
    <View style={tw`relative flex-1 bg-creme`}>
      <View
        style={tw.style(
          `absolute top-0 w-[${screenWidth}px] h-[${heroImageHeight}px]`,
        )}
      >
        <Image
          resizeMode="cover"
          style={tw.style(`h-full w-full bg-eggplant`)}
          source={require('../../../../assets/ribbons/eggplant-tall.png')}
        />
      </View>
      <View style={tw`flex-1`}>
        <LinearGradient
          colors={[tw.color('eggplant') || '#4B2176', tw.color('eggplant') || '#4B2176']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']}>
            <View style={tw`flex-row items-center justify-between px-5 py-4`}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={tw`h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15`}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={22} color="white" />
              </Pressable>
              <Text style={tw.style(h5TextStyle, 'flex-1 text-center text-white')}>
                Achievements
              </Text>
              <Pressable
                onPress={handleCheckBadges}
                disabled={isCheckingMilestones}
                style={tw`h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15`}
                accessibilityRole="button"
                accessibilityLabel="Check for new badges"
              >
                {isCheckingMilestones ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="refresh" size={22} color="white" />
                )}
              </Pressable>
            </View>

            <View style={tw`px-4 pb-3 pt-0.5`}>
              <View
                style={tw.style('overflow-hidden rounded-2xl border border-white/20 p-1', {
                  backgroundColor: 'rgba(255, 252, 249, 0.14)',
                })}
              >
                <View style={tw`flex-row`}>
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setActiveTab(tab.key)}
                      style={tw.style(
                        'flex-1 items-center rounded-xl py-3',
                        tab.key !== 'challengeBadges' ? 'mr-1.5' : '',
                        isActive ? 'bg-white' : 'bg-transparent'
                      )}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: isActive }}
                    >
                      <Ionicons
                        name={tab.icon as any}
                        size={22}
                        color={isActive ? tw.color('eggplant') || '#4B2176' : 'white'}
                      />
                      <Text
                        style={tw.style(
                          subheadSmallUppercase,
                          'mt-1',
                          isActive ? 'text-eggplant' : 'text-white'
                        )}
                        numberOfLines={1}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Tab Content */}
        {renderTabContent()}
      </View>
    </View>
  );
}
