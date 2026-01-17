import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { Modal, Pressable, Text, View, Image, ScrollView } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { h3TextStyle, h5TextStyle, h6TextStyle, bodySmallRegular, subheadSmallUppercase, bodySmallBold } from '../../../theme/typography';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import { Badge, UserBadge } from '../api/types';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';

interface BadgeInfoModalProps {
  isVisible: boolean;
  badge: Badge;
  userBadge: UserBadge;
  onClose: () => void;
}

export default function BadgeInfoModal({
  isVisible,
  badge,
  userBadge,
  onClose,
}: BadgeInfoModalProps) {
  const getCategoryConfig = () => {
    switch (badge.category) {
      case 'ONBOARDING':
        return {
          gradient: ['#3A7E52', '#2D6142'] as const,
          accentColor: '#3A7E52',
          label: 'Welcome Achievement',
        };
      case 'USAGE':
        return {
          gradient: ['#2196F3', '#1976D2'] as const,
          accentColor: '#2196F3',
          label: 'App Engagement',
        };
      case 'COOKING':
        return {
          gradient: ['#FF9800', '#F57C00'] as const,
          accentColor: '#FF9800',
          label: 'Cooking Milestone',
        };
      case 'MONEY_SAVED':
        return {
          gradient: ['#4CAF50', '#388E3C'] as const,
          accentColor: '#4CAF50',
          label: 'Savings Achievement',
        };
      case 'FOOD_SAVED':
        return {
          gradient: ['#8BC34A', '#689F38'] as const,
          accentColor: '#8BC34A',
          label: 'Waste Reduction',
        };
      case 'PLANNING':
        return {
          gradient: ['#9C27B0', '#7B1FA2'] as const,
          accentColor: '#9C27B0',
          label: 'Planning Master',
        };
      case 'BONUS':
        return {
          gradient: ['#FF5722', '#E64A19'] as const,
          accentColor: '#FF5722',
          label: 'Bonus Achievement',
        };
      case 'SPONSOR':
        return {
          gradient: ['#E91E63', '#C2185B'] as const,
          accentColor: '#E91E63',
          label: 'Partner Reward',
        };
      case 'CHALLENGE_WINNER':
        return {
          gradient: ['#FFC107', '#FFA000'] as const,
          accentColor: '#FFC107',
          label: 'Challenge Winner',
        };
      case 'SPECIAL':
        return {
          gradient: ['#00BCD4', '#0097A7'] as const,
          accentColor: '#00BCD4',
          label: 'Special Recognition',
        };
      default:
        return {
          gradient: ['#4B2176', '#3A1A5C'] as const,
          accentColor: '#4B2176',
          label: 'Achievement Unlocked',
        };
    }
  };

  const categoryConfig = getCategoryConfig();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      statusBarTranslucent
    >
      <View
        style={[
          tw.style('z-10 flex-1 items-center justify-center px-6'),
          { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
        ]}
      >
        <Animatable.View
          animation="zoomIn"
          duration={400}
          useNativeDriver
          style={tw.style('w-full max-w-sm')}
        >
          {/* Gradient Header */}
          <LinearGradient
            colors={categoryConfig.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={tw.style('rounded-t-3xl pt-8 pb-6 px-6 items-center relative overflow-hidden')}
          >
            {/* Decorative Pattern Overlay */}
            <View style={[tw.style('absolute inset-0 opacity-10')]}>
              <View style={[tw.style('absolute top-0 right-0 h-32 w-32 rounded-full'), { backgroundColor: 'white', transform: [{ translateX: 40 }, { translateY: -40 }] }]} />
              <View style={[tw.style('absolute bottom-0 left-0 h-24 w-24 rounded-full'), { backgroundColor: 'white', transform: [{ translateX: -30 }, { translateY: 30 }] }]} />
            </View>

            {/* Close Button */}
            <Pressable
              onPress={onClose}
              style={tw.style('absolute right-4 top-4 z-10 h-9 w-9 items-center justify-center rounded-full bg-white/20')}
            >
              <Feather name="x" size={18} color="white" />
            </Pressable>

            {/* Category Label */}
            <Animatable.View
              animation="fadeInDown"
              delay={100}
              duration={400}
              useNativeDriver
            >
              <View style={tw.style('px-4 py-1.5 bg-white/25 rounded-full mb-4')}>
                <Text style={tw.style(subheadSmallUppercase, 'text-white text-center tracking-wider')}>
                  {categoryConfig.label}
                </Text>
              </View>
            </Animatable.View>

            {/* Title */}
            <Animatable.View
              animation="fadeInDown"
              delay={150}
              duration={400}
              useNativeDriver
            >
              <Text style={tw.style(h5TextStyle, 'text-white text-center mb-1')}>
                Badge Details
              </Text>
            </Animatable.View>
          </LinearGradient>

          {/* White Content Card */}
          <ScrollView style={tw.style('bg-white rounded-b-3xl max-h-120')}>
            <View style={tw.style('px-6 pb-8 pt-6')}>
              {/* Badge Image Container */}
              <View style={tw.style('items-center mb-6')}>
                <View style={tw.style('relative')}>
                  {/* Outer Glow Ring */}
                  <View
                    style={[
                      tw.style('absolute h-44 w-44 rounded-full'),
                      {
                        backgroundColor: categoryConfig.accentColor,
                        opacity: 0.15,
                        transform: [{ scale: 1.1 }],
                      },
                    ]}
                  />
                  {/* Inner Glow Ring */}
                  <View
                    style={[
                      tw.style('absolute h-44 w-44 rounded-full'),
                      {
                        backgroundColor: categoryConfig.accentColor,
                        opacity: 0.25,
                        transform: [{ scale: 1.05 }],
                      },
                    ]}
                  />
                  {/* Badge Container with Shadow */}
                  <View
                    style={[
                      tw.style('h-44 w-44 rounded-full bg-white items-center justify-center'),
                      {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.2,
                        shadowRadius: 16,
                        elevation: 12,
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: badge.imageUrl }}
                      style={tw.style('h-36 w-36')}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>

              {/* Sponsor Logo */}
              {badge.isSponsorBadge && badge.sponsorLogoUrl && (
                <View style={tw.style('items-center mb-4')}>
                  <Text style={tw.style(bodySmallRegular, 'text-stone mb-2')}>Sponsored by</Text>
                  <Image
                    source={{ uri: badge.sponsorLogoUrl }}
                    style={tw`h-10 w-24 rounded`}
                    resizeMode="contain"
                  />
                  {badge.sponsorName && (
                    <Text style={tw.style(bodySmallBold, 'text-black mt-1')}>{badge.sponsorName}</Text>
                  )}
                </View>
              )}

              {/* Badge Name */}
              <View style={tw.style('mb-3')}>
                <Text style={tw.style(h6TextStyle, 'text-center text-black')}>
                  {badge.name}
                </Text>
              </View>

              {/* Badge Description */}
              <View style={tw.style('mb-6')}>
                <Text
                  style={tw.style(bodySmallRegular, 'text-center text-midgray leading-5')}
                  maxFontSizeMultiplier={1}
                >
                  {badge.description}
                </Text>
              </View>

              {/* Badge Stats */}
              <View style={tw.style('mb-6')}>
                {/* Earned Date */}
                <View style={tw.style('flex-row items-center justify-between px-4 py-3 bg-creme-2 rounded-xl mb-3')}>
                  <View style={tw.style('flex-row items-center')}>
                    <Ionicons name="calendar-outline" size={18} color={tw.color('stone')} />
                    <Text style={tw.style(bodySmallRegular, 'ml-2 text-stone')}>Earned</Text>
                  </View>
                  <Text style={tw.style(bodySmallBold, 'text-black')}>
                    {moment(userBadge.earnedAt).format('MMM DD, YYYY')}
                  </Text>
                </View>

                {/* Achievement Value */}
                {userBadge.achievedValue !== undefined && userBadge.achievedValue > 0 && (
                  <View style={tw.style('flex-row items-center justify-between px-4 py-3 bg-mint/20 rounded-xl mb-3')}>
                    <View style={tw.style('flex-row items-center')}>
                      <Ionicons name="trophy-outline" size={18} color={tw.color('kale')} />
                      <Text style={tw.style(bodySmallRegular, 'ml-2 text-kale')}>Achievement</Text>
                    </View>
                    <Text style={tw.style(bodySmallBold, 'text-kale')}>
                      {userBadge.achievedValue}
                    </Text>
                  </View>
                )}

                {/* Rarity Score */}
                {badge.rarityScore > 0 && (
                  <View style={tw.style('flex-row items-center justify-between px-4 py-3 bg-lemon/20 rounded-xl mb-3')}>
                    <View style={tw.style('flex-row items-center')}>
                      <Ionicons name="diamond-outline" size={18} color={tw.color('orange')} />
                      <Text style={tw.style(bodySmallRegular, 'ml-2 text-orange')}>Rarity</Text>
                    </View>
                    <Text style={tw.style(bodySmallBold, 'text-orange')}>
                      {badge.rarityScore}
                    </Text>
                  </View>
                )}

                {/* Challenge Metadata */}
                {userBadge.metadata?.challengeName && (
                  <View style={tw.style('px-4 py-3 bg-eggplant/10 rounded-xl mb-3')}>
                    <View style={tw.style('flex-row items-center mb-2')}>
                      <Ionicons name="flame" size={16} color={tw.color('eggplant-vibrant')} />
                      <Text style={tw.style(bodySmallBold, 'ml-2 text-eggplant')}>
                        {userBadge.metadata.challengeName}
                      </Text>
                    </View>
                    {userBadge.metadata.rank && (
                      <Text style={tw.style(bodySmallRegular, 'text-stone')}>
                        Rank #{userBadge.metadata.rank}
                        {userBadge.metadata.totalParticipants && ` of ${userBadge.metadata.totalParticipants}`}
                      </Text>
                    )}
                  </View>
                )}

                {/* Sponsor Link */}
                {badge.isSponsorBadge && badge.sponsorMetadata?.sponsorLink && (
                  <View style={tw.style('px-4 py-3 bg-pink-50 rounded-xl border border-pink-200')}>
                    <View style={tw.style('flex-row items-center')}>
                      <Ionicons name="link-outline" size={16} color="#E91E63" />
                      <Text style={tw.style(bodySmallRegular, 'ml-2 text-stone')} numberOfLines={1}>
                        {badge.sponsorMetadata.sponsorLink}
                      </Text>
                    </View>
                    {badge.sponsorMetadata.redemptionCode && (
                      <View style={tw.style('mt-3 flex-row items-center')}>
                        <Ionicons name="pricetag-outline" size={16} color="#E91E63" />
                        <Text style={[tw.style(bodySmallBold, 'ml-2'), { color: '#E91E63' }]}>
                          Code: {badge.sponsorMetadata.redemptionCode}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              
            </View>
          </ScrollView>
        </Animatable.View>
      </View>
    </Modal>
  );
}
