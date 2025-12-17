import GenericCarouselPagination from '../../../common/components/GenericCarousel/GenericCarouselPagination';
// import { getAllIngredientsFromComponents } from 'common/helpers/filterIngredients';
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import {
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
  useUpdateUserMealMutation,
} from '../../../modules/track/api/api';
import { FeedbackResult } from '../../../modules/track/api/types';
import LeftoversComponent from '../../../modules/track/components/PostMakeQuestion/LeftoversComponent';
import PostMakeQ1 from '../../../modules/track/components/PostMakeQuestion/PostMakeQ1';
import PostMakeQ3 from '../../../modules/track/components/PostMakeQuestion/PostMakeQ3';
import ShopFridge from '../../../modules/track/components/PostMakeQuestion/ShopFridge';
import { ITrackPostMakeIngredient } from '../../../modules/track/components/TrackPostMakeIngredients';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';

interface PostMakeSurveyItem {
  id: number;
}

const screenWidth = Dimensions.get('window').width;

export default function TrackPostMakeCarousel({
  framework,
  mealId,
  data,
  handlePresentModalDismiss,
  //usedIngredients,
  selectedIngredients,
  //setSelectedIngredients,
  setIsIngredient,
  feedback,
  isStarted,
  setIsStarted,
  setIsCompleted,
  isIngredient,
  totalWeightOfSelectedIngredients,
}: {
  framework: IFramework;
  mealId: string;
  data?: PostMakeSurveyItem[];
  handlePresentModalDismiss: () => void;
  usedIngredients?: string[];
  selectedIngredients: ITrackPostMakeIngredient[];
  isIngredient: boolean;
  setIsIngredient: (value: boolean) => void;
  feedback?: FeedbackResult;
  isStarted: boolean;
  setIsStarted: (value: boolean) => void;
  setIsCompleted: (value: boolean) => void;
  totalWeightOfSelectedIngredients: number;
  setSelectedIngredients: (value: ITrackPostMakeIngredient[]) => void;
}) {
  const flatListRef = useRef<FlatList<any>>(null);

  const getItemLayout = (_data: any, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  });

  const { sendAnalyticsEvent, sendFailedEventAnalytics } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [didYouLikeIt, setDidYouLikeIt] = useState<boolean>(false);
  const [isAnyLeftovers, setIsAnyLeftovers] = useState<string>('');
  const [dislikeStatus, setDislikeStatus] = useState<string>('');
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentSlideSize =
        screenWidth || event.nativeEvent.layoutMeasurement.width;
      const index = event.nativeEvent.contentOffset.x / currentSlideSize;
      const roundIndex = Math.round(index);

      setCurrentIndex(roundIndex);
    },
    [],
  );

  const scrollToItem = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        animated: true,
        index,
      });
    }
  };
  // const dishIngredients = getAllIngredientsFromComponents(framework.components)
  //   .filter(
  //     (ingredient, index, self) =>
  //       index === self.findIndex(t => t.id === ingredient.id),
  //   )
  //   // Show only the ingredients actually used in make this dish
  //   // Using title as a unique identifier
  //   .filter(ingredient => usedIngredients?.includes(ingredient.title))
  //   // Sort by title
  //   .sort((a, b) => a.title.localeCompare(b.title));

  // const onValueChecked = (value: ITrackPostMakeIngredient) => {
  //   const valueIndex = selectedIngredients.findIndex(x => x.id === value.id);

  //   if (valueIndex === -1) {
  //     setSelectedIngredients([...selectedIngredients, value]);
  //   } else {
  //     const updatedArray = [...selectedIngredients];
  //     updatedArray.splice(valueIndex, 1);

  //     setSelectedIngredients(updatedArray);
  //   }
  // };

  const [createFeedback, { isLoading: isCreateFeedbackLoading }] =
    useCreateFeedbackMutation();
  const [updateFeedback, { isLoading: isUpdateFeedbackLoading }] =
    useUpdateFeedbackMutation();

  // To update user meal as feedback completed
  const [updateUserMeal, { isLoading: isUpdateUserMealLoading }] =
    useUpdateUserMealMutation();

  const onFeedbackComplete = async () => {
    if (
      isCreateFeedbackLoading ||
      isUpdateFeedbackLoading ||
      isUpdateUserMealLoading
    ) {
      return;
    }

    try {
      await updateUserMeal({
        id: mealId,
        saved: false,
      }).unwrap();

      if (!feedback) {
        await createFeedback({
          frameworkId: framework.id,
          prompted: true,
          didYouLikeIt,
          foodSaved: totalWeightOfSelectedIngredients / 1000,
          mealId,
        }).unwrap();
      } else {
        await updateFeedback({
          id: feedback.id,
          prompted: true,
          didYouLikeIt,
          foodSaved: feedback.data.food_saved,
          mealId,
        }).unwrap();
      }

      sendAnalyticsEvent({
        event: mixpanelEventName.actionClicked,
        properties: {
          location: newCurrentRoute,
          action: mixpanelEventName.postMakeSurveySubmitted,
          frameworkId: framework.id,
          feedback: didYouLikeIt,
          leftovers: !!isAnyLeftovers,
          dislike_status: dislikeStatus ? `Too ${dislikeStatus}` : 'None',
          food_saved: `${totalWeightOfSelectedIngredients / 1000}Kg`,
          number_of_selected_ingredients: selectedIngredients.length,
          selected_ingredients: selectedIngredients,
        },
      });
    } catch (error: unknown) {
      // Whoopss.
      sendFailedEventAnalytics(error);
      Alert.alert(
        'Feedback update error. Try again later.',
        JSON.stringify(error),
      );
    }
  };

  // const emptyIngredients = () => {
  //   setSelectedIngredients([]);
  // };

  useEffect(() => {
    if (!isStarted) {
      setIsStarted(true);
    }
  }, [isStarted, setIsStarted]);

  return (
    <View style={tw.style('pb-5')}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => {
          return (
            <View
              style={tw`w-[${Dimensions.get('window').width}px]`}
              key={item.id}
            >
              {item.showSurveyDishes && (
                <PostMakeQ1
                  framework={framework}
                  item={item.content}
                  setNextIndex={scrollToItem}
                  handlePresentModalDismiss={handlePresentModalDismiss}
                  setDislikeStatus={setDislikeStatus}
                  setDidYouLikeIt={setDidYouLikeIt}
                />
              )}
              {/* {item.showSurveyIngredients && (
                <PostMakeQ2
                  item={item}
                  setNextIndex={scrollToItem}
                  list={dishIngredients}
                  selectedIngredients={selectedIngredients}
                  setSelectedIngredients={onValueChecked as any}
                  emptyIngredients={emptyIngredients}
                />
              )} */}
              {!isAnyLeftovers && item.showSurveyLeftovers && (
                <PostMakeQ3
                  item={item}
                  setIsAnyLeftovers={setIsAnyLeftovers}
                  selectedIngredients={selectedIngredients}
                  setIsIngredient={setIsIngredient}
                  setIsCompleted={setIsCompleted}
                  isLoading={
                    isCreateFeedbackLoading ||
                    isUpdateFeedbackLoading ||
                    isUpdateUserMealLoading
                  }
                  onFeedbackComplete={onFeedbackComplete}
                />
              )}
              {isAnyLeftovers === 'yes' && (
                <LeftoversComponent
                  framework={framework}
                  selectedIngredients={selectedIngredients}
                  setIsIngredient={setIsIngredient}
                  setIsCompleted={setIsCompleted}
                  isLoading={
                    isCreateFeedbackLoading ||
                    isUpdateFeedbackLoading ||
                    isUpdateUserMealLoading
                  }
                  onFeedbackComplete={onFeedbackComplete}
                />
              )}
              {isIngredient &&
                isAnyLeftovers &&
                selectedIngredients.length === 0 && <ShopFridge />}
            </View>
          );
        }}
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate={0}
        getItemLayout={getItemLayout}
        renderToHardwareTextureAndroid
        contentContainerStyle={tw.style(`mb-1 content-center`)}
        snapToInterval={screenWidth}
        snapToAlignment="start"
        onScroll={onScroll}
        scrollEventThrottle={16}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 100,
        }}
        initialScrollIndex={0}
      />
      <GenericCarouselPagination
        items={data as any}
        dotSpacing={4}
        dotSize={4}
        activeDotColor="radish"
        inactiveDotColor="radish/60"
        currentIndex={currentIndex}
      />
    </View>
  );
}
