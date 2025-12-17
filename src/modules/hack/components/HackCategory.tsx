import { useLinkTo, useNavigation } from '@react-navigation/native';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import React, { useEffect, useState } from 'react';
import { Image, Text } from 'react-native';
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



export default function HackCategory({ item }: { item: ICategory }) {
  const env = useEnvironment();
  //const linkTo = useLinkTo();
   
  const navigation = useNavigation<NativeStackNavigationProp<HackStackParamList>>();

  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  const [articles, setArticles] = useState<IArticleContent[]>([]);
  const [videos, setVideos] = useState<IVideoContent[]>([]);

  const { getArticleContents, getVideoContents } = useContent();

  const getArticlesData = async (id: string) => {
    const data = await getArticleContents();

    if (data) {
      setArticles(data.filter(item => item.hackCategory[0].id === id));
    }
  };

  const getVideosData = async (id: string) => {
    const data = await getVideoContents();

    if (data) {
      setVideos(data.filter(item => item.hackCategory[0].id === id));
    }
  };

  useEffect(() => {
    getArticlesData(item.id);
    getVideosData(item.id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const data = [...articles, ...videos];

  return (
    <>
      {data.length > 0 && (
        <DebouncedPressable
          onPress={() => {
            sendAnalyticsEvent({
              event: mixpanelEventName.actionClicked,
              properties: {
                location: newCurrentRoute,
                action: mixpanelEventName.hackCategoryOpened,
                id: item.id,
                hackTitle: item.title,
              },
            });
            //linkTo(`/hacks/${item.id}`);
            navigation.navigate('HackCategory', { id: item.id });

          }}
          style={tw.style(
            'mx-5 my-2 items-center rounded-2lg border border-strokecream bg-white p-6',
            cardDrop,
          )}
        >
          {item.image && (
            <Image
              style={tw`h-[160px] w-[179px]`}
              resizeMode="contain"
              source={bundledSource(item.image[0].url, env.useBundledContent)}
            />
          )}
          <Text style={tw.style(h5TextStyle, 'pt-5 text-center')}>
            {item.title}
          </Text>
          <Text style={tw.style(subheadMediumUppercase, 'pt-1 text-stone')}>
            {data.length} Hacks
          </Text>
        </DebouncedPressable>
      )}
    </>
  );
}
