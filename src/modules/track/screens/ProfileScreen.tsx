import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import tw from '../../../common/tailwind';
import { useGetCookedRecipesDetailsQuery } from '../../../modules/analytics/api/api';
import { mixpanelEventName } from '../../analytics/analytics';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import { ProfileInfo } from '../components/ProfileInfo';
import MealCarousel from '../components/MealCarousel';
import AnimatedSettingsHeader from '../components/AnimatedSettingsHeader';
import { subheadLargeUppercase, bodyLargeMedium } from '../../../theme/typography';
import { TrackStackScreenProps } from '../navigation/TrackNavigation';

const data = [
  { id: 1, name: 'Cooked' },
  { id: 2, name: 'Saved' },
  { id: 3, name: 'Hacks' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<TrackStackScreenProps<'TrackHome'>['navigation']>();

  const offset = useRef(new Animated.Value(0)).current;

  const onNavigate = React.useCallback(
    (id: string) => {
      sendAnalyticsEvent({
        event: mixpanelEventName.actionClicked,
        properties: {
          location: newCurrentRoute,
          action: mixpanelEventName.profileHistoryOpened,
          type: id,
        },
      });
      navigation.navigate('ProfileHistory', { id });
    },
    [navigation],
  );

  const { data: cookedRecipesDetails } = useGetCookedRecipesDetailsQuery();
  const recentCooked = cookedRecipesDetails?.cookedRecipes || [];

  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const recentlyCooked = recentCooked.map(rc => ({
    id: rc.id,
    title: rc.title,
    heroImage: [{ url: rc.heroImageUrl || '' }],
    variantTags: [],
  })) as any;


  return (
    <View style={tw`flex-1 bg-creme`}>
      <AnimatedSettingsHeader title="Profile" animatedValue={offset} />
      <Image
        resizeMode="cover"
        style={tw.style(
          `absolute top-0 w-[${Dimensions.get('window').width}px] bg-eggplant h-[${(Dimensions.get('screen').width * 271) / 374}px]`,
        )}
        source={require('../../../../assets/ribbons/eggplant-tall.png')}
      />
      <ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: offset } } }],
          { useNativeDriver: false },
        )}
      >
        <SafeAreaView>
          <View style={tw.style(`mt-15 mb-5 px-5`)}>
            <ProfileInfo />
          </View>
        </SafeAreaView>

        <View style={tw.style('flex-1 bg-creme')}>
          <View style={tw.style(`items-start pt-6 pb-8 bg-creme`)}>
            <Text
              style={tw.style(
                subheadLargeUppercase,
                'pb-3 px-5 text-left text-midgray',
              )}
            >
              Recently cooked
            </Text>
            {recentlyCooked.length > 0 ? (
              <MealCarousel
                type="profile"
                items={recentlyCooked}
                contentContainerStyle={tw`pl-5 pr-3`}
              />
            ) : (
              <View style={tw`px-5 py-1 items-center bg-creme`}> 
                <Text style={[tw`text-base text-center`, { fontFamily: 'Apercu', color: tw.color('midgray') }]}>
                  No recent recipe cooked
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={tw.style('px-5 pt-4')}>
          {data.map((item, index) => (
            <Pressable
              onPress={() => onNavigate(item.name)}
              key={item.id}
              style={tw.style(
                index === 0 ? 'border-t' : '',
                'flex-row justify-between border-b border-strokecream py-4',
              )}
            >
              <Text style={tw.style(bodyLargeMedium, 'text-midgray')}>
                {item.name}
              </Text>
              <Feather
                name="arrow-right"
                size={24}
                color={tw.color('midgray')}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}

