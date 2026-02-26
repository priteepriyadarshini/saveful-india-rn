import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { skipToken } from '@reduxjs/toolkit/query';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import tw from '../../../common/tailwind';
import { IFramework } from '../types/local';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import { useGetFeedbacksForFrameworkQuery } from '../../../modules/track/api/api';
import { FeedbackResult } from '../../../modules/track/api/types';
import TrackPostMakeCarousel from '../../../modules/track/components/TrackPostMakeCarousel';
import React, { useEffect, useState } from 'react';
import { ImageBackground, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../../navigation/navigator/root/types';

export default function PostMakeScreen({ route: { params } }: any) {
  const { id, title: routeTitle, heroImageUrl } = params || {};
  type RootTabNavigation = BottomTabNavigationProp<RootStackParamList>;
  const navigation = useNavigation<RootTabNavigation>();

  const framework = React.useMemo<IFramework>(() => ({
    id,
    title: routeTitle || 'Meal',
    heroImageUrl: heroImageUrl || undefined,
  }), [id, routeTitle, heroImageUrl]);

  const { data: feedbacks, isLoading: isGetFeedbacksForFrameworkLoading } =
    useGetFeedbacksForFrameworkQuery(
      framework?.id ? { id: framework.id } : skipToken,
    );
  const feedbackForMeal = feedbacks?.find(
    feedback => feedback.data.meal_id === id,
  );

  const [isStarted, setIsStarted] = useState<boolean>(false);

  const { sendAnalyticsEvent, sendTimeEventAnalytics } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const [feedback, setFeedback] = useState<FeedbackResult | undefined>();

  useEffect(() => {
  
    if (feedbackForMeal && !isStarted) {
      if (feedbackForMeal.prompted) {
        const parentNav = (navigation as any)?.getParent?.();
        if (parentNav?.navigate) {
          parentNav.navigate('Feed', { screen: 'FeedHome' });
        } else {
          navigation.goBack();
        }
      } else {
        setFeedback(feedbackForMeal);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackForMeal, isStarted]);

  useEffect(() => {
    sendTimeEventAnalytics(mixpanelEventName.postMakeScreenView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    !framework ||
    isGetFeedbacksForFrameworkLoading ||
    (feedbackForMeal && feedbackForMeal.prompted && !isStarted)
  ) {
    return null;
  }

  return (
    <View style={tw`flex-1 bg-eggplant`}>
      <ImageBackground
        style={tw`flex-1`}
        imageStyle={tw.style('rounded-2xl')}
        source={require('../../../../assets/placeholder/purple-line.png')}
      >
        <SafeAreaView edges={['bottom', 'top']} style={tw`flex-1 pb-10`}>
          <View style={tw.style('z-10 items-end')}>
            <Pressable
              onPress={() => {
                const props = {
                  location: newCurrentRoute,
                  action: mixpanelEventName.postMakeSurveyExit,
                  meal_id: framework?.id,
                  meal_name: framework?.title,
                };

                sendAnalyticsEvent({
                  event: mixpanelEventName.postMakeScreenView,
                  properties: props,
                });
                sendAnalyticsEvent({
                  event: mixpanelEventName.actionClicked,
                  properties: props,
                });
                navigation.goBack();
              }}
              style={tw`px-3 pt-4`}
            >
              <Feather name={'x'} size={20} color="white" />
            </Pressable>
          </View>

          <TrackPostMakeCarousel
            framework={framework}
            mealId={id}
            handlePresentModalDismiss={() => {
              const props = {
                location: newCurrentRoute,
                action: mixpanelEventName.postMakeSurveyCompleted,
                meal_id: framework?.id,
                meal_name: framework?.title,
              };
              sendAnalyticsEvent({
                event: mixpanelEventName.postMakeScreenView,
                properties: props,
              });
              sendAnalyticsEvent({
                event: mixpanelEventName.actionClicked,
                properties: props,
              });
              navigation.goBack();
            }}
            feedback={feedback}
            isStarted={isStarted}
            setIsStarted={setIsStarted}
            totalWeightOfSelectedIngredients={0}
          />
        </SafeAreaView>
      </ImageBackground>

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
