import { AntDesign } from '@expo/vector-icons';
import DebouncedPressable from '../../../common/components/DebouncePressable';
import tw from '../../../common/tailwind';
import {
  useCreateFavouriteMutation,
  useDeleteFavouriteMutation,
  useGetFavouritesQuery,
} from '../../../modules/track/api/api';
import React from 'react';
import { Text, View } from 'react-native';
import {
  subheadLargeUppercase,
  subheadMediumUppercase,
} from '../../../theme/typography';

export default function HackFavorite({
  id,
  dark = false,
}: {
  id: string;
  dark?: boolean;
}) {
  const { data: favourites, isLoading: isGetFavouritesLoading } =
    useGetFavouritesQuery();
  const [createFavourite, { isLoading: isCreateFavouriteLoading }] =
    useCreateFavouriteMutation();
  const [deleteFavourite, { isLoading: isDeleteFavouriteLoading }] =
    useDeleteFavouriteMutation();

  const isFavorite = favourites?.find(
    favourite => favourite.framework_id === id && favourite.type === 'hack',
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
      } else {
        result = await createFavourite({
          type: 'hack',
          frameworkId: id,
        }).unwrap();
      }

      if (result) {
        // setFavourite(result);
      }
    } catch (error: unknown) {
      console.log('Favourite create error', JSON.stringify(error));
    }
  };

  // const onToggleFavourite = async () => {
  //   setIsFavorite(!isFavorite);
  // };

  // const [isFavorite, setIsFavorite] = React.useState<boolean>(false);

  return (
    <DebouncedPressable onPress={onToggleFavourite}>
      <View
        style={tw.style(
          'flex-row items-center justify-center rounded-full',
          dark
            ? 'bg-strokecream px-4 py-1'
            : 'border border-white px-4 py-[3px]',
        )}
      >
        <AntDesign
          name={isFavorite ? 'heart' : 'hearto'}
          size={16}
          color={dark ? tw.color('black') : tw.color('white')}
        />
        <Text
          style={tw.style(
            dark ? subheadMediumUppercase : subheadLargeUppercase,
            'ml-2',
            dark ? 'text-black' : 'text-white',
          )}
          maxFontSizeMultiplier={1.5}
        >
          {isFavorite ? 'Saved' : 'Save'}
        </Text>
      </View>
    </DebouncedPressable>
  );
}
