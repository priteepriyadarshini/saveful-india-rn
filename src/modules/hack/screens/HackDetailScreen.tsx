import RenderHTML from 'react-native-render-html';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import frameworkDeepLink from '../../../common/helpers/frameworkDeepLink';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { IArticleContent } from '../../../models/craft';
import { h3TextStyle, tagStyles, subheadSmall } from '../../../theme/typography';
import useEnvironment from '../../environment/hooks/useEnvironment';
import AnimatedHacksHeader from '../components/AnimatedHacksHeader';
import AccordionBlock from '../components/blocks/AccordionBlock';
import HackOrTipBlock from '../components/blocks/HackOrTipBlock';
import ImageBlock from '../components/blocks/ImageBlock';
import ImageDetailsBlock from '../components/blocks/ImageDetailsBlock';
import ListBlock from '../components/blocks/ListBlock';
import TextBlock from '../components/blocks/TextBlock';
import VideoBlock from '../components/blocks/VideoBlock';
import HackFavorite from '../components/HackFavorite';
import HackSponsor from '../components/HackSponsor';
import { HackStackScreenProps } from '../navigation/HackNavigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';

const componentMap: Record<string, React.ComponentType<any>> = {
  articleBlocks_textBlock_BlockType: TextBlock,
  articleBlocks_imageBlock_BlockType: ImageBlock,
  articleBlocks_hackOrTipBlock_BlockType: HackOrTipBlock,
  articleBlocks_videoBlock_BlockType: VideoBlock,
  articleBlocks_listBlock_BlockType: ListBlock,
  articleBlocks_accordionBlock_BlockType: AccordionBlock,
  articleBlocks_imageDetailsBlock_BlockType: ImageDetailsBlock,
};

function ContentDisplay({ block }: { block: any }) {
  const Component = componentMap[block.__typename];

  if (Component) {
    return <Component block={block} />;
  }

  return null;
}

export default function HackDetailScreen({
  route: {
    params: { id },
  },
}: HackStackScreenProps<'HackDetail'>) {
  const offset = useRef(new Animated.Value(0)).current;
  const env = useEnvironment();
  const { getArticleContent } = useContent();
  const { sendScrollEventInitiation } = useAnalytics();
  const [article, setArticle] = useState<IArticleContent>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getArticleData = async () => {
    const data = await getArticleContent(id);

    if (data) {
      // Only hack article content
      setArticle(data);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getArticleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoizing HTML source to prevent re-renders
  const htmlSource = useMemo(
    () => ({ html: frameworkDeepLink(article?.description || '') }),
    [article?.description]
  );

  if (!article || isLoading) {
    return null;
  }

  return (
    <View style={tw`relative flex-1 bg-creme`}>
      <AnimatedHacksHeader animatedValue={offset} title={article.title} />
      <>
        {article.heroImage.length > 0 && (
          <Image
            source={bundledSource(
              article.heroImage[0].url,
              env.useBundledContent,
            )}
            resizeMode="cover"
            style={tw.style(
              `absolute top-0 w-[${
                Dimensions.get('window').width
              }px] bg-eggplant h-[${
                (Dimensions.get('screen').width * 260) / 375
              }px]`,
            )}
          />
        )}
        <View
          style={tw.style(
            `absolute top-0 w-[${
              Dimensions.get('window').width
            }px] bg-eggplant opacity-40 h-[${
              (Dimensions.get('screen').width * 260) / 375
            }px]`,
          )}
        />
      </>
      <ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: offset } } }],
          {
            useNativeDriver: false,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) =>
              sendScrollEventInitiation(event, 'Hack Details Interacted'),
          },
        )}
      >
        <View style={tw`z-10 w-full flex-1`}>
          <View style={tw`z-10 items-center px-5 pb-10`}>
            <Text
              numberOfLines={2}
              style={tw.style(h3TextStyle, 'pb-4 text-center text-white')}
            >
              {article.title}
            </Text>

            <HackFavorite id={article.id} />

            {article.sponsor && article.sponsor[0] && (
              <HackSponsor {...article.sponsor[0]} />
            )}
          </View>

          <View style={tw`bg-creme`}>
            <View style={tw`relative z-10 mt-7 gap-7`}>
              <RenderHTML
                // source={{
                //   html: frameworkDeepLink(article.description || ''),
                // }}
                source={htmlSource}
                contentWidth={225}
                tagsStyles={tagStyles}
                defaultViewProps={{
                  style: tw`m-0 shrink p-0`,
                }}
                defaultTextProps={{
                  style: tw.style(subheadSmall, 'mx-5'),
                }}
              />

              {article.articleBlocks.map((item, index) => {
                return <ContentDisplay key={index} block={item} />;
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
