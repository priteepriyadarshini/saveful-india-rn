import { useLinkTo, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { IFrameworkComponentStep } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import CompletedCookModal from '../../../modules/make/components/CompletedCookModal';
import MakeItCarouselItem from '../../../modules/make/components/MakeItCarouselItem';
import { MixPanelContext } from '../../../modules/mixpanel/context/MixpanelContext';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import {
  useGetUserMealsQuery,
  useUpdateUserMealMutation,
} from '../../../modules/track/api/api'; 
import React, { useContext, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../../navigation/navigator/root/types';

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
  // title,
  data,
  // totalWeightOfSelectedIngredients,
  mealId,
  onScroll,
  completedSteps,
}: {
  frameworkId: string;
  title?: string;
  data: ICarouselItem[];
  totalWeightOfSelectedIngredients: number;
  mealId: string;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  completedSteps: () => void;
}) {
  //const linkTo = useLinkTo();
  type RootTabNavigationProp = BottomTabNavigationProp<RootStackParamList, 'Make'>;
  const navigation = useNavigation<RootTabNavigationProp>();

  const { sendAnalyticsEvent, sendFailedEventAnalytics } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  // const { scheduleNotification } = useNotifications();

  const flashListRef = useRef<FlashList<any>>(null);

  const [mixpanel] = useContext(MixPanelContext);

  const [isModalVisible, setModalVisible] = useState(false);

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
    setModalVisible(!isModalVisible);
    // TODO: Go to feed
    navigation.navigate('Make', {
      screen: 'MakeHome',
      params: undefined, // optional
    });
    // linkTo('/feed');
  };
  //UNCOMMENT these code once the logic part has been created
  const { data: userMeals, isLoading: isGetUserMealsLoading } =
    useGetUserMealsQuery();
  const [updateUserMeal, { isLoading: isUpdateUserMealLoading }] =
    useUpdateUserMealMutation();

  
  // DEMO CODE fallback for userMeals
  // TODO: Replace with useGetUserMealsQuery() from modules/track/api/api
  // const userMeals: any[] = []; // Simulated empty meal list
  // const isGetUserMealsLoading = false;

  // // DEMO fallback for updateUserMeal mutation
  // // TODO: Replace with useUpdateUserMealMutation() from modules/track/api/api
  // const updateUserMeal = async (payload: any) => {
  //   console.log('Simulated updateUserMeal:', payload);
  //   return { id: mealId }; // Simulated response
  // };
  // const isUpdateUserMealLoading = false;
  //--DEMO CODE--

  const onCompleteCook = async () => {
    try {
      const result = await updateUserMeal({
        id: mealId,
        completed: true,
        saved: true, // Use this for notifications
        data: {
          ingredients: data.map(item =>
            item.ingredients.map(ingredient => ingredient.title),
          ),
        },
      }).unwrap(); 

      if (result) {
        completedSteps();
        sendAnalyticsEvent({
          event: mixpanelEventName.actionClicked,
          properties: {
            location: newCurrentRoute,
            action: mixpanelEventName.cookCompleted,
            meal_id: frameworkId,
            total_cooked: userMeals?.length,
          },
        });
        mixpanel?.getPeople().set({
          total_cooked: userMeals?.length,
        });
        setModalVisible(true);

        // scheduleNotification({
        //   message: `How was your ${title ?? 'meal'}?`,
        //   delayInSeconds: 30 * 60, // 30 minutes
        //   url: `/survey/postmake/${result.id}`,
        // });
      }
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
              isLoading={isGetUserMealsLoading || isUpdateUserMealLoading}
              onCompleteCook={onCompleteCook}
              scrollToItem={scrollToItem}
            />
          );
        }}
        estimatedItemSize={screenWidth}
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
        userMeals={userMeals}
        isModalVisible={isModalVisible}
        toggleModal={toggleModal}
      />
      {/* )} */}
    </View>
  );
}
