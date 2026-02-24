import React from 'react';
import { Modal, Pressable, ScrollView, Text, View, Image, ImageBackground } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import tw from '../../../common/tailwind';
import {
  bodySmallBold,
  bodySmallRegular,
  h5TextStyle,
  h6TextStyle,
  subheadSmallUppercase,
} from '../../../theme/typography';
import { cardDrop } from '../../../theme/shadow';
import { Badge, UserBadge } from '../api/types';
import moment from 'moment';

interface BadgeInfoModalProps {
  isVisible: boolean;
  badge: Badge;
  userBadge: UserBadge;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  ONBOARDING: 'Welcome Achievement',
  USAGE: 'App Engagement',
  COOKING: 'Cooking Milestone',
  MONEY_SAVED: 'Savings Achievement',
  FOOD_SAVED: 'Waste Reduction',
  PLANNING: 'Planning Master',
  BONUS: 'Bonus Achievement',
  SPONSOR: 'Partner Reward',
  CHALLENGE_WINNER: 'Challenge Winner',
  SPECIAL: 'Special Recognition',
};

export default function BadgeInfoModal({
  isVisible,
  badge,
  userBadge,
  onClose,
}: BadgeInfoModalProps) {
  const categoryLabel = CATEGORY_LABELS[badge.category] || 'Achievement Unlocked';

  return (
    <Modal animationType="fade" transparent visible={isVisible} statusBarTranslucent>
      <View
        style={[
          tw.style('z-10 flex-1 items-center justify-center px-5'),
          { backgroundColor: 'rgba(0,0,0,0.78)' },
        ]}
      >
        <Animatable.View
          animation="fadeInUp"
          duration={280}
          useNativeDriver
          style={tw.style('w-full max-w-sm overflow-hidden rounded-2xl border border-strokecream bg-white', cardDrop)}
        >
          <ImageBackground
            source={require('../../../../assets/ribbons/ingredients-ribbons/eggplant-light2.png')}
            resizeMode="cover"
            imageStyle={{ opacity: 0.14 }}
          >
            <View style={tw`flex-row items-center justify-between border-b border-strokecream px-4 py-3`}>
              <View style={tw`flex-1 pr-3`}>
                <Text style={tw.style(subheadSmallUppercase, 'text-eggplant')}>{categoryLabel}</Text>
                <Text style={tw.style(h5TextStyle, 'mt-1 text-black')}>Badge Details</Text>
              </View>
              <Pressable
                onPress={onClose}
                style={tw`h-9 w-9 items-center justify-center rounded-full border border-strokecream bg-white`}
                accessibilityRole="button"
                accessibilityLabel="Close badge details"
              >
                <Feather name="x" size={18} color={tw.color('stone') || '#6D6D72'} />
              </Pressable>
            </View>
          </ImageBackground>

          <ScrollView style={tw`max-h-120`} contentContainerStyle={tw`px-4 pb-5 pt-4`}>
            <View style={tw`items-center`}>
              <View style={tw`mb-3 h-36 w-36 items-center justify-center rounded-2xl border border-strokecream bg-creme`}>
                {badge.imageUrl ? (
                  <Image source={{ uri: badge.imageUrl }} style={tw`h-28 w-28`} resizeMode="contain" />
                ) : (
                  <Ionicons name="ribbon-outline" size={54} color={tw.color('eggplant') || '#4B2176'} />
                )}
              </View>

              {badge.isSponsorBadge && badge.sponsorLogoUrl && (
                <View style={tw`mb-3 items-center`}>
                  <Text style={tw.style(bodySmallRegular, 'mb-1 text-stone')}>Sponsored by</Text>
                  <Image source={{ uri: badge.sponsorLogoUrl }} style={tw`h-10 w-24 rounded`} resizeMode="contain" />
                  {badge.sponsorName ? (
                    <Text style={tw.style(bodySmallBold, 'mt-1 text-black')}>{badge.sponsorName}</Text>
                  ) : null}
                </View>
              )}

              <Text style={tw.style(h6TextStyle, 'text-center text-black')}>{badge.name}</Text>
              <Text style={tw.style(bodySmallRegular, 'mt-2 text-center text-stone')}>
                {badge.description}
              </Text>
            </View>

            <View style={tw`mt-4 gap-2.5`}>
              <View style={tw`flex-row items-center justify-between rounded-xl border border-strokecream bg-creme px-3 py-2.5`}>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="calendar-outline" size={16} color={tw.color('stone') || '#6D6D72'} />
                  <Text style={tw.style(bodySmallRegular, 'ml-2 text-stone')}>Earned</Text>
                </View>
                <Text style={tw.style(bodySmallBold, 'text-black')}>
                  {moment(userBadge.earnedAt).format('MMM DD, YYYY')}
                </Text>
              </View>

              {userBadge.achievedValue !== undefined && userBadge.achievedValue > 0 && (
                <View style={tw`flex-row items-center justify-between rounded-xl border border-mint bg-mint/20 px-3 py-2.5`}>
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="trophy-outline" size={16} color={tw.color('kale') || '#3A7E52'} />
                    <Text style={tw.style(bodySmallRegular, 'ml-2 text-kale')}>Achievement</Text>
                  </View>
                  <Text style={tw.style(bodySmallBold, 'text-kale')}>{userBadge.achievedValue}</Text>
                </View>
              )}

              {badge.rarityScore > 0 && (
                <View style={tw`flex-row items-center justify-between rounded-xl border border-lemon bg-lemon/25 px-3 py-2.5`}>
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="diamond-outline" size={16} color={tw.color('orange') || '#F99C46'} />
                    <Text style={tw.style(bodySmallRegular, 'ml-2 text-orange')}>Rarity</Text>
                  </View>
                  <Text style={tw.style(bodySmallBold, 'text-orange')}>{badge.rarityScore}</Text>
                </View>
              )}

              {userBadge.metadata?.challengeName && (
                <View style={tw`rounded-xl border border-strokecream bg-white px-3 py-2.5`}>
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="flame" size={15} color={tw.color('eggplant-vibrant') || '#7E42FF'} />
                    <Text style={tw.style(bodySmallBold, 'ml-2 text-eggplant')}>
                      {userBadge.metadata.challengeName}
                    </Text>
                  </View>
                  {userBadge.metadata.rank ? (
                    <Text style={tw.style(bodySmallRegular, 'mt-1 text-stone')}>
                      Rank #{userBadge.metadata.rank}
                      {userBadge.metadata.totalParticipants
                        ? ` of ${userBadge.metadata.totalParticipants}`
                        : ''}
                    </Text>
                  ) : null}
                </View>
              )}

              {badge.isSponsorBadge && badge.sponsorMetadata?.sponsorLink && (
                <View style={tw`rounded-xl border border-radish bg-radish/20 px-3 py-2.5`}>
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="link-outline" size={15} color={tw.color('eggplant') || '#4B2176'} />
                    <Text style={tw.style(bodySmallRegular, 'ml-2 flex-1 text-stone')} numberOfLines={1}>
                      {badge.sponsorMetadata.sponsorLink}
                    </Text>
                  </View>
                  {badge.sponsorMetadata.redemptionCode ? (
                    <Text style={tw.style(bodySmallBold, 'mt-2 text-eggplant')}>
                      Code: {badge.sponsorMetadata.redemptionCode}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          </ScrollView>
        </Animatable.View>
      </View>
    </Modal>
  );
}
