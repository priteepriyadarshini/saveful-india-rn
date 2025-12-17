import { useLinkTo, useNavigation } from '@react-navigation/native';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import useEnvironment from '../../../modules/environment/hooks/useEnvironment';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import {
  useGetUserMealsQuery,
  useUpdateUserMealMutation,
} from '../../../modules/track/api/api';
import React, { useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import {
  bodyMediumBold,
  bodySmallBold,
  bodySmallRegular,
} from '../../../theme/typography';
import { TrackStackScreenProps } from '../../track/navigation/TrackNavigation';

export default function FeedNotification({
  // id,
  // isNotification,
  setIsNotification,
}: {
  // id?: string;
  // isNotification: boolean;
  setIsNotification: (isNotification: boolean) => void;
}) {
  //const linkTo = useLinkTo();
  const navigation = useNavigation<TrackStackScreenProps<'TrackHome'>['navigation']>();
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  // const { data: meal } = useGetUserMealQuery({ id });
  const { data: cookedMeals } = useGetUserMealsQuery();
  const meal = cookedMeals ? cookedMeals?.filter(m => m.saved)[0] : null;

  const [updateUserMeal, { isLoading }] = useUpdateUserMealMutation();

  const env = useEnvironment();
  const { getFramework } = useContent();
  const [framework, setFramework] = React.useState<IFramework>();

  const getFrameworksData = async (id: string) => {
    const data = await getFramework(id);

    if (data) {
      setFramework(data);
      setIsNotification(true);
    }
  };

  // Update meal to be saved:false
  const onDismissNotification = async () => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: mixpanelEventName.dismissNotification,
      },
    });

    setFramework(undefined);
    setIsNotification(false);

    try {
      if (meal?.id && !isLoading) {
        await updateUserMeal({
          id: meal?.id,
          saved: false,
        });
      }
    } catch (e) {
      console.error('Error updating user meal', e);
    }
  };

  useEffect(() => {
    if (meal && meal.framework_id) {
      getFrameworksData(meal?.framework_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meal]);

  if (!meal || !framework) {
    return <View style={tw`mb-0 hidden flex-1 px-4`} />;
  }

  return (
    <View style={tw`mt-3 w-full px-4`}>
      <View style={tw.style('items-end pb-2')}>
        <Pressable onPress={onDismissNotification}>
          <Text style={tw.style('text-white underline')}>Dismiss</Text>
        </Pressable>
      </View>
      <Pressable
        style={tw.style(
          'flex-row rounded-2lg border border-radish bg-white p-2.5',
        )}
        onPress={() => {
          sendAnalyticsEvent({
            event: mixpanelEventName.actionClicked,
            properties: {
              location: newCurrentRoute,
              action: mixpanelEventName.triggerNotification,
            },
          });
          //linkTo(`/survey/postmake/${meal.id}`);
          navigation.navigate('Survey', {
           screen: 'PostMake',
           params: { id: meal.id },
          });
        }}
      >
        {framework?.heroImage && (
          <Image
            resizeMode="contain"
            style={tw`mr-2.5 h-[66px] w-[71px] rounded-2lg`}
            source={bundledSource(
              framework?.heroImage[0].url,
              env.useBundledContent,
            )}
            accessibilityIgnoresInvertColors
          />
        )}
        <View style={tw.style('shrink justify-center')}>
          <Text style={tw.style(bodyMediumBold, 'mb-1.5')}>
            How was your meal?
          </Text>
          <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
            Let us know what you thought of your{' '}
            <Text style={tw.style(bodySmallBold, 'text-midgray')}>
              {`${framework?.title}`}.
            </Text>
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
