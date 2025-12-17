import React from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { InitialStackParamList } from '../../navigation/navigator/InitialNavigator';
import { useLinkTo } from '@react-navigation/native';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api';
import DebouncedPressable from '../../../common/components/DebouncePressable';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import tw from '../../../common/tailwind';
import { bodyLargeMedium, bodySmallRegular } from '../../../theme/typography';
import { mixpanelEventName } from '../../analytics/analytics';

import TrackScreenHeader from '../components/TrackScreenHeader';
import TrackTabChart from '../components/TrackTabChart';
import WeeklySurveyCarousel from '../components/WeeklySurveyCarousel';
import FaqContainer from '../components/FaqContainer';
import getWeekNumber from '../helpers/getWeekNumber';
import { TIPSOFTHEWEEK } from '../data/data';
import TipsOfTheWeekCarousel from '../components/TipsOfTheWeekCarousel';


export default function TrackScreen() {
  const linkTo = useLinkTo();
  const navigation = useNavigation<NativeStackNavigationProp<InitialStackParamList>>();
  const { sendAnalyticsEvent, sendScrollEventInitiation } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

//   //const data = [{ id: 1, name: 'About our calculations' }];
//   // TODO: Replace this mock with actual userOnboarding data when available
//   const mockUserOnboarding: { track_survey_day: number } = {
//     track_survey_day: 5, // Example: 5 = Friday
//   };

// // Convert survey day to string if needed by getWeekNumber
// // TODO: Adjust this logic based on how getWeekNumber expects its second argument
//   const surveyDayAsString = String(mockUserOnboarding.track_survey_day);

// // Calculate the current week index safely
//   const currentWeekIndex = getWeekNumber(new Date(), surveyDayAsString) % 7;


  const { data: userOnboarding } = useGetUserOnboardingQuery();
  const data = [{ id: 1, name: 'About our calculations' }];


  return (
    <View style={tw`flex-1 bg-creme`}>
      <Image
        source={require('../../../../assets/ribbons/eggplant-tall.png')}
        resizeMode="cover"
        style={tw.style(
          `absolute top-0 w-[${Dimensions.get('window').width}px] bg-eggplant h-[${(Dimensions.get('screen').width * 318) / 385}px]`,
        )}
      />
      <ScrollView
        scrollEventThrottle={1}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          sendScrollEventInitiation(event, 'Track Page Interacted');
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`z-10 w-full flex-1 pt-[30px]`}>
          <SafeAreaView style={tw`flex-1`}>
            <TrackScreenHeader />
            <View style={tw`z-10 mx-5 -mb-24 mt-2.5`}>
              <TrackTabChart />
            </View>
          </SafeAreaView>
        </View>

        <View style={tw.style('bg-creme pt-20')}>
          <View style={tw.style('pt-15 mb-8')}>
            <WeeklySurveyCarousel />
          </View>

          <View style={tw.style('px-5 pb-8')}>
            {data.map((item, index) => (
              <DebouncedPressable
                onPress={() => {
                  sendAnalyticsEvent({
                    event: mixpanelEventName.actionClicked,
                    properties: {
                      location: newCurrentRoute,
                      action: mixpanelEventName.resultsInfoOpen,
                    },
                  });
                  navigation.navigate('Survey', { screen: 'Results' });
                }}
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
              </DebouncedPressable>
            ))}
          </View>

          <TipsOfTheWeekCarousel
            item={[
              TIPSOFTHEWEEK[
                getWeekNumber(new Date(), userOnboarding?.track_survey_day) % 7
                //currentWeekIndex
              ],
            ]}
          />

          <View style={tw.style('gap-4 px-5 pb-11')}>
            <FaqContainer />
            <View
              style={tw.style(
                'rounded-[10px] border border-strokecream bg-creme p-4',
              )}
            >
              <Pressable
                onPress={() =>
                  WebBrowser.openBrowserAsync(
                    'https://wedocs.unep.org/handle/20.500.11822/45230',
                  )
                }
              >
                <Text style={tw.style(bodySmallRegular, 'underline')}>
                  {`^ United Nations Environment Program’s Food Waste Index Report 2024: Think, Eat, Save. Tracking Food Waste to Halve Global Food waste.`}
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  WebBrowser.openBrowserAsync(
                    'https://www.fial.com.au/sharing-knowledge/food-waste#FSES',
                  )
                }
              >
                <Text style={tw.style(bodySmallRegular, 'underline')}>
                  {`\n* Food Innovation Australia Limited’s `}
                  <Text
                    style={tw.style(bodySmallRegular, 'font-sans-italic')}
                  >
                    {`National Food Waste Strategy Feasibility Study`}
                  </Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}