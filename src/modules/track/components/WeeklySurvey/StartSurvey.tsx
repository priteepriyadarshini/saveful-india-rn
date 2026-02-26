import PrimaryButton from '../../../../common/components/ThemeButtons/PrimaryButton';
import SecondaryButton from '../../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../../common/tailwind';
import { mixpanelEventName } from '../../../../modules/analytics/analytics';
import useAnalytics from '../../../../modules/analytics/hooks/useAnalytics';
import { TrackSurveyEligibility } from '../../api/types';
import { useGetFFNQuery } from '../../../qantas/api/api';
import { useCurentRoute } from '../../../../modules/route/context/CurrentRouteContext';
import TrackContent from '../../../../modules/track/components/TrackContent';
import TrackLinearGradient from '../../../../modules/track/components/TrackLinearGradient';
import { Dimensions, Image, Text, View, ActivityIndicator } from 'react-native';
import * as Progress from 'react-native-progress';
import moment from 'moment';
import {
  bodyMediumRegular,
  bodySmallRegular,
  h5TextStyle,
} from '../../../../theme/typography';

export default function StartSurvey({
  setIsStartSurvey,
  eligibilityData,
  isCheckingEligibility,
}: {
  setIsStartSurvey: (value: boolean) => void;
  eligibilityData?: TrackSurveyEligibility;
  isCheckingEligibility?: boolean;
}) {
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const { data: qantasFFN } = useGetFFNQuery();
  // surveys_count from eligibility data; if Qantas is linked, use the cycle count from qantasFFN
  const surveysCount = qantasFFN
    ? qantasFFN.surveysCompletedInCycle
    : (eligibilityData?.surveys_count || 0);

  const isEligible = eligibilityData?.eligible ?? true;
  const nextSurveyDate = eligibilityData?.next_survey_date;


  return (
    <View style={tw.style('w-full items-center')}>
      <View>
        <TrackContent hideGradient>
          <View>
            <Image
              style={tw`mx-auto h-[289px] w-[234px] max-w-full`}
              resizeMode="contain"
              source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/placeholder/bowl.png' }}
              accessibilityIgnoresInvertColors
            />
            <Text
              style={tw.style(
                h5TextStyle,
                'max-w-60 mx-auto pb-2.5 pt-7 text-center text-white',
              )}
              maxFontSizeMultiplier={1}
            >
              How Saveful have you been?
            </Text>
            <Text
              style={tw.style(
                bodyMediumRegular,
                'max-w-60 mx-auto pb-2 text-center text-white',
              )}
            >
              {isEligible 
                ? `Let's estimate by starting with the food you cooked (or cooked with) this week.`
                : `You've already completed this week's survey!`
              }
            </Text>

            {/* Show "already completed" message if not eligible */}
            {!isEligible && nextSurveyDate && (
              <View style={tw`mt-4 rounded-md bg-creme p-6`}>
                <Text style={tw.style(bodyMediumRegular, 'text-center')}>
                  Your next survey will be available on{' '}
                  <Text style={tw`font-bold`}>
                    {moment(nextSurveyDate).format('MMMM Do, YYYY')}
                  </Text>
                </Text>
              </View>
            )}

            {/* Show Qantas progress only if eligible and linked, count < 4 */}
            {isEligible && qantasFFN && surveysCount < 4 && (
              <View style={tw`mt-2 gap-4 rounded-md bg-creme p-6`}>
                <View style={tw`py-2`}>
                  <Progress.Bar
                    progress={
                      (!surveysCount || surveysCount === 0
                        ? 0.15
                        : surveysCount) / 4
                    }
                    color={tw.color('kale')}
                    indeterminateAnimationDuration={100}
                    unfilledColor={tw.color('strokecream')}
                    animated
                    borderWidth={0}
                    height={8}
                    useNativeDriver={true}
                    borderRadius={9999}
                    animationConfig={{ bounciness: 0 }}
                    animationType={'spring'}
                    width={Dimensions.get('screen').width - 140}
                  />
                  <Image
                    resizeMode="contain"
                    source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/qantas/green-tier.png' }}
                    accessibilityIgnoresInvertColors
                    style={tw`absolute -bottom-3 -right-2`}
                  />
                </View>
                <View style={tw`mt-3 h-px bg-strokecream`} />
                <Text
                  style={tw.style(bodySmallRegular, 'text-center')}
                  maxFontSizeMultiplier={1}
                >
                  {`You're only ${
                    4 - surveysCount
                  } surveys away from completing your monthly tracking goal and unlocking new achievements.`}
                </Text>
              </View>
            )}
          </View>
        </TrackContent>
        <View>
          <TrackLinearGradient style={'top-[-33px]'} />
          {isCheckingEligibility ? (
            <View style={tw`mb-2 items-center py-4`}>
              <ActivityIndicator size="large" color={tw.color('white')} />
            </View>
          ) : isEligible ? (
            <PrimaryButton
              buttonSize="large"
              style={tw.style('mb-2')}
              onPress={() => {
                sendAnalyticsEvent({
                  event: mixpanelEventName.actionClicked,
                  properties: {
                    location: newCurrentRoute,
                    action: mixpanelEventName.weeklySurveyStarted,
                  },
                });
                setIsStartSurvey(true);
              }}
            >
              Let's go
            </PrimaryButton>
          ) : (
            <SecondaryButton
              buttonSize="large"
              style={tw.style('mb-2')}
              disabled
            >
              Survey completed for this week
            </SecondaryButton>
          )}
        </View>
      </View>
    </View>
  );
}
