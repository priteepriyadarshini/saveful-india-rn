import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useNavigation } from '@react-navigation/native';

import tw from '../../../common/tailwind';
import { cardDrop } from '../../../theme/shadow';
import { useGetCurrentUserQuery } from '../../auth/api';
import { useGetUserOnboardingQuery } from '../../intro/api/api';
import { useGetTrendingRecipesQuery } from '../../analytics/api/api';
import {
  bodySmallRegular,
  subheadMediumUppercase,
  subheadSmallUppercase,
} from '../../../theme/typography';
import { FeedStackScreenProps } from '../navigation/FeedNavigation';

interface DietaryTag {
  key: string;
  label: string;
  iconName: string;
  lib?: 'ion' | 'mci';
}

const DIETARY_TAGS: DietaryTag[] = [
  { key: 'vegan', label: 'Vegan', iconName: 'leaf-outline', lib: 'ion' },
  { key: 'vegetarian', label: 'Vegetarian', iconName: 'leaf', lib: 'ion' },
  { key: 'dairyFree', label: 'Dairy-Free', iconName: 'water-outline', lib: 'ion' },
  { key: 'glutenFree', label: 'Gluten-Free', iconName: 'wheat-off', lib: 'mci' },
  { key: 'nutFree', label: 'Nut-Free', iconName: 'peanut-off', lib: 'mci' },
  { key: 'diabetes', label: 'Diabetic-Friendly', iconName: 'pulse-outline', lib: 'ion' },
];

const eggplantColor = tw.color('eggplant') ?? '#4B2176';
const stoneColor = tw.color('stone') ?? '#6D6D72';
const whiteColor = tw.color('white') ?? '#FFFCF9';

function TagIcon({
  iconName,
  lib = 'ion',
  color,
}: {
  iconName: string;
  lib?: 'ion' | 'mci';
  color: string;
}) {
  if (lib === 'mci') {
    return <MaterialCommunityIcons name={iconName as any} size={12} color={color} />;
  }

  return <Ionicons name={iconName as any} size={12} color={color} />;
}

export default function DietaryFilterBanner() {
  const { data: currentUser, isLoading: isUserLoading } = useGetCurrentUserQuery();
  const { data: userOnboarding } = useGetUserOnboardingQuery();

  const userCountry = currentUser?.country || userOnboarding?.suburb;

  const { data: trendingData } = useGetTrendingRecipesQuery(
    !isUserLoading ? userCountry : skipToken,
  );
  const trendingCount = trendingData?.trending?.length ?? 0;

  type FeedNav = FeedStackScreenProps<'FeedHome'>['navigation'];
  const navigation = useNavigation<FeedNav>();

  const activeDietaryKeys = useMemo(() => {
    const keys: string[] = [];
    if (!currentUser) return keys;

    const vType = currentUser.vegType ?? currentUser.dietary_profile?.veg_type;
    if (vType === 'VEGAN') keys.push('vegan');
    else if (vType === 'VEGETARIAN') keys.push('vegetarian');

    if (currentUser.dairyFree ?? currentUser.dietary_profile?.dairy_free) keys.push('dairyFree');
    if (currentUser.glutenFree ?? currentUser.dietary_profile?.gluten_free) keys.push('glutenFree');
    if (currentUser.nutFree ?? currentUser.dietary_profile?.nut_free) keys.push('nutFree');
    if (currentUser.hasDiabetes ?? currentUser.dietary_profile?.has_diabetes) keys.push('diabetes');

    return keys;
  }, [currentUser]);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const synced = React.useRef(false);
  React.useEffect(() => {
    if (!synced.current && activeDietaryKeys.length > 0) {
      setSelectedKeys(activeDietaryKeys);
      synced.current = true;
    }
  }, [activeDietaryKeys]);

  const toggleKey = (key: string) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );
  };

  const profileOrSelectedTags = DIETARY_TAGS.filter(
    t => activeDietaryKeys.includes(t.key) || selectedKeys.includes(t.key),
  );

  const tagsToRender = showAll
    ? DIETARY_TAGS
    : profileOrSelectedTags.length > 0
      ? profileOrSelectedTags
      : DIETARY_TAGS;

  const onExplorePress = () => {
    navigation.navigate('DietaryRecipes', {
      filters: selectedKeys,
      title: selectedKeys.length > 0 ? 'For You' : 'All Recipes',
    });
  };

  if (isUserLoading) return null;

  const ctaText = selectedKeys.length > 0
    ? 'View personalised recipes'
    : trendingCount > 0
      ? `Browse ${trendingCount} trending recipes`
      : 'Browse all recipes';

  return (
    <View style={tw`mx-4 mt-4 mb-8 relative`}>
      <Image
        source={require('../../../../assets/ribbons/ingredients-ribbons/eggplant-light2.png')}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        style={[
          tw`absolute bottom-0 right-0 h-[110px] w-[110px]`,
          { opacity: 0.35 },
        ]}
      />

      <View
        style={[
          tw`overflow-hidden rounded-2lg border border-strokecream bg-white`,
          cardDrop,
        ]}
      >
        <View style={tw`px-4 pt-4 pb-2`}>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center gap-2`}>
              <Ionicons name="leaf-outline" size={16} color={eggplantColor} />
              <Text style={tw.style(subheadMediumUppercase, 'text-eggplant')}>
                Dietary filters
              </Text>
            </View>

            <Pressable
              onPress={() => setShowAll(v => !v)}
              style={tw`flex-row items-center gap-1`}
              hitSlop={8}
            >
              <Text style={tw.style(subheadSmallUppercase, 'text-stone')}>
                {showAll ? 'Less' : 'All filters'}
              </Text>
              <Ionicons
                name={showAll ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={stoneColor}
              />
            </Pressable>
          </View>

          <Text style={tw.style(bodySmallRegular, 'mt-1 text-midgray')}>
            Pick your preferences for meals that fit your lifestyle.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-4 pb-3 gap-2`}
        >
          {tagsToRender.map(tag => {
            const isActive = selectedKeys.includes(tag.key);
            const isFromProfile = activeDietaryKeys.includes(tag.key);

            return (
              <Pressable
                key={tag.key}
                onPress={() => toggleKey(tag.key)}
                style={tw.style(
                  'flex-row items-center gap-1.5 rounded-full border px-3 py-1.5',
                  isActive
                    ? 'border-eggplant bg-eggplant'
                    : 'border-strokecream bg-creme',
                )}
              >
                <TagIcon
                  iconName={tag.iconName}
                  lib={tag.lib}
                  color={isActive ? whiteColor : stoneColor}
                />

                <Text
                  style={tw.style(
                    subheadSmallUppercase,
                    isActive ? 'text-white' : 'text-midgray',
                  )}
                >
                  {tag.label}
                </Text>

                {isFromProfile && !isActive && (
                  <View style={tw`h-1.5 w-1.5 rounded-full bg-lemon`} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          onPress={onExplorePress}
          style={tw`flex-row items-center justify-between border-t border-strokecream bg-eggplant px-4 py-3`}
        >
          <View style={tw`flex-1`}> 
            <Text style={tw.style(subheadSmallUppercase, 'mb-0.5 text-creme')}>
              FOR YOU
            </Text>
            <Text style={tw.style(bodySmallRegular, 'text-white')} numberOfLines={1}>
              {ctaText}
            </Text>
          </View>

          <View style={tw`flex-row items-center gap-2`}>
            {selectedKeys.length > 0 && (
              <View style={tw`rounded-full bg-white/20 px-2 py-0.5`}>
                <Text style={tw.style(subheadSmallUppercase, 'text-white')}>
                  {selectedKeys.length} active
                </Text>
              </View>
            )}
            <Ionicons name="arrow-forward" size={16} color={whiteColor} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
