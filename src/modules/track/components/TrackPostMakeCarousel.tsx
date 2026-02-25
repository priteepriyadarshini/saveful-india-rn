import tw from '../../../common/tailwind';
import { IFramework } from '../types/local';
import { PostMakeSurveyStep } from '../data/data';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import { useBadgeChecker } from '../../../modules/badges/hooks/useBadgeChecker';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import {
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
} from '../../../modules/track/api/api';
import { FeedbackResult } from '../../../modules/track/api/types';
import PostMakeImprovementQ from './PostMakeQuestion/PostMakeImprovementQ';
import PostMakePortionQ from './PostMakeQuestion/PostMakePortionQ';
import PostMakeLeftoverAskQ from './PostMakeQuestion/PostMakeLeftoverAskQ';
import PostMakeStorageQ from './PostMakeQuestion/PostMakeStorageQ';
import PostMakeMakeoverQ from './PostMakeQuestion/PostMakeMakeoverQ';
import PostMakeNoLeftoverDone from './PostMakeQuestion/PostMakeNoLeftoverDone';
import PostMakeRecipeSurveyModal from '../../make/components/PostMakeRecipeSurveyModal';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';

export default function TrackPostMakeCarousel({
  framework,
  mealId,
  handlePresentModalDismiss,
  feedback,
  isStarted,
  setIsStarted,
  totalWeightOfSelectedIngredients,
}: {
  framework: IFramework;
  mealId: string;
  handlePresentModalDismiss: () => void;
  feedback?: FeedbackResult;
  isStarted: boolean;
  setIsStarted: (value: boolean) => void;
  totalWeightOfSelectedIngredients: number;
}) {

  const { sendAnalyticsEvent, sendFailedEventAnalytics } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  const { checkMilestonesNow } = useBadgeChecker();
  const [createFeedback, { isLoading: isCreateLoading }] = useCreateFeedbackMutation();
  const [updateFeedback, { isLoading: isUpdateLoading }] = useUpdateFeedbackMutation();
  const isFeedbackLoading = isCreateLoading || isUpdateLoading;
  const isSubmittingRef = useRef(false);

  const [showRatingModal, setShowRatingModal] = useState(!isStarted && !feedback);
  const [ratingData, setRatingData] = useState<{ rating: number; review: string } | null>(null);
  const [currentStep, setCurrentStep] = useState<PostMakeSurveyStep | null>(null);
  const [improvementReason, setImprovementReason] = useState<string>('');
  const [portionSize, setPortionSize] = useState<string>('');
  const [hasLeftovers, setHasLeftovers] = useState<boolean | null>(null);
  const [storageLocation, setStorageLocation] = useState<string>('');

  useEffect(() => {
    if (!isStarted && !feedback) {
      setShowRatingModal(true);
    }
  }, [isStarted, feedback]);

  const handleRatingSubmit = (rating: number, review: string) => {
    setRatingData({ rating, review });
    setShowRatingModal(false);
    setIsStarted(true);
    setCurrentStep(rating <= 2 ? 'improvement' : 'portion');
  };

  const handleRatingSkip = () => {
    setRatingData(null);
    setShowRatingModal(false);
    setIsStarted(true);
    setCurrentStep('portion');
  };

  useEffect(() => {
    if (isStarted && !currentStep && !showRatingModal) {
      setCurrentStep('portion');
    }
  }, [isStarted, currentStep, showRatingModal]);

  const handleImprovementSelected = (reasonKey: string) => {
    setImprovementReason(reasonKey);
    setCurrentStep('portion');
  };

  const handlePortionSelected = (portionKey: string) => {
    setPortionSize(portionKey);
    switch (portionKey) {
      case 'too_much':
        setHasLeftovers(true);
        setCurrentStep('storage');
        break;
      case 'just_right':
        setCurrentStep('leftover_ask');
        break;
      case 'not_enough':
        setHasLeftovers(false);
        setCurrentStep('done_no_leftover');
        break;
      default:
        setCurrentStep('leftover_ask');
    }
  };

  const handleLeftoverAnswer = (hasLeftover: boolean) => {
    setHasLeftovers(hasLeftover);
    if (hasLeftover) {
      setCurrentStep('storage');
    } else {
      setCurrentStep('done_no_leftover');
    }
  };

  const handleStorageSelected = (storageKey: string) => {
    setStorageLocation(storageKey);
    setCurrentStep('makeover');
  };

  const submitFeedback = useCallback(async () => {
    if (isSubmittingRef.current || isCreateLoading || isUpdateLoading) return;
    isSubmittingRef.current = true;

    try {
      const didYouLikeIt = ratingData ? ratingData.rating >= 3 : true;

      if (!feedback) {
        await createFeedback({
          frameworkId: framework.id,
          prompted: true,
          didYouLikeIt,
          foodSaved: totalWeightOfSelectedIngredients / 1000,
          mealId,
          rating: ratingData?.rating,
          review: ratingData?.review || undefined,
          improvementReason: improvementReason || undefined,
          portionSize: portionSize || undefined,
          hasLeftovers: hasLeftovers ?? undefined,
          leftoverStorage: storageLocation || undefined,
        }).unwrap();
      } else {
        await updateFeedback({
          id: feedback.id,
          prompted: true,
          didYouLikeIt,
          foodSaved: feedback.data.food_saved,
          mealId,
          rating: ratingData?.rating,
          review: ratingData?.review || undefined,
          improvementReason: improvementReason || undefined,
          portionSize: portionSize || undefined,
          hasLeftovers: hasLeftovers ?? undefined,
          leftoverStorage: storageLocation || undefined,
        }).unwrap();
      }

      await checkMilestonesNow();

      sendAnalyticsEvent({
        event: mixpanelEventName.actionClicked,
        properties: {
          location: newCurrentRoute,
          action: mixpanelEventName.postMakeSurveySubmitted,
          frameworkId: framework.id,
          meal_name: framework.title,
          rating: ratingData?.rating,
          has_review: !!ratingData?.review,
          rating_skipped: !ratingData,
          improvement_reason: improvementReason || 'none',
          portion_size: portionSize,
          has_leftovers: hasLeftovers,
          leftover_storage: storageLocation || 'none',
          food_saved: `${totalWeightOfSelectedIngredients / 1000}Kg`,
        },
      });

      handlePresentModalDismiss();
    } catch (error: unknown) {
      sendFailedEventAnalytics(error);
      Alert.alert(
        'Feedback update error. Try again later.',
        JSON.stringify(error),
      );
    } finally {
      isSubmittingRef.current = false;
    }
  }, [
    feedback,
    framework,
    mealId,
    ratingData,
    improvementReason,
    portionSize,
    hasLeftovers,
    storageLocation,
    totalWeightOfSelectedIngredients,
    createFeedback,
    updateFeedback,
    checkMilestonesNow,
    sendAnalyticsEvent,
    sendFailedEventAnalytics,
    handlePresentModalDismiss,
    newCurrentRoute,
    isCreateLoading,
    isUpdateLoading,
  ]);

  return (
    <View style={tw.style('flex-1 pb-5')}>
      {currentStep === 'improvement' && (
        <PostMakeImprovementQ
          dishName={framework.title}
          onSelect={handleImprovementSelected}
        />
      )}

      {currentStep === 'portion' && (
        <PostMakePortionQ
          dishName={framework.title}
          onSelect={handlePortionSelected}
        />
      )}

      {currentStep === 'leftover_ask' && (
        <PostMakeLeftoverAskQ
          onAnswer={handleLeftoverAnswer}
          isLoading={isFeedbackLoading}
        />
      )}

      {currentStep === 'storage' && (
        <PostMakeStorageQ
          dishName={framework.title}
          dishId={framework.id}
          onStorageSelected={handleStorageSelected}
        />
      )}

      {currentStep === 'makeover' && (
        <PostMakeMakeoverQ
          framework={framework}
          storageLocation={storageLocation}
          onDone={submitFeedback}
          isLoading={isFeedbackLoading}
        />
      )}

      {currentStep === 'done_no_leftover' && (
        <PostMakeNoLeftoverDone
          portionSize={portionSize}
          dishName={framework.title}
          onDone={submitFeedback}
          isLoading={isFeedbackLoading}
        />
      )}
      <PostMakeRecipeSurveyModal
        isVisible={showRatingModal}
        recipeId={framework.id}
        recipeName={framework.title}
        recipeImage={framework.heroImageUrl}
        onClose={handleRatingSkip}
        onSubmit={handleRatingSubmit}
      />
    </View>
  );
}