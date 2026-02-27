import { useLinkTo, useNavigation } from '@react-navigation/native';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import tw from '../../../common/tailwind';
import { IAsset, ISticker, ITag } from '../../../models/craft';
import { mixpanelEventName } from '../../analytics/analytics';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import useEnvironment from '../../environment/hooks/useEnvironment';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { cardDrop } from '../../../theme/shadow';
import { h5TextStyle, subheadMediumUppercase } from '../../../theme/typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InitialStackParamList } from '../../navigation/navigator/InitialNavigator';
import Svg, { Path } from 'react-native-svg';
import { recipeRatingApiService } from '../../recipeRating/api/recipeRatingApiService';

const CarrotIcon = ({ size = 14, filled = true }: { size?: number; filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36">
    <Path fill={filled ? '#77B255' : '#D1D5DB'} d="M31.096 8.933c3.535-2.122 4.408-8.32 3.701-7.613c.707-.707-5.657 0-7.778 3.536c0-1.414-1.414-7.071-3.535-2.121c-2.122 4.95-1.415 5.657-1.415 7.071c0 1.414 2.829 1.414 2.829 1.414s-.125 2.704 1.29 2.704c1.414 0 1.997.583 6.946-1.538c4.95-2.122-.624-3.453-2.038-3.453z" />
    <Path fill={filled ? '#F4900C' : '#D1D5DB'} d="M22.422 23.594C14.807 31.209 2.27 36.675.502 34.907c-1.768-1.768 3.699-14.305 11.313-21.92c7.615-7.615 11.53-7.562 14.85-4.243c3.319 3.32 3.372 7.235-4.243 14.85z" />
    <Path fill={filled ? '#D67503' : '#9CA3AF'} d="M21.875 14.56c-.972-.972-2.77-2.785-4.692-6.106a25.419 25.419 0 0 0-2.409 1.808c2.803 3.613 8.121 5.317 7.101 4.298zm-7.485 8.072c-1.041-1.041-3.03-3.05-5.105-6.846a48.86 48.86 0 0 0-1.98 2.57c2.807 3.597 8.101 5.292 7.085 4.276zm9.301-.351c-3.581-2.008-5.49-3.91-6.502-4.921c-1.02-1.022.692 4.315 4.317 7.114a94.795 94.795 0 0 0 2.185-2.193zm-12.183 9.324a54.359 54.359 0 0 0 2.715-1.597c-3.273-1.905-5.069-3.683-6.034-4.648c-.922-.923.386 3.347 3.319 6.245z" />
  </Svg>
);

const MealCard = React.memo(function MealCard({
  id,
  heroImage,
  title,
  variantTags,
  sticker,
  maxHeight = 0,
  setMaxHeight,
}: {
  id: string;
  heroImage: IAsset[];
  sticker?: ISticker[];
  title: string;
  variantTags: ITag[];
  maxHeight?: number;

  setMaxHeight?: (value: number) => void;
}) {
  const env = useEnvironment();
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    recipeRatingApiService.getRecipeRatingStats(id).then(stats => {
      if (!cancelled) {
        setAverageRating(stats.averageRating);
        setTotalRatings(stats.totalRatings);
      }
    });
    return () => { cancelled = true; };
  }, [id]);

  // const linkTo = useLinkTo();

  // Navigation prop
  type InitialNav = NativeStackNavigationProp<InitialStackParamList, 'Root'>;
  const navigation = useNavigation<InitialNav>();
  
  const onPress = useCallback(() => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: mixpanelEventName.mealViewed,
        meal_id: id,
        meal_name: title,
      },
    });

    // Derive slug directly from title — no network call needed before navigating
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    navigation.navigate('Root', {
      screen: 'Make',
      params: {
        screen: 'PrepDetail',
        params: { slug },
      },
    });
  }, [id, title, navigation, newCurrentRoute, sendAnalyticsEvent]);

  return (
    <Pressable
      style={[
        tw`w-full items-center gap-3 rounded border border-strokecream bg-white p-2.5 min-h-[${maxHeight}px]`,
        cardDrop,
      ]}
      onPress={onPress}
      onLayout={event => {
        const height = event.nativeEvent.layout.height;
        if (setMaxHeight && height > maxHeight) {
          setMaxHeight(height);
        }
      }}
    >
      {sticker && sticker.length > 0 && sticker[0]?.image?.[0]?.url && (
        <Image
          style={tw`absolute left-6 top-4 z-10 h-[120px] w-[109px] overflow-hidden`}
          contentFit="contain"
          source={{ uri: sticker[0].image[0].url }}
          cachePolicy="memory-disk"
          transition={200}
          accessibilityIgnoresInvertColors
        />
      )}
      <View
        style={tw`absolute right-3.5 top-3.5 z-20 flex-row items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5`}
        pointerEvents="none"
      >
        <CarrotIcon size={14} filled />
        {totalRatings > 0 && (
          <Text style={tw`text-[11px] font-sans-bold text-carrot`}>{averageRating.toFixed(1)}</Text>
        )}
      </View>
      {heroImage?.[0]?.url && (
        <Image
          style={tw`h-[${
            ((Dimensions.get('screen').width - 80) * 262) / 305
          }px] w-full overflow-hidden rounded`}
          contentFit="cover"
          source={{ uri: heroImage[0].url }}
          cachePolicy="memory-disk"
          transition={200}
          recyclingKey={id}
          accessibilityIgnoresInvertColors
        />
      )}

      <View style={tw`w-full items-center gap-2`}>
        <Text
          style={tw.style(h5TextStyle, 'text-center')}
          maxFontSizeMultiplier={1}
        >
          {title}
        </Text>
        {variantTags.length > 1 && (
          <Text style={tw.style(subheadMediumUppercase, 'text-stone')}>
            {`${variantTags.length} flavour variations`}
          </Text>
        )}
      </View>
    </Pressable>
  );
});

export default MealCard;
