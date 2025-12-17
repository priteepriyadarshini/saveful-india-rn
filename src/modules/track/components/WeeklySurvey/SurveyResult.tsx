import { Feather } from '@expo/vector-icons';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import PrimaryButton from '../../../../common/components/ThemeButtons/PrimaryButton';
import SecondaryButton from '../../../../common/components/ThemeButtons/SecondaryButton';
import { filterAllergiesByUserPreferences } from '../../../../common/helpers/filterIngredients';
import useContent from '../../../../common/hooks/useContent';
import tw from '../../../../common/tailwind';
import { IFramework } from '../../../../models/craft';
import { mixpanelEventName } from '../../../../modules/analytics/analytics';
import useAnalytics from '../../../../modules/analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../../../modules/route/context/CurrentRouteContext';
import { useGetUserOnboardingQuery } from '../../../../modules/intro/api/api';
import { useGetUserTrackSurveysQuery } from '../../../../modules/track/api/api';
import MealCarousel from '../../../../modules/track/components/MealCarousel';
import SavingsCarousel from '../../../../modules/track/components/SavingsCarousel';
import TipsOfTheWeekCarousel from '../../../../modules/track/components/TipsOfTheWeekCarousel';
import TrackSurveyBaseline from '../../../../modules/track/components/TrackSurveyBaseline';
import { TIPSOFTHEWEEK } from '../../../../modules/track/data/data';
import getWeekNumber from '../../../../modules/track/helpers/getWeekNumber';
import { WeekResults } from '../../../../modules/track/types';
import { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { cardDrop } from '../../../../theme/shadow';
import {
  bodySmallRegular,
  h5TextStyle,
  h7TextStyle,
  subheadLargeUppercase,
} from '../../../../theme/typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SurveyStackParamList } from '../../navigation/SurveyNavigator';

export default function SurveyResult({
  surveyResult,
  resetForm,
}: {
  surveyResult: WeekResults;
  resetForm: () => void;
}) {
  
  //const linkTo = useLinkTo();
  const navigation = useNavigation<NativeStackNavigationProp<SurveyStackParamList>>();

  const { data: userOnboarding } = useGetUserOnboardingQuery();
  const { data: userTrackSurveys } = useGetUserTrackSurveysQuery();


  // Temporary mock data
  // const userOnboarding = {
  //   allergies: [], // Replace with actual allergies when available
  //   track_survey_day: 1, // Replace with actual survey day
  // };

  // const userTrackSurveys = [
  //   { id: 'mock1' }, // Add more mock surveys if needed
  // ];


  const { getFrameworks } = useContent();
  const [frameworks, setFrameworks] = useState<IFramework[]>([]);

  const getFrameworksData = async () => {
    const data = await getFrameworks();

    if (data) {
      setFrameworks(
        filterAllergiesByUserPreferences(
          data.slice(0, 3),
          userOnboarding?.allergies,
        ),
      );
    }
  };

  useEffect(() => {
    getFrameworksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { sendAnalyticsEvent } = useAnalytics();

  const { newCurrentRoute } = useCurentRoute();

  return (
    <View style={tw.style('w-full items-center')}>
      <Image
        source={require('../../../../../assets/ribbons/eggplant-survey.png')}
        resizeMode="cover"
        style={tw.style(
          `absolute top-0 z-0 w-[${
            Dimensions.get('window').width
          }px] bg-eggplant h-[${
            (Dimensions.get('screen').width * 271) / 374
          }px]`,
        )}
      />
      <View style={tw.style('z-10 justify-between')}>
        <ScrollView
          scrollEventThrottle={16}
          contentContainerStyle={tw.style('pb-15')}
        >
          <Image
            source={require('../../../../../assets/ribbons/stokecream.png')}
            resizeMode="cover"
            style={tw.style(
              `absolute bottom-0 -z-10 w-[${
                Dimensions.get('window').width
              }px] h-[85%] bg-creme`,
            )}
          />
          <View style={tw.style('z-10 w-full items-end px-3 pt-4')}>
            <Pressable
              onPress={() => {
                const props = {
                  location: newCurrentRoute,
                  action: mixpanelEventName.weeklySurveyExit,
                };
                sendAnalyticsEvent({
                  event: mixpanelEventName.weeklySurveyScreenView,
                  properties: props,
                });
                sendAnalyticsEvent({
                  event: mixpanelEventName.actionClicked,
                  properties: props,
                });
                resetForm();
              }}
            >
              <Feather name={'x'} size={20} color="white" />
            </Pressable>
          </View>
          <View style={tw.style('z-10')}>
            {userTrackSurveys && userTrackSurveys.length <= 1 ? (
              <View style={tw.style('items-center pt-8')}>
                <Text
                  style={tw.style(
                    h5TextStyle,
                    'px-10 pb-1.5 text-center text-white',
                  )}
                >
                  Your baseline
                </Text>
                <TrackSurveyBaseline
                  spent={surveyResult.spent}
                  waste={surveyResult.waste}
                />

                {/* What this means */}
                <Text
                  style={tw.style(
                    h7TextStyle,
                    'px-10 pb-2 pt-6 text-center text-black',
                  )}
                >
                  What this means
                </Text>
                <View
                  style={[
                    tw.style(
                      `relative items-center rounded-2lg border border-eggplant-vibrant bg-white px-7 py-5 w-[${
                        Dimensions.get('window').width - 80
                      }px]`,
                    ),
                    cardDrop,
                  ]}
                >
                  <Text style={tw.style(bodySmallRegular, 'text-center')}>
                    Your baseline helps us measure your first week of savings.
                  </Text>
                  <Text style={tw.style(bodySmallRegular, 'mt-2 text-center')}>
                    Once you start completing your weekly Track survey, you’ll
                    see your results as a week-on-week comparison.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={tw.style('items-center pt-8')}>
                <Text
                  style={tw.style(
                    h5TextStyle,
                    'px-10 pb-1.5 text-center text-white',
                  )}
                >
                  This week’s results
                </Text>
                <SavingsCarousel items={surveyResult.currentWeekResults} />
              </View>
            )}
            <View style={tw`pt-6`}>
              <TipsOfTheWeekCarousel
                theme="dark"
                item={[
                  TIPSOFTHEWEEK[
                    getWeekNumber(
                      new Date(),
                      userOnboarding?.track_survey_day,
                      //String(userOnboarding.track_survey_day)
                    ) % 7
                  ],
                ]}
                containerStyle={tw.style('mx-10')}
                carouselStyle={tw.style('pl-10 pr-8')}
                customItemLength={Dimensions.get('window').width - 80}
              />
            </View>

            {frameworks && frameworks.length > 0 && (
              <View style={tw.style('px-10 pt-6')}>
                <Text
                  style={tw.style(
                    subheadLargeUppercase,
                    'pb-2 text-center text-black',
                  )}
                >
                  Recommended meals
                </Text>
                <MealCarousel
                  items={frameworks}
                  itemLength={Dimensions.get('window').width - 80}
                  contentContainerStyle={tw`px-0`}
                />
              </View>
            )}
          </View>
          <View style={tw`z-10 w-full gap-2 px-10 py-5`}>
            {/* <PrimaryButton
            style={tw.style('mb-2 border-white bg-transparent text-white')}
            onPress={() => {}}
          >
            Share
          </PrimaryButton> */}
            <SecondaryButton
              onPress={() => {
                navigation.navigate('Results');
              }}
            >
              About our calculations
            </SecondaryButton>
            <PrimaryButton style={tw.style('mb-2')} onPress={resetForm}>
              Close
            </PrimaryButton>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
