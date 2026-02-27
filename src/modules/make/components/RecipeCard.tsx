import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import tw from '../../../common/tailwind';
import { IAsset, ITag } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import useEnvironment from '../../../modules/environment/hooks/useEnvironment';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import { cardDrop } from '../../../theme/shadow';
import {
  h5TextStyle,
  subheadMediumUppercase,
  subheadSmallUppercase,
} from '../../../theme/typography';
import { IngredientsStackParamList } from '../../ingredients/navigation/IngredientsNavigator';

type IngredientsNavigationProp =
  NativeStackNavigationProp<IngredientsStackParamList, "IngredientsResults">;

export default function RecipeCard({
  id,
  title,
  heroImage,
  variantTags,
  cardStyle,
  kind,
  maxHeight = 0,
  setMaxHeight,
}: {
  id: string;
  title: string;
  heroImage: IAsset[];
  kind?: string[];
  variantTags: ITag[];
  cardStyle?: any;
  maxHeight?: number;
  setMaxHeight?: (value: number) => void;
}) {
  const env = useEnvironment();
  const navigation = useNavigation<IngredientsNavigationProp>();
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const onMakeIt = React.useCallback(
  (_id: string) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    navigation.navigate('PrepDetail', { slug });
  },
  [navigation, title],
);

  return (
    <Pressable
      onPress={() => {
        sendAnalyticsEvent({
          event: mixpanelEventName.actionClicked,
          properties: {
            action: mixpanelEventName.mealViewed,
            location: newCurrentRoute,
            meal_id: id,
            meal_title: title,
          },
        });
        onMakeIt(id);
      }}
      style={tw.style(cardStyle)}
    >
      <View
        style={[
          tw`pt-5.5 overflow-hidden rounded border border-strokecream bg-white p-4 min-h-[${maxHeight}px]`,
          cardDrop,
        ]}
        onLayout={event => {
          const height = event.nativeEvent.layout.height;
          if (setMaxHeight && height > maxHeight) {
            setMaxHeight(height);
          }
        }}
      >
        {heroImage?.[0]?.url && (
          <Image
            style={[tw`h-[262px] w-full overflow-hidden rounded`]}
            contentFit="cover"
            source={bundledSource(heroImage[0].url, env.useBundledContent)}
            cachePolicy="memory-disk"
            transition={200}
            accessibilityIgnoresInvertColors
          />
        )}

        <View style={tw`mt-3`}>
          <Text 
            style={tw.style(h5TextStyle, 'text-center')}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {variantTags.length > 0 && (
            <Text
              style={tw.style(
                subheadMediumUppercase,
                'mt-1.5 text-center text-stone',
              )}
            >
              {variantTags.length} flavour{' '}
              {variantTags.length === 1 ? 'guide' : 'guides'}
            </Text>
          )}
        </View>

        <View style={tw`mt-3 border-t border-strokecream pt-3.5`}>
          <Text
            style={tw.style(
              subheadSmallUppercase,
              'mb-2.5 text-center text-midgray',
            )}
          >
            This meal uses :
          </Text>

          <View style={tw`flex-row flex-wrap justify-center gap-1`}>
            {kind?.map((kindItem, index) => (
              <View
                key={index}
                style={tw`rounded-lg bg-strokecream px-2 py-0.5`}
              >
                <Text style={tw.style(subheadSmallUppercase)}>{kindItem}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
