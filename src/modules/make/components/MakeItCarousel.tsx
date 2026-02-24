import { useLinkTo, useNavigation } from '@react-navigation/native';
import { FlashListRef } from '@shopify/flash-list';
import { FlashList } from '@shopify/flash-list';
import { IFrameworkComponentStep } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import CompletedCookModal from '../../../modules/make/components/CompletedCookModal';
import ShoppingListIngredientsModal from '../../../modules/make/components/ShoppingListIngredientsModal';
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
import { useConsumeInventoryItemsMutation } from '../../../modules/inventory/api/inventoryApi';
import { InitialNavigationStackParams } from '../../navigation/navigator/InitialNavigator';

const screenWidth = Dimensions.get('screen').width;

interface ICarouselItem extends IFrameworkComponentStep {
  ingredients: {
    id: string;
    title: string;
    quantity: string;
    preparation?: string;
    ingredientId?: string;
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
  scaledQuantities,
  preExistingIngredients,
}: {
  frameworkId: string;
  recipeName?: string;
  recipeImage?: string;
  data: ICarouselItem[];
  totalWeightOfSelectedIngredients: number;
  mealId: string;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  completedSteps: () => void;
  scaledQuantities?: Map<string, string>;
  preExistingIngredients?: { id: string; title: string; averageWeight: number }[];
}) {

  const navigation = useNavigation<InitialNavigationStackParams<'MakeIt'>['navigation']>();

  const { sendAnalyticsEvent, sendFailedEventAnalytics } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  const { checkMilestonesNow } = useBadgeChecker();

  const flashListRef = useRef<FlashListRef<ICarouselItem>>(null);

  const [mixpanel] = useContext(MixPanelContext);

  const [isModalVisible, setModalVisible] = useState(false);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [optimisticMealsCooked, setOptimisticMealsCooked] = useState<number | null>(null);
  const [createFeedback, { isLoading: isCreateFeedbackLoading }] =
    useCreateFeedbackMutation();
  const {
    data: cookedRecipesData,
    refetch: refetchCookedRecipes,
  } = useGetCookedRecipesQuery();
  const [consumeInventoryItems] = useConsumeInventoryItemsMutation();

  const scrollToItem = (index: number) => {
    if (flashListRef.current) {
      flashListRef.current.scrollToIndex({
        animated: true,
        index,
      });
    }
  };


  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleCompletedModalClose = () => {
    setModalVisible(false);
    setShowShoppingListModal(true);
  };

  const handleShoppingListModalClose = () => {
    setShowShoppingListModal(false);
    navigation.navigate('Root', {
      screen: 'Make',
      params: { screen: 'MakeHome' },
    } as const);
  };

  const onCompleteCook = async () => {
    try {
      if (isCompleting || isCreateFeedbackLoading) {
        return;
      }

      setIsCompleting(true);
      completedSteps();
      sendAnalyticsEvent({
        event: mixpanelEventName.actionClicked,
        properties: {
          location: newCurrentRoute,
          action: mixpanelEventName.cookCompleted,
          meal_id: frameworkId,
        },
      });

      // Create feedback — this also triggers food.saved event on the backend
      // which increments meals cooked, food/money/CO2 saved, leaderboard, etc.
      try {
        const ingredientIds = preExistingIngredients?.map((ing) => ing.id) || [];
        await createFeedback({
          frameworkId,
          prompted: false,
          foodSaved: (totalWeightOfSelectedIngredients || 0) / 1000,
          mealId,
          ingredientIds,
        }).unwrap();
      } catch (feedbackErr) {
        console.error('[CompleteCook] Feedback/analytics error:', feedbackErr);
        sendFailedEventAnalytics(feedbackErr);
      }

      setOptimisticMealsCooked((cookedRecipesData?.numberOfMealsCooked ?? 0) + 1);

      // Deduct consumed ingredients from inventory after cooking
      if (preExistingIngredients && preExistingIngredients.length > 0) {
        try {
          await consumeInventoryItems({
            ingredients: preExistingIngredients.map((ing) => ({
              ingredientId: ing.id,
              name: ing.title,
            })),
            recipeId: frameworkId,
            recipeName,
          }).unwrap();
        } catch (consumeErr) {
          // Don't block cooking completion if inventory deduction fails
        }
      }

      await refetchCookedRecipes();
      
      await checkMilestonesNow();

      setModalVisible(true);

    } catch (error: unknown) {
      sendFailedEventAnalytics(error);
      Alert.alert('User update error', JSON.stringify(error));
    } finally {
      setIsCompleting(false);
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
              isLoading={isCompleting || isCreateFeedbackLoading}
              onCompleteCook={onCompleteCook}
              scrollToItem={scrollToItem}
              scaledQuantities={scaledQuantities}
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

      <CompletedCookModal
        mealsCookedCount={
          optimisticMealsCooked ?? cookedRecipesData?.numberOfMealsCooked ?? 0
        }
        isModalVisible={isModalVisible}
        toggleModal={toggleModal}
        onRequestRating={handleCompletedModalClose}
      />
      
      <ShoppingListIngredientsModal
        isVisible={showShoppingListModal}
        onClose={handleShoppingListModalClose}
        ingredients={data.flatMap(step => step.ingredients)}
        recipeId={frameworkId}
        recipeName={recipeName}
      />
      {/* )} */}
    </View>
  );
}
