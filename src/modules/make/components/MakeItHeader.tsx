import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import tw from '../../../common/tailwind';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import React from 'react';
import { Animated, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subheadLargeUppercase } from '../../../theme/typography';

export default function MakeItHeader({
  title,
  completedSteps,
  mealName,
  isTTSEnabled,
  isSpeaking,
  onToggleTTS,
}: {
  title?: string;
  mealName?: string;
  mealId: string;
  frameworkId: string;
  completedSteps: () => void;
  isTTSEnabled: boolean;
  isSpeaking: boolean;
  onToggleTTS: () => void;
}) {
  const navigation = useNavigation();
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const onClose = () => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: mixpanelEventName.makeIngredientExit,
        meal_name: mealName,
      },
    });
    completedSteps();
    navigation.goBack();
  };

  return (
    <View style={tw`absolute left-0 right-0 z-10`}>
      <SafeAreaView
        style={tw`pb-6.5 absolute left-18 right-0 z-20 flex-row items-end justify-between gap-3 px-5 pt-5`}
      >
        {title && (
          <Animated.Text
            style={[
              tw.style(
                subheadLargeUppercase,
                'flex-1 text-center leading-5 text-white',
              ),
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Animated.Text>
        )}

        <View style={tw`flex-row items-center gap-3`}>
          {/* Speaker Button */}
          <Pressable
            onPress={onToggleTTS}
            style={tw.style(
              'h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
              isTTSEnabled ? 'bg-lemon' : 'bg-white/30'
            )}
            accessibilityLabel={isTTSEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
            accessibilityRole="button"
          >
            <View style={tw`relative`}>
              <Feather
                name={isSpeaking ? 'volume-2' : isTTSEnabled ? 'volume-1' : 'volume-x'}
                color={isTTSEnabled ? tw.color('kale') : tw.color('white')}
                size={20}
              />
              {isSpeaking && (
                <View
                  style={tw`absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500`}
                />
              )}
            </View>
          </Pressable>

          {/* Close Button */}
          <Pressable
            style={tw`flex h-5 w-5 flex-shrink-0 items-center justify-center`}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Feather name="x" color={tw.color('white')} size={20} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}