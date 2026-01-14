import { useLinkTo, useNavigation } from '@react-navigation/native';
import { FlashListRef } from '@shopify/flash-list';
import { FlashList } from '@shopify/flash-list';
import { IFrameworkComponentStep } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import CompletedCookModal from '../../../modules/make/components/CompletedCookModal';
import MakeItCarouselItem from '../../../modules/make/components/MakeItCarouselItem';
import { MixPanelContext } from '../../../modules/mixpanel/context/MixpanelContext';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import { useBadgeChecker } from '../../../modules/badges/hooks/useBadgeChecker';
import React, { useContext, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';
import { useCreateFeedbackMutation } from '../../../modules/track/api/api';
import { useGetCookedRecipesQuery } from '../../../modules/analytics/api/api';
import { InitialNavigationStackParams } from '../../navigation/navigator/InitialNavigator';

const screenWidth = Dimensions.get('screen').width;

interface ICarouselItem extends IFrameworkComponentStep {
  ingredients: {
    id: string;
    title: string;
    quantity: string;
    preparation?: string;
  }[];
}

export default function MakeItCarousel({
  frameworkId,
  recipeName,
  recipeImage,
  data,
  totalWeightOfSelectedIngredients,
  mealId,
  onScroll,
  completedSteps,
}: {
  frameworkId: string;
  recipeName?: string;
  recipeImage?: string;
  data: ICarouselItem[];
  totalWeightOfSelectedIngredients: number;
  mealId: string;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  completedSteps: () => void;
}) {
  //const linkTo = useLinkTo();
  const navigation = useNavigation<InitialNavigationStackParams<'MakeIt'>['navigation']>();

  const { sendAnalyticsEvent, sendFailedEventAnalytics } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  const { checkMilestonesNow } = useBadgeChecker();

  const flashListRef = useRef<FlashListRef<ICarouselItem>>(null);

  const [mixpanel] = useContext(MixPanelContext);

  const [isModalVisible, setModalVisible] = useState(false);
  const [createFeedback, { isLoading: isCreateFeedbackLoading }] =
    useCreateFeedbackMutation();
  const {
    data: cookedRecipesData,
    refetch: refetchCookedRecipes,
  } = useGetCookedRecipesQuery();

  const scrollToItem = (index: number) => {
    if (flashListRef.current) {
      flashListRef.current.scrollToIndex({
        animated: true,
        index,
      });
    }
  };

  // const toggleIncompleteModal = () => {
  //   setIncompleteModalVisible(!isIncompleteModalVisible);
  // };

  const toggleModal = () => {
    // Only toggle visibility; navigation handled by modal's close
    setModalVisible(!isModalVisible);
  };

  const onCompleteCook = async () => {
    try {
      completedSteps();
      sendAnalyticsEvent({
        event: mixpanelEventName.actionClicked,
        properties: {
          location: newCurrentRoute,
          action: mixpanelEventName.cookCompleted,
          meal_id: frameworkId,
        },
      });
      // Create feedback so stats/groups update. Use computed foodSaved if available
      if (!isCreateFeedbackLoading) {
        await createFeedback({
          frameworkId,
          prompted: false,
          foodSaved: (totalWeightOfSelectedIngredients || 0) / 1000,
          mealId,
        }).unwrap();
        // Ensure cooked count reflects this completion
        await refetchCookedRecipes();
        
        // Check milestones after completing a meal - this will auto-show badge notifications
        await checkMilestonesNow();
      }

      setModalVisible(true);

      // scheduleNotification({
      //   message: `How was your ${title ?? 'meal'}?`,
      //   delayInSeconds: 30 * 60, // 30 minutes
      //   url: `/survey/postmake/${result.id}`,
      // });

    } catch (error: unknown) {
      sendFailedEventAnalytics(error);
      Alert.alert('User update error', JSON.stringify(error));
    }
  };

  return (
    <View>
      <FlashList
        ref={flashListRef}
        data={data}
        keyExtractor={(item: ICarouselItem) => item.id}
        renderItem={({
          item,
          index,
        }: {
          item: ICarouselItem;
          index: number;
        }) => {
          return (
            <MakeItCarouselItem
              item={item}
              index={index}
              noOfItems={data.length}
              isLoading={false}
              onCompleteCook={onCompleteCook}
              scrollToItem={scrollToItem}
            />
          );
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        decelerationRate={0}
        renderToHardwareTextureAndroid
        snapToInterval={screenWidth}
        snapToAlignment="start"
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
      {/* {totalWeightOfSelectedIngredients > 0 ? (
        <CompletedCookWithSurvey
          isModalVisible={isModalVisible}
          toggleModal={toggleModal}
          totalWeightOfSelectedIngredients={totalWeightOfSelectedIngredients}
        />
      ) : ( */}
      <CompletedCookModal
        mealsCookedCount={cookedRecipesData?.numberOfMealsCooked ?? 0}
        isModalVisible={isModalVisible}
        toggleModal={toggleModal}
      />
      {/* )} */}
    </View>
  );
}
