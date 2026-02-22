import { useLinkTo, useNavigation } from '@react-navigation/native';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { IAsset, ISticker, ITag } from '../../../models/craft';
import { mixpanelEventName } from '../../analytics/analytics';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import useEnvironment from '../../environment/hooks/useEnvironment';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import React, { useCallback } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { cardDrop } from '../../../theme/shadow';
import { h5TextStyle, subheadMediumUppercase } from '../../../theme/typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InitialStackParamList } from '../../navigation/navigator/InitialNavigator';

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
  const { getFramework } = useContent();

  // const linkTo = useLinkTo();

  // Navigation prop
  type InitialNav = NativeStackNavigationProp<InitialStackParamList, 'Root'>;
  const navigation = useNavigation<InitialNav>();
  
  const onPress = useCallback(async () => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: mixpanelEventName.mealViewed,
        meal_id: id,
        meal_name: title,
      },
    });

    try {
      // Try new recipe API first
      const { recipeApiService } = await import('../../recipe/api/recipeApiService');
      const recipe = await recipeApiService.getRecipeById(id);
      
      if (recipe) {
        // Generate slug from recipe title
        const slug = recipe.title.toLowerCase().replace(/\s+/g, '-');
        navigation.navigate('Root', {
          screen: 'Make',
          params: {
            screen: 'PrepDetail',
            params: { slug },
          },
        });
        return;
      }
    } catch (error) {
      console.error('Error fetching recipe, falling back to framework:', error);
    }

    // Use API data
    const framework = await getFramework(id);
    if (framework) {
      //linkTo(`/make/prep/${framework.slug}`);
      navigation.navigate('Root', {
        screen: 'Make',
        params: {
          screen: 'PrepDetail',
          params: { slug: framework.slug },
        },
      });
    }
  }, [id, title, navigation, newCurrentRoute, sendAnalyticsEvent, getFramework]);

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
