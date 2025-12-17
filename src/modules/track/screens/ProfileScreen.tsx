import { Feather } from '@expo/vector-icons';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import React, { useEffect, useRef, useState } from 'react';
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
import { filterAllergiesByUserPreferences } from '../../../common/helpers/filterIngredients';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api';
import { useGetUserMealsQuery } from '../../../modules/track/api/api';
import { IFramework } from '../../../models/craft';
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
  //const linkTo = useLinkTo();
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
      //linkTo(`/track/history/${id}`);
      navigation.navigate('ProfileHistory', { id });
    },
    [navigation],
  );

  const { data: userMeals } = useGetUserMealsQuery();

  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const { getFrameworks } = useContent();
  const { data: userOnboarding } = useGetUserOnboardingQuery();
  const [frameworks, setFrameworks] = useState<IFramework[]>([]);

  const getFrameworksData = async () => {
    const data = await getFrameworks();

    if (data) {
      // TODO: Use allergy filtering when userOnboarding is available
      setFrameworks(
        filterAllergiesByUserPreferences(data, userOnboarding?.allergies)
      );
      // setFrameworks(data); // Using raw data for now
    }
  };

  useEffect(() => {
    getFrameworksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  if (frameworks.length === 0) {
    return null;
  }

  // TODO: Uncomment when userMeals is available
  const recentlyCooked = frameworks.filter(
    framework =>
      userMeals?.slice(0, 3).some(meal => `${meal.framework_id}` === framework.id),
  );

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

        {/* TODO: Uncomment when recentlyCooked is available */}
        {recentlyCooked && recentlyCooked.length > 0 && (
          <View style={tw.style('flex-1 bg-creme')}>
            <View style={tw.style(`items-start pt-8`)}>
              <Text
                style={tw.style(
                  subheadLargeUppercase,
                  'pb-4.5 px-5 text-left text-midgray',
                )}
              >
                Recently cooked
              </Text>
              <MealCarousel
                type="profile"
                items={recentlyCooked}
                contentContainerStyle={tw`pl-5 pr-3`}
              />
            </View>
          </View>
        )}

        <View style={tw.style('px-5 pt-9')}>
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

