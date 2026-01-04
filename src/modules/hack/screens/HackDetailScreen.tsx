import RenderHTML, { defaultSystemFonts } from 'react-native-render-html';
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
import { hackApiService, Hack as ApiHack, Sponsor as ApiSponsor } from '../api/hackApiService';
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

// Stable constants and visitors for RenderHTML to avoid frequent provider updates
const RENDERHTML_SYSTEM_FONTS = [
  ...defaultSystemFonts,
  'Saveful-Regular',
  'Saveful-Bold',
  'Saveful-Italic',
  'Saveful-BoldItalic',
];

const RENDERHTML_TAGS_STYLES = {
  ...tagStyles,
  b: { fontFamily: 'Saveful-Bold', color: '#1A1A1B' },
  strong: { fontFamily: 'Saveful-Bold', color: '#1A1A1B' },
  em: { fontFamily: 'Saveful-Italic', color: '#1A1A1B' },
  i: { fontFamily: 'Saveful-Italic', color: '#1A1A1B' },
};

const RENDERHTML_CLASSES_STYLES = {
  'sf-bold': { fontFamily: 'Saveful-Bold', color: '#1A1A1B' },
  'sf-italic': { fontFamily: 'Saveful-Italic', color: '#1A1A1B' },
  'sf-bolditalic': { fontFamily: 'Saveful-BoldItalic', color: '#1A1A1B' },
};

const RENDERHTML_DEFAULT_VIEW_PROPS = {
  style: tw`m-0 shrink p-0`,
};

const RENDERHTML_DEFAULT_TEXT_PROPS = {
  style: tw.style(subheadSmall, 'mx-5'),
};

const RENDERHTML_BASE_STYLE = {
  fontFamily: 'Saveful-Regular',
  color: '#575757',
};

const RENDERHTML_CONTENT_WIDTH = 225;

function addFontClassesVisitor(el: any) {
  if (el && el.type === 'tag') {
    const isItalic = el.name === 'em' || el.name === 'i';
    const isBold = el.name === 'strong' || el.name === 'b';
    const hasAncestor = (names: string[]) => {
      let p: any = el.parent;
      while (p) {
        if (p.type === 'tag' && names.includes(p.name)) return true;
        p = p.parent;
      }
      return false;
    };
    const style = el.attribs?.style || '';
    const isBoldStyle = /font-weight:\s*(?:700|bold)/i.test(style);
    const isItalicStyle = /font-style:\s*italic/i.test(style);
    const finalBold = isBold || isBoldStyle || hasAncestor(['strong', 'b']);
    const finalItalic = isItalic || isItalicStyle || hasAncestor(['em', 'i']);

    el.attribs = el.attribs || {};
    const cleanedStyle = style
      .replace(/font-family:[^;]+;?/gi, '')
      .replace(/font-weight:[^;]+;?/gi, '')
      .replace(/font-style:[^;]+;?/gi, '')
      .trim();
    if (cleanedStyle) {
      el.attribs.style = cleanedStyle.endsWith(';') ? cleanedStyle : `${cleanedStyle};`;
    } else if (el.attribs.style) {
      delete el.attribs.style;
    }
    const currentClass = el.attribs.class ? `${el.attribs.class} ` : '';
    if (finalBold && finalItalic) {
      el.attribs.class = `${currentClass}sf-bolditalic`;
    } else if (finalBold) {
      el.attribs.class = `${currentClass}sf-bold`;
    } else if (finalItalic) {
      el.attribs.class = `${currentClass}sf-italic`;
    }
  }
}

const RENDERHTML_DOM_VISITORS = {
  onElement: addFontClassesVisitor,
};

function ContentDisplay({ block }: { block: any }) {
  // Craft CMS blocks use __typename keys mapped above.
  const craftComponent = block.__typename && componentMap[block.__typename];
  if (craftComponent) {
    const Component = craftComponent;
    return <Component block={block} />;
  }

  // API blocks use a simple `type` field (e.g., 'text', 'video', 'image').
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />;
    case 'image':
      return <ImageBlock block={block} />;
    case 'video':
      return <VideoBlock block={block} />;
    case 'list':
      return <ListBlock block={block} />;
    case 'accordion':
      return <AccordionBlock block={block} />;
    case 'image_details':
      return <ImageDetailsBlock block={block} />;
    case 'hack_or_tip':
      return <HackOrTipBlock block={block} />;
    default:
      return null;
  }
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
  const [apiHack, setApiHack] = useState<ApiHack>();
  const [apiSponsor, setApiSponsor] = useState<ApiSponsor>();
  const [useApiData, setUseApiData] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getArticleData = async () => {
    try {
      // Try API first
      const apiData = await hackApiService.getHackById(id);
      if (apiData) {
        setApiHack(apiData);
        // Check if sponsorId is populated object
        if (apiData.sponsorId && typeof apiData.sponsorId === 'object') {
          setApiSponsor(apiData.sponsorId as ApiSponsor);
        } else if (apiData.sponsorId) {
          // sponsor present as ID; population handled elsewhere if needed
        }
        setUseApiData(true);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      // Fallback to Craft content
      // Silencing verbose logs; fallback will load Craft content
    }

    const data = await getArticleContent(id);
    if (data) {
      setArticle(data);
      setUseApiData(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getArticleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoizing HTML source to prevent re-renders
  const htmlSource = useMemo(() => {
    if (useApiData) {
      // Prefer leadText; fall back to description/shortDescription
      const html = apiHack?.leadText || apiHack?.description || apiHack?.shortDescription || '';
      return { html: frameworkDeepLink(html) };
    }
    return { html: frameworkDeepLink(article?.description || '') };
  }, [useApiData, apiHack?.leadText, apiHack?.description, apiHack?.shortDescription, article?.description]);

  if (isLoading) {
    return null;
  }

  return (
    <View style={tw`relative flex-1 bg-creme`}>
      <AnimatedHacksHeader animatedValue={offset} title={useApiData ? (apiHack?.title || '') : article!.title} />
      <>
        {useApiData ? (
          apiHack?.heroImageUrl ? (
            <Image
              source={{ uri: apiHack.heroImageUrl }}
              resizeMode="cover"
              style={tw.style(
                `absolute top-0 w-[${
                  Dimensions.get('window').width
                }px] bg-eggplant h-[${
                  (Dimensions.get('screen').width * 260) / 375
                }px]`,
              )}
            />
          ) : null
        ) : (
          article && article.heroImage.length > 0 ? (
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
          ) : null
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
              {useApiData ? (apiHack?.title || '') : article!.title}
            </Text>
            <HackFavorite id={useApiData ? (apiHack?._id || '') : article!.id} />

            {useApiData ? (
              apiSponsor?.logo ? (
                <View
                  style={tw.style(
                    'top-5 mx-auto mt-4 flex-row items-center justify-center rounded-2lg border border-strokecream bg-white px-5 py-2',
                  )}
                >
                  <Text style={tw.style('font-sans-semibold text-[10px] leading-tighter tracking-widest uppercase text-black', 'mr-2')}>
                    Brought to you by
                  </Text>
                  <Image
                    resizeMode="contain"
                    style={tw`mr-2.5 h-[32px] w-[61px] rounded-2lg`}
                    source={{ uri: apiSponsor.logo }}
                    accessibilityIgnoresInvertColors
                  />
                </View>
              ) : null
            ) : (
              article?.sponsor && article.sponsor[0] && (
                <HackSponsor {...article.sponsor[0]} />
              )
            )}
          </View>

          <View style={tw`bg-creme`}>
            <View style={tw`relative z-10 mt-7 gap-7`}>
              <RenderHTML
                source={htmlSource}
                contentWidth={RENDERHTML_CONTENT_WIDTH}
                tagsStyles={RENDERHTML_TAGS_STYLES}
                classesStyles={RENDERHTML_CLASSES_STYLES}
                systemFonts={RENDERHTML_SYSTEM_FONTS}
                baseStyle={RENDERHTML_BASE_STYLE}
                domVisitors={RENDERHTML_DOM_VISITORS}
                defaultViewProps={RENDERHTML_DEFAULT_VIEW_PROPS}
                defaultTextProps={RENDERHTML_DEFAULT_TEXT_PROPS}
              />
              {(useApiData ? apiHack?.articleBlocks || [] : article!.articleBlocks).map((item, index) => {
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
