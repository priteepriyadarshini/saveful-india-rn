import { useLinkTo, useNavigation } from '@react-navigation/native';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import DebouncedPressable from '../../../common/components/DebouncePressable';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { ICategory, IArticleContent, IVideoContent } from '../../../models/craft';
import { cardDrop } from '../../../theme/shadow';
import { h5TextStyle, subheadMediumUppercase } from '../../../theme/typography';
import { mixpanelEventName } from '../../analytics/analytics';
import useEnvironment from '../../environment/hooks/useEnvironment';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HackStackParamList } from '../navigation/HackNavigation';
import { HackCategory as ApiHackCategory, hackApiService } from '../api/hackApiService';

interface HackCategoryProps {
  item: ICategory | ApiHackCategory;
  useApiData?: boolean;
}

export default function HackCategory({ item, useApiData = false }: HackCategoryProps) {
  const env = useEnvironment();
  const navigation = useNavigation<NativeStackNavigationProp<HackStackParamList>>();

  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  const [articles, setArticles] = useState<IArticleContent[]>([]);
  const [videos, setVideos] = useState<IVideoContent[]>([]);
  const [hackCount, setHackCount] = useState<number>(0);

  const { getArticleContents, getVideoContents } = useContent();

  const getStaticContentData = async (id: string) => {
    const articleData = await getArticleContents();
    const videoData = await getVideoContents();

    if (articleData) {
      setArticles(articleData.filter(item => item.hackCategory[0].id === id));
    }

    if (videoData) {
      setVideos(videoData.filter(item => item.hackCategory[0].id === id));
    }
  };

  const getApiContentData = async (categoryId: string) => {
    try {
      const response = await hackApiService.getCategoryWithHacks(categoryId);
      if (response && response.hacks) {
        setHackCount(response.hacks.length);
      } else {
        setHackCount(0);
      }
    } catch (error) {
      setHackCount(0);
    }
  };

  useEffect(() => {
    if (useApiData) {
      const apiItem = item as ApiHackCategory;
      const categoryId = apiItem._id || apiItem.id || '';
      getApiContentData(categoryId);
    } else {
      const staticItem = item as ICategory;
      getStaticContentData(staticItem.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useApiData]);

  const data = [...articles, ...videos];
  const totalCount = useApiData ? hackCount : data.length;

  // Don't render if no content (only for static data)
  if (!useApiData && data.length === 0) {
    return null;
  }

  // Always render API categories, even with 0 hacks

  const handlePress = () => {
    const apiItem = item as ApiHackCategory;
    const staticItem = item as ICategory;
    const itemId = useApiData ? (apiItem._id || apiItem.id) : staticItem.id;
    const itemTitle = useApiData ? apiItem.name : staticItem.title;

    if (!itemId) return;

    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: mixpanelEventName.hackCategoryOpened,
        id: itemId,
        hackTitle: itemTitle,
      },
    });
    navigation.navigate('HackCategory', { id: itemId });
  };

  const renderCategoryContent = () => {
    if (useApiData) {
      const apiItem = item as ApiHackCategory;
      return (
        <>
          {apiItem.iconImageUrl && (
            <Image
              style={tw`h-[160px] w-[179px]`}
              resizeMode="contain"
              source={{ uri: apiItem.iconImageUrl }}
            />
          )}
          <Text style={tw.style(h5TextStyle, 'pt-5 text-center')}>
            {apiItem.name}
          </Text>
          <Text style={tw.style(subheadMediumUppercase, 'pt-1 text-stone')}>
            {totalCount} Hacks
          </Text>
        </>
      );
    } else {
      const staticItem = item as ICategory;
      return (
        <>
          {staticItem.image && (
            <Image
              style={tw`h-[160px] w-[179px]`}
              resizeMode="contain"
              source={bundledSource(staticItem.image[0].url, env.useBundledContent)}
            />
          )}
          <Text style={tw.style(h5TextStyle, 'pt-5 text-center')}>
            {staticItem.title}
          </Text>
          <Text style={tw.style(subheadMediumUppercase, 'pt-1 text-stone')}>
            {totalCount} Hacks
          </Text>
        </>
      );
    }
  };

    return (
      <DebouncedPressable
        onPress={handlePress}
        style={tw.style(
          'mx-5 my-2 items-center rounded-2lg border border-strokecream bg-white p-6',
          cardDrop
        )}
      >
        {renderCategoryContent()}
      </DebouncedPressable>
    );
  }
