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
  // mealId,
  // frameworkId,
  mealName,
}: {
  title?: string;
  mealName?: string;
  mealId: string;
  frameworkId: string;
  completedSteps: () => void;
}) {
  const navigation = useNavigation();
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  // const [isIncompleteModalVisible, setIsIncompleteModalVisible] =
  //   useState(false);

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
    // setIsIncompleteModalVisible(false);
    navigation.goBack();
  };

  return (
    // The first view is just a container for the bg and the search
    <View style={tw`absolute left-0 right-0 z-10`}>
      {/* Search will always be here */}
      <SafeAreaView
        style={tw`pb-6.5 absolute left-0 right-0 z-20 flex-row items-end justify-between gap-3 px-5 pt-5`}
      >
        {/* <View style={tw`w-5`} /> */}

        {title && (
          <Animated.Text
            style={[
              tw.style(
                subheadLargeUppercase,
                'grow text-center leading-5 text-white',
              ),
            ]}
            numberOfLines={1}
          >
            {title}
          </Animated.Text>
        )}

        <Pressable
          style={tw`flex h-5 w-5 items-center justify-center`}
          onPress={() => {
            onClose();
            // setIsIncompleteModalVisible(true);
          }}
          accessibilityRole="button"
        >
          <Feather name="x" color={tw.color('white')} size={20} />
        </Pressable>
      </SafeAreaView>

    </View>
  );
}
