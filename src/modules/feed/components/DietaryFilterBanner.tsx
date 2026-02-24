import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useNavigation } from '@react-navigation/native';

import tw from '../../../common/tailwind';
import { useGetCurrentUserQuery } from '../../auth/api';
import { useGetUserOnboardingQuery } from '../../intro/api/api';
import { useGetTrendingRecipesQuery } from '../../analytics/api/api';
import { subheadMediumUppercase, subheadSmallUppercase, bodySmallRegular } from '../../../theme/typography';
import { FeedStackScreenProps } from '../navigation/FeedNavigation';


interface DietaryTag {
  key: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

function makeTag(key: string, label: string, iconName: string, lib: 'ion' | 'mci' = 'ion'): DietaryTag {
  const stone = '#9E9E9E';
  const white = '#FFFFFF';
  return {
    key,
    label,
    icon:       lib === 'mci'
      ? <MaterialCommunityIcons name={iconName as any} size={12} color={stone} />
      : <Ionicons name={iconName as any} size={12} color={stone} />,
    activeIcon: lib === 'mci'
      ? <MaterialCommunityIcons name={iconName as any} size={12} color={white} />
      : <Ionicons name={iconName as any} size={12} color={white} />,
  };
}

const DIETARY_TAGS: DietaryTag[] = [
  makeTag('vegan',       'Vegan',             'leaf-outline'),
  makeTag('vegetarian',  'Vegetarian',        'leaf'),
  makeTag('dairyFree',   'Dairy-Free',        'water-outline'),
  makeTag('glutenFree',  'Gluten-Free',       'wheat-off',    'mci'),
  makeTag('nutFree',     'Nut-Free',          'peanut-off',   'mci'),
  makeTag('diabetes',    'Diabetic-Friendly', 'pulse-outline'),
];


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
    if (vType === 'VEGAN')            keys.push('vegan');
    else if (vType === 'VEGETARIAN')  keys.push('vegetarian');
    if (currentUser.dairyFree  ?? currentUser.dietary_profile?.dairy_free)  keys.push('dairyFree');
    if (currentUser.glutenFree ?? currentUser.dietary_profile?.gluten_free) keys.push('glutenFree');
    if (currentUser.nutFree    ?? currentUser.dietary_profile?.nut_free)    keys.push('nutFree');
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
    : profileOrSelectedTags.length > 0 ? profileOrSelectedTags : DIETARY_TAGS;

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
    <View style={tw`mx-4 mt-4 mb-1 rounded-2xl bg-white shadow-sm border border-strokecream overflow-hidden`}>

      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-4 pt-4 pb-2`}>
        <View style={tw`flex-row items-center gap-2`}>
          <Ionicons name="options-outline" size={16} color={tw.color('eggplant')} />
          <Text style={tw.style(subheadMediumUppercase, 'text-eggplant')}>
            Dietary Filters
          </Text>
        </View>
        <Pressable onPress={() => setShowAll(v => !v)} style={tw`flex-row items-center gap-1`} hitSlop={8}>
          <Text style={tw.style(subheadSmallUppercase, 'text-stone')}>
            {showAll ? 'Less' : 'All filters'}
          </Text>
          <Ionicons name={showAll ? 'chevron-up' : 'chevron-down'} size={12} color={tw.color('stone')} />
        </Pressable>
      </View>

      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`px-4 pb-3 gap-2`}>
        {tagsToRender.map(tag => {
          const isActive = selectedKeys.includes(tag.key);
          const isFromProfile = activeDietaryKeys.includes(tag.key);
          return (
            <Pressable
              key={tag.key}
              onPress={() => toggleKey(tag.key)}
              style={tw.style(
                'flex-row items-center gap-1.5 rounded-full border px-3 py-1.5',
                isActive ? 'bg-eggplant border-eggplant' : 'bg-white border-strokecream',
              )}
            >
              {isActive ? tag.activeIcon : tag.icon}
              <Text style={tw.style(subheadSmallUppercase, isActive ? 'text-white' : 'text-stone')}>
                {tag.label}
              </Text>
              {isFromProfile && !isActive && (
                <View style={tw`w-1.5 h-1.5 rounded-full bg-eggplant`} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* CTA strip */}
      <Pressable
        onPress={onExplorePress}
        style={tw`flex-row items-center justify-between bg-eggplant px-4 py-3`}
      >
        <View style={tw`flex-1`}>
          <Text style={tw.style(subheadSmallUppercase, 'text-white/70 mb-0.5')}>FOR YOU</Text>
          <Text style={tw.style(bodySmallRegular, 'text-white')} numberOfLines={1}>{ctaText}</Text>
        </View>
        <View style={tw`flex-row items-center gap-2`}>
          {selectedKeys.length > 0 && (
            <View style={tw`bg-white/20 rounded-full px-2 py-0.5`}>
              <Text style={tw.style(subheadSmallUppercase, 'text-white')}>
                {selectedKeys.length} active
              </Text>
            </View>
          )}
          <Ionicons name="arrow-forward" size={16} color="white" />
        </View>
      </Pressable>

    </View>
  );
}
