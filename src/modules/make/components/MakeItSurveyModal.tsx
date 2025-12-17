import { Feather } from '@expo/vector-icons';
import { skipToken } from '@reduxjs/toolkit/query';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import SavefulHaptics from '../../../common/helpers/haptics';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { IChallenge } from '../../../models/craft';
import { mixpanelEventName } from '../../analytics/analytics';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { 
  useGetUserChallengeQuery,
  useUpdateUserChallengeMutation,
} from '../../../modules/challenges/api/api';
import useNotifications from '../../../modules/notifications/hooks/useNotifications';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import {
  useCreateFeedbackMutation,
  useGetUserMealsQuery,
  useUpdateUserMealMutation,
} from '../../../modules/track/api/api';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { ScrollView } from 'react-native-gesture-handler';
import {
  bodySmallRegular,
  h7TextStyle,
  subheadLargeUppercase,
} from '../../../theme/typography';

export default function MakeItSurveyModal({
  isVisible,
  setIsVisible,
  setIsCompltedModalVisible,
  frameworkId,
  title,
  mealId,
  ingredientsForComponents,
  mealIngredients,
  preExistingIngredients,
  setPreExistingIngredients,
  totalWeightOfSelectedIngredients,
}: {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCompltedModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  frameworkId: string;
  title: string;
  mealId: string;
  ingredientsForComponents: string[][];
  mealIngredients: { id: string; title: string; averageWeight: number }[];
  preExistingIngredients: {
    id: string;
    title: string;
    averageWeight: number;
  }[];
  setPreExistingIngredients: React.Dispatch<
    React.SetStateAction<{ id: string; title: string; averageWeight: number }[]>
  >;
  totalWeightOfSelectedIngredients: number;
}) {
  const isSelected = (value: string | undefined) => {
    return preExistingIngredients.findIndex(x => x.id === value) !== -1;
  };

  const { scheduleNotification } = useNotifications(); 



  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  // User meals object
  const [updateUserMeal, { isLoading: isUpdateUserMealLoading }] =
    useUpdateUserMealMutation();
  // Create feedback to record food saved
  const [createFeedback, { isLoading: isCreateFeedbackLoading }] =
    useCreateFeedbackMutation();

  // Update user challenge with cooks and food saved
  const { getChallenges } = useContent();
  const [challenge, setChallenge] = useState<IChallenge>();
  const { data: userChallenge } = useGetUserChallengeQuery(
    challenge?.slug ? { slug: challenge.slug } : skipToken,
  );
  const [updateUserChallenge] = useUpdateUserChallengeMutation();

  const { data: userMeals } = useGetUserMealsQuery();

  const currentUserChallenge =
    userChallenge?.data?.challengeStatus === 'joined' ? userChallenge : null;

  const getChallengesData = async () => {
    // setIsLoading(true);
    const data = await getChallenges();

    if (data) {
      const currentChallenges = data.filter(challenge => {
        return moment().isBetween(
          moment(challenge.optInStartDate),
          moment(challenge.optInStartDate).add(60, 'days'),
        );
      });

      if (currentChallenges.length > 0) {
        setChallenge(currentChallenges[0]);
      }
    }
  };

  useEffect(() => {
    getChallengesData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStartCooking = async () => {
    const isLoading = isUpdateUserMealLoading || isCreateFeedbackLoading;

    if (isLoading) {
      return;
    }

    try {
      await updateUserMeal({
        id: mealId,
        completed: true,
        saved: true, // Use this for notifications
        data: {
          ingredients: ingredientsForComponents,
        },
      }).unwrap();

      await createFeedback({
        frameworkId,
        prompted: false, // Use it to still show feedback
        foodSaved: totalWeightOfSelectedIngredients / 1000,
        mealId,
      }).unwrap();

      if (currentUserChallenge) {
        await updateUserChallenge({
          slug: currentUserChallenge.slug,
          data: {
            ...currentUserChallenge.data,
            foodSaved:
              currentUserChallenge.data.foodSaved +
              totalWeightOfSelectedIngredients,
            noOfCooks: currentUserChallenge.data.noOfCooks + 1,
          },
        }).unwrap();
      }

      sendAnalyticsEvent({
        event: mixpanelEventName.actionClicked,
        properties: {
          location: newCurrentRoute,
          action: mixpanelEventName.cookCompleted,
          meal_id: frameworkId,
          meal_name: title,
          total_cooked: userMeals?.length,
          food_saved: `${totalWeightOfSelectedIngredients / 1000}Kg`,
          number_of_selected_ingredients: preExistingIngredients.length,
          selected_ingredients: preExistingIngredients,
        },
      });

      scheduleNotification({
        message: `How was your ${title ?? 'meal'}?`,
        delayInSeconds: 30 * 60, // 30 minutes
        url: `/survey/postmake/${mealId}`,
      });

      setIsVisible(false);
      setIsCompltedModalVisible(true);
      // setIsVisible(false);
    } catch (error: unknown) {
      Alert.alert(
        'Feedback create error. Try again later.',
        JSON.stringify(error),
      );
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible}>
      <View
        style={tw`z-10 flex-1 items-center justify-center bg-black bg-opacity-80 px-5`}
      >
        <Animatable.View
          animation="fadeInUp"
          duration={500}
          useNativeDriver
          style={tw`pb-7.5 w-full rounded-2lg border bg-white pt-2.5`}
        >
          <View style={tw`px-4`}>
            <Pressable
              onPress={() => setIsVisible(false)}
              style={tw.style('items-end')}
            >
              <Feather name="x" size={24} color={tw.color('black')} />
            </Pressable>
          </View>
          <View style={tw`px-6 py-4`}>
            <Text
              style={tw.style(h7TextStyle, 'pb-3 text-center')}
              maxFontSizeMultiplier={1}
            >
              Which ingredients were already in your kitchen?
            </Text>
            <Text
              style={tw.style(bodySmallRegular, 'text-center text-midgray')}
              maxFontSizeMultiplier={1}
            >
              This helps us estimate how much food you'll potentially save with
              this dish. If it's already in your kitchen and you're using it up,
              you’re saving it from the bin (and that’s a win win!).
            </Text>

            <ScrollView style={tw`my-5 max-h-[250px] overflow-hidden pb-5`}>
              {mealIngredients.map(ingredient => {
                return (
                  <Pressable
                    key={ingredient.id}
                    style={tw`flex-row items-center gap-2 py-3`}
                    onPress={() => {
                      SavefulHaptics.selectionAsync();

                      const valueIndex = preExistingIngredients.findIndex(
                        x => x.id === ingredient.id,
                      );

                      if (valueIndex === -1) {
                        setPreExistingIngredients([
                          ...preExistingIngredients,
                          ingredient,
                        ]);
                      } else {
                        const updatedArray = [...preExistingIngredients];
                        updatedArray.splice(valueIndex, 1);

                        setPreExistingIngredients(updatedArray);
                      }
                    }}
                  >
                    <View
                      style={tw.style(
                        'rounded border p-0.5',
                        isSelected(ingredient.id)
                          ? 'border-black'
                          : 'border-stone',
                      )}
                    >
                      <Feather
                        name="check"
                        size={12}
                        color={
                          isSelected(ingredient.id)
                            ? tw.color('black')
                            : tw.color('white')
                        }
                      />
                    </View>
                    <Text
                      style={tw.style(
                        subheadLargeUppercase,
                        isSelected(ingredient.id)
                          ? 'text-black'
                          : 'text-midgray',
                      )}
                    >
                      {ingredient.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <SecondaryButton
              onPress={onStartCooking}
              loading={isUpdateUserMealLoading || isCreateFeedbackLoading}
            >
              Next
            </SecondaryButton>
            <Pressable
              style={tw`mt-4`}
              onPress={() => {
                setPreExistingIngredients([]);
                // onStartCooking();
                setIsVisible(false);

                sendAnalyticsEvent({
                  event: mixpanelEventName.actionClicked,
                  properties: {
                    action: mixpanelEventName.exploreFramework,
                    meal_id: frameworkId,
                    meal_name: title,
                  },
                });
              }}
            >
              <Text style={tw`text-center text-midgray underline`}>
                I’m just exploring the framework
              </Text>
            </Pressable>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );
}


// //DEMO CODE

// // TODO: Replace with actual hooks from missing modules

// const scheduleNotification = (payload: any) => {
//   console.log('Simulated notification:', payload);
// };

// const updateUserMeal = async (payload: any) => {
//   console.log('Simulated updateUserMeal:', payload);
//   return { id: payload.id };
// };
// const isUpdateUserMealLoading = false;

// const createFeedback = async (payload: any) => {
//   console.log('Simulated createFeedback:', payload);
//   return true;
// };
// const isCreateFeedbackLoading = false;

// const getChallenges = async (): Promise<IChallenge[]> => {
//   console.log('Simulated getChallenges');
//   return [
//     {
//       id: '1',
//       slug: 'saveful-challenge',
//       title: 'Saveful Challenge',
//       uid: 'challenge-uid',
//       challengeBadge: [],
//       challengeShortDescription: '',
//       challengeDescription: '',
//       sponsor: [],
//       termsAndConditionsLink: '',
//       termsAndConditionsText: '',
//       challengeCompleteDescription: '',
//       challengeSocialShareImage: [],
//       incompleteChallengeMessage: '',
//       optInBannerMessage: '',
//       optInStartDate: '2025-09-01',
//       gracePeriodStartDate: '',
//       drawStartDate: '',
//       challengeEndDate: '',
//       challengeDuration: 60,
//       numberOfCooks: 0,
//       bonusAchievements: [],
//     },
//   ];
// };

// const updateUserChallenge = async (payload: any) => {
//   console.log('Simulated updateUserChallenge:', payload);
//   return true;
// };

// const userMeals: any[] = []; // 🔧 Simulated user meals

// export default function MakeItSurveyModal({
//   isVisible,
//   setIsVisible,
//   setIsCompltedModalVisible,
//   frameworkId,
//   title,
//   mealId,
//   ingredientsForComponents,
//   mealIngredients,
//   preExistingIngredients,
//   setPreExistingIngredients,
//   totalWeightOfSelectedIngredients,
// }: {
//   isVisible: boolean;
//   setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
//   setIsCompltedModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
//   frameworkId: string;
//   title: string;
//   mealId: string;
//   ingredientsForComponents: string[][];
//   mealIngredients: { id: string; title: string; averageWeight: number }[];
//   preExistingIngredients: { id: string; title: string; averageWeight: number }[];
//   setPreExistingIngredients: React.Dispatch<
//     React.SetStateAction<{ id: string; title: string; averageWeight: number }[]>
//   >;
//   totalWeightOfSelectedIngredients: number;
// }) {
//   const isSelected = (value: string | undefined) =>
//     preExistingIngredients.findIndex(x => x.id === value) !== -1;

//   const { sendAnalyticsEvent } = useAnalytics();
//   const { newCurrentRoute } = useCurentRoute();

//   const [challenge, setChallenge] = useState<IChallenge | null>(null);

//   // ✅ Explicitly typed simulated query result
//   const userChallenge: IChallenge | null =
//     challenge?.slug ? challenge : null;

//   // ✅ Explicitly typed conditional logic
//   const currentUserChallenge: IChallenge | null =
//     userChallenge?.slug && 'joined' === 'joined' ? userChallenge : null;

//   const getChallengesData = async () => {
//     const data = await getChallenges();
//     const currentChallenges = data.filter(challenge =>
//       new Date() >= new Date(challenge.optInStartDate) &&
//       new Date() <= new Date(new Date(challenge.optInStartDate).getTime() + 60 * 24 * 60 * 60 * 1000)
//     );

//     if (currentChallenges.length > 0) {
//       setChallenge(currentChallenges[0]);
//     }
//   };

//   useEffect(() => {
//     getChallengesData();
//   }, []);

//   const onStartCooking = async () => {
//     const isLoading = isUpdateUserMealLoading || isCreateFeedbackLoading;
//     if (isLoading) return;

//     try {
//       await updateUserMeal({
//         id: mealId,
//         completed: true,
//         saved: true,
//         data: { ingredients: ingredientsForComponents },
//       });

//       await createFeedback({
//         frameworkId,
//         prompted: false,
//         foodSaved: totalWeightOfSelectedIngredients / 1000,
//         mealId,
//       });

//       if (currentUserChallenge) {
//         await updateUserChallenge({
//           slug: currentUserChallenge.slug,
//           data: {
//             foodSaved:
//               totalWeightOfSelectedIngredients,
//             noOfCooks: 1,
//           },
//         });
//       }

//       sendAnalyticsEvent({
//         event: mixpanelEventName.actionClicked,
//         properties: {
//           location: newCurrentRoute,
//           action: mixpanelEventName.cookCompleted,
//           meal_id: frameworkId,
//           meal_name: title,
//           total_cooked: userMeals?.length,
//           food_saved: `${totalWeightOfSelectedIngredients / 1000}Kg`,
//           number_of_selected_ingredients: preExistingIngredients.length,
//           selected_ingredients: preExistingIngredients,
//         },
//       });

//       scheduleNotification({
//         message: `How was your ${title ?? 'meal'}?`,
//         delayInSeconds: 30 * 60,
//         url: `/survey/postmake/${mealId}`,
//       });

//       setIsVisible(false);
//       setIsCompltedModalVisible(true);
//     } catch (error: unknown) {
//       Alert.alert('Feedback create error. Try again later.', JSON.stringify(error));
//     }
//   };


//   return (
//     <Modal animationType="fade" transparent={true} visible={isVisible}>
//       <View style={tw`z-10 flex-1 items-center justify-center bg-black bg-opacity-80 px-5`}>
//         <Animatable.View
//           animation="fadeInUp"
//           duration={500}
//           useNativeDriver
//           style={tw`pb-7.5 w-full rounded-2lg border bg-white pt-2.5`}
//         >
//           <View style={tw`px-4`}>
//             <Pressable onPress={() => setIsVisible(false)} style={tw.style('items-end')}>
//               <Feather name="x" size={24} color={tw.color('black')} />
//             </Pressable>
//           </View>

//           <View style={tw`px-6 py-4`}>
//             <Text style={tw.style(h7TextStyle, 'pb-3 text-center')} maxFontSizeMultiplier={1}>
//               Which ingredients were already in your kitchen?
//             </Text>
//             <Text
//               style={tw.style(bodySmallRegular, 'text-center text-midgray')}
//               maxFontSizeMultiplier={1}
//             >
//               This helps us estimate how much food you'll potentially save with this dish.
//               If it's already in your kitchen and you're using it up, you’re saving it from
//               the bin (and that’s a win win!).
//             </Text>

//             <ScrollView style={tw`my-5 max-h-[250px] overflow-hidden pb-5`}>
//               {mealIngredients.map(ingredient => (
//                 <Pressable
//                   key={ingredient.id}
//                   style={tw`flex-row items-center gap-2 py-3`}
//                   onPress={() => {
//                     const valueIndex = preExistingIngredients.findIndex(
//                       x => x.id === ingredient.id,
//                     );

//                     if (valueIndex === -1) {
//                       setPreExistingIngredients([...preExistingIngredients, ingredient]);
//                     } else {
//                       const updatedArray = [...preExistingIngredients];
//                       updatedArray.splice(valueIndex, 1);
//                       setPreExistingIngredients(updatedArray);
//                     }
//                   }}
//                 >
//                   <View
//                     style={tw.style(
//                       'rounded border p-0.5',
//                       isSelected(ingredient.id) ? 'border-black' : 'border-stone',
//                     )}
//                   >
//                     <Feather
//                       name="check"
//                       size={12}
//                       color={
//                         isSelected(ingredient.id)
//                           ? tw.color('black')
//                           : tw.color('white')
//                       }
//                     />
//                   </View>
//                   <Text
//                     style={tw.style(
//                       subheadLargeUppercase,
//                       isSelected(ingredient.id) ? 'text-black' : 'text-midgray',
//                     )}
//                   >
//                     {ingredient.title}
//                   </Text>
//                 </Pressable>
//               ))}
//             </ScrollView>

//             <SecondaryButton
//               onPress={onStartCooking}
//               loading={isUpdateUserMealLoading || isCreateFeedbackLoading}
//             >
//               Next
//             </SecondaryButton>

//             <Pressable
//               style={tw`mt-4`}
//               onPress={() => {
//                 setPreExistingIngredients([]);
//                 setIsVisible(false);

//                 sendAnalyticsEvent({
//                   event: mixpanelEventName.actionClicked,
//                   properties: {
//                     action: mixpanelEventName.exploreFramework,
//                     meal_id: frameworkId,
//                     meal_name: title,
//                   },
//                 });
//               }}
//             >
//               <Text style={tw`text-center text-midgray underline`}>
//                 I’m just exploring the framework
//               </Text>
//             </Pressable>
//           </View>
//         </Animatable.View>
//       </View>
//     </Modal>
//   );
// }
