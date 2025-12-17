import { Feather } from '@expo/vector-icons';
import DebouncedPressable from '../../../common/components/DebouncePressable';
import tw from '../../../common/tailwind';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import {
  useCreateFavouriteMutation,
  useDeleteFavouriteMutation,
  useGetFavouritesQuery,
} from '../../../modules/track/api/api';
import React, { useState, useEffect }  from 'react';
import { Alert, Text, View } from 'react-native';
import { subheadLargeUppercase } from '../../../theme/typography';

export default function PrepFavorite({
  frameworkId,
  frameworkName,
}: {
  frameworkId: string;
  frameworkName: string;
}) {
  const { data: favourites, isLoading: isGetFavouritesLoading } =
    useGetFavouritesQuery();
  const [createFavourite, { isLoading: isCreateFavouriteLoading }] =
    useCreateFavouriteMutation();
  const [deleteFavourite, { isLoading: isDeleteFavouriteLoading }] =
    useDeleteFavouriteMutation();

  const { sendAnalyticsEvent, sendFailedEventAnalytics } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const isFavorite = favourites?.find(
    favourite => `${favourite.framework_id}` === frameworkId,
  );

  const onToggleFavourite = async () => {
    if (
      isGetFavouritesLoading ||
      isCreateFavouriteLoading ||
      isDeleteFavouriteLoading
    ) {
      return;
    }

    try {
      let result;
      if (isFavorite) {
        await deleteFavourite({
          id: isFavorite.id,
        }).unwrap();
        sendAnalyticsEvent({
          event: mixpanelEventName.actionClicked,
          properties: {
            location: newCurrentRoute,
            action: mixpanelEventName.removeFavoriteMeal,
            meal_id: frameworkId,
            meal_name: frameworkName,
          },
        });
      } else {
        result = await createFavourite({
          type: 'framework',
          frameworkId,
        }).unwrap();
        sendAnalyticsEvent({
          event: mixpanelEventName.actionClicked,
          properties: {
            location: newCurrentRoute,
            action: mixpanelEventName.saveFavoriteMeal,
            meal_id: frameworkId,
            meal_name: frameworkName,
          },
        });
      }

      if (result) {
        // setFavourite(result);
      }
    } catch (error: unknown) {
      sendFailedEventAnalytics(error);
      Alert.alert('Favourite create error', JSON.stringify(error));
    }
  };

  return (
    <DebouncedPressable onPress={onToggleFavourite}>
      <View style={tw.style('items-center pb-4')}>
        <View
          style={tw.style(
            'w-[220px] flex-row items-center justify-center rounded-full border px-3 py-[3px]',
            isFavorite ? 'border-eggplant bg-eggplant' : 'border-black',
          )}
        >
          <Feather
            name={'star'}
            size={16}
            color={isFavorite ? tw.color('lemon') : tw.color('black')}
          />
          <Text
            style={tw.style(
              subheadLargeUppercase,
              'ml-2',
              isFavorite ? 'text-lemon' : 'text-black',
            )}
            maxFontSizeMultiplier={1.5}
          >
            {isFavorite ? 'Saved' : 'Save this meal'}
          </Text>
        </View>
      </View>
    </DebouncedPressable>
  );
}


// export default function PrepFavorite({
//   frameworkId,
//   frameworkName,
// }: {
//   frameworkId: string;
//   frameworkName: string;
// }) {
//   const { sendAnalyticsEvent, sendFailedEventAnalytics } = useAnalytics();
//   const { newCurrentRoute } = useCurentRoute();

//   // 🔧 TEMPORARY state to simulate favourites
//   // TODO: Replace with useGetFavouritesQuery from modules/track/api/api
//   const [favourites, setFavourites] = useState<any[]>([]);
//   const [isGetFavouritesLoading, setIsGetFavouritesLoading] = useState(false);

//   // 🔧 Simulate fetching favourites
//   useEffect(() => {
//     setIsGetFavouritesLoading(true);
//     setTimeout(() => {
//       setFavourites([]); // TODO: Replace with actual fetched data
//       setIsGetFavouritesLoading(false);
//     }, 500);
//   }, []);

//   // 🔧 TEMPORARY loading states for mutations
//   // TODO: Replace with useCreateFavouriteMutation and useDeleteFavouriteMutation
//   const [isCreateFavouriteLoading, setIsCreateFavouriteLoading] = useState(false);
//   const [isDeleteFavouriteLoading, setIsDeleteFavouriteLoading] = useState(false);

//   const isFavorite = favourites.find(
//     favourite => `${favourite.framework_id}` === frameworkId,
//   );

//   const onToggleFavourite = async () => {
//     if (
//       isGetFavouritesLoading ||
//       isCreateFavouriteLoading ||
//       isDeleteFavouriteLoading
//     ) {
//       return;
//     }

//     try {
//       if (isFavorite) {
//         setIsDeleteFavouriteLoading(true);
//         // 🔧 Simulate delete mutation
//         setTimeout(() => {
//           setFavourites(prev => prev.filter(f => f.framework_id !== frameworkId));
//           setIsDeleteFavouriteLoading(false);
//         }, 500);

//         sendAnalyticsEvent({
//           event: mixpanelEventName.actionClicked,
//           properties: {
//             location: newCurrentRoute,
//             action: mixpanelEventName.removeFavoriteMeal,
//             meal_id: frameworkId,
//             meal_name: frameworkName,
//           },
//         });
//       } else {
//         setIsCreateFavouriteLoading(true);
//         // 🔧 Simulate create mutation
//         setTimeout(() => {
//           setFavourites(prev => [
//             ...prev,
//             { id: Date.now(), framework_id: frameworkId },
//           ]);
//           setIsCreateFavouriteLoading(false);
//         }, 500);

//         sendAnalyticsEvent({
//           event: mixpanelEventName.actionClicked,
//           properties: {
//             location: newCurrentRoute,
//             action: mixpanelEventName.saveFavoriteMeal,
//             meal_id: frameworkId,
//             meal_name: frameworkName,
//           },
//         });
//       }
//     } catch (error: unknown) {
//       sendFailedEventAnalytics(error);
//       Alert.alert('Favourite create error', JSON.stringify(error));
//     }
//   };

//   return (
//     <DebouncedPressable onPress={onToggleFavourite}>
//       <View style={tw.style('items-center pb-4')}>
//         <View
//           style={tw.style(
//             'w-[220px] flex-row items-center justify-center rounded-full border px-3 py-[3px]',
//             isFavorite ? 'border-eggplant bg-eggplant' : 'border-black',
//           )}
//         >
//           <Feather
//             name={'star'}
//             size={16}
//             color={isFavorite ? tw.color('lemon') : tw.color('black')}
//           />
//           <Text
//             style={tw.style(
//               subheadLargeUppercase,
//               'ml-2',
//               isFavorite ? 'text-lemon' : 'text-black',
//             )}
//             maxFontSizeMultiplier={1.5}
//           >
//             {isFavorite ? 'Saved' : 'Save this meal'}
//           </Text>
//         </View>
//       </View>
//     </DebouncedPressable>
//   );
// }

