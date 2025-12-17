import PrimaryButton from '../../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../../common/tailwind';
import { mixpanelEventName } from '../../../../modules/analytics/analytics';
import useAnalytics from '../../../../modules/analytics/hooks/useAnalytics';
//import { useGetFFNQuery } from 'modules/qantas/api/api';
import { useCurentRoute } from '../../../../modules/route/context/CurrentRouteContext';
import TrackContent from '../../../../modules/track/components/TrackContent';
import TrackLinearGradient from '../../../../modules/track/components/TrackLinearGradient';
import { Dimensions, Image, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import {
  bodyMediumRegular,
  bodySmallRegular,
  h5TextStyle,
} from '../../../../theme/typography';

export default function StartSurvey({
  setIsStartSurvey,
}: {
  setIsStartSurvey: (value: boolean) => void;
}) {
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  //const { data: qantasFFN } = useGetFFNQuery(); //Uncomment when available
  // Temporary mock data for testing layout
  const qantasFFN = {
    surveys_count: 2, // Change this value to simulate different progress states
  };


  return (
    <View style={tw.style('w-full items-center')}>
      <View>
        <TrackContent hideGradient>
          <View>
            <Image
              style={tw`mx-auto h-[289px] w-[234px] max-w-full`}
              resizeMode="contain"
              source={require('../../../../../assets/placeholder/bowl.png')}
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
              {`Let’s estimate by starting with the food you cooked (or cooked with) this week.`}
            </Text>

            {qantasFFN && qantasFFN.surveys_count < 4 && (
              <View style={tw`mt-2 gap-4 rounded-md bg-creme p-6`}>
                <View style={tw`py-2`}>
                  <Progress.Bar
                    progress={
                      (!qantasFFN.surveys_count || qantasFFN.surveys_count === 0
                        ? 0.15
                        : qantasFFN.surveys_count) / 4
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
                    source={require('../../../../../assets/qantas/green-tier.png')}
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
                    4 - (qantasFFN.surveys_count ?? 0)
                  } surveys away from earning 100 Qantas Points and getting closer to achieving Green Tier.`}
                </Text>
              </View>
            )}
          </View>
        </TrackContent>
        <View>
          <TrackLinearGradient style={'top-[-33px]'} />
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
            Let’s go
          </PrimaryButton>
        </View>
      </View>
    </View>
  );
}
