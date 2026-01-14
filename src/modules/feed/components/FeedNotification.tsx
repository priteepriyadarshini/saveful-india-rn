import { useLinkTo, useNavigation } from '@react-navigation/native';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import useEnvironment from '../../../modules/environment/hooks/useEnvironment';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import {
  useGetFeedbacksQuery,
} from '../../../modules/track/api/api';
import { useGetCookedRecipesDetailsQuery } from '../../../modules/analytics/api/api';
import React, { useEffect, useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import {
  bodyMediumBold,
  bodySmallBold,
  bodySmallRegular,
} from '../../../theme/typography';
import { TrackStackScreenProps } from '../../track/navigation/TrackNavigation';

export default function FeedNotification({
  setIsNotification,
}: {
  setIsNotification: (isNotification: boolean) => void;
}) {
  const navigation = useNavigation<TrackStackScreenProps<'TrackHome'>['navigation']>();
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  const env = useEnvironment();

  // Get all cooked recipes with details
  const { data: cookedData } = useGetCookedRecipesDetailsQuery();
  const cookedRecipes = cookedData?.cookedRecipes || [];

  // Get all feedbacks
  const { data: feedbacks } = useGetFeedbacksQuery();

  // Find the first cooked recipe that doesn't have a prompted feedback
  const pendingRecipe = useMemo(() => {
    if (!cookedRecipes.length || !feedbacks) return null;
    
    // Get all recipe IDs that have prompted feedback
    const recipesWithSurvey = new Set(
      feedbacks
        .filter(f => f.prompted && f.data.meal_id)
        .map(f => f.data.meal_id)
    );

    // Find first cooked recipe without survey
    return cookedRecipes.find(recipe => !recipesWithSurvey.has(recipe.id)) || null;
  }, [cookedRecipes, feedbacks]);

  // We can render directly from cooked recipe details; no need to fetch Craft content
  const [showCard, setShowCard] = React.useState<boolean>(false);

  const onDismissNotification = () => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: mixpanelEventName.dismissNotification,
      },
    });

    setIsNotification(false);
  };

  useEffect(() => {
    if (pendingRecipe?.id) {
      setShowCard(true);
      setIsNotification(true);
    } else {
      setShowCard(false);
      setIsNotification(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRecipe?.id]);

  if (!pendingRecipe || !showCard) {
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
              recipe_id: pendingRecipe.id,
            },
          });
          (navigation as any).navigate('Survey', {
           screen: 'PostMake',
           params: { id: pendingRecipe.id, title: pendingRecipe.title, heroImageUrl: pendingRecipe.heroImageUrl } as any,
          } as any);
        }}
      >
        {pendingRecipe?.heroImageUrl ? (
          <Image
            resizeMode="cover"
            style={tw`mr-2.5 h-[66px] w-[71px] rounded-2lg`}
            source={{ uri: pendingRecipe.heroImageUrl }}
            accessibilityIgnoresInvertColors
          />
        ) : null}
        <View style={tw.style('shrink justify-center')}>
          <Text style={tw.style(bodyMediumBold, 'mb-1.5')}>
            How was your meal?
          </Text>
          <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
            Let us know what you thought of your{' '}
            <Text style={tw.style(bodySmallBold, 'text-midgray')}>
              {`${pendingRecipe?.title ?? 'meal'}`}.
            </Text>
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
