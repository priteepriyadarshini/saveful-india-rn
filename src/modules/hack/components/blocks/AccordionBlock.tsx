import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { LayoutAnimation, Pressable, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import RenderHTML, { defaultSystemFonts } from 'react-native-render-html';
import frameworkDeepLink from '../../../../common/helpers/frameworkDeepLink';
import tw from '../../../../common/tailwind';
import { IArticleBlockList } from '../../../../models/craft';
import { 
  subheadMediumUppercase,
  bodyLargeMedium, 
  tagStyles 
} from '../../../../theme/typography';
import AccordionFramework from '../AccordionFramework';

export default function AccordionBlock({
  block,
}: {
  block: IArticleBlockList;
}) {
  const accordionsWithIsExpanded = block.accordion.map(
    (accordion: IArticleBlockList) => ({
      ...accordion,
      isExpanded: false,
    }),
  );

  const [accordions, setAccordions] = useState(accordionsWithIsExpanded);

  const toggleAccordion = (accordionId: number) => {
    /* Adding LayoutAnimation causes warning, trying to fix this  */
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAccordions((prevAccordions: any[]) =>
      prevAccordions.map(accordion =>
        accordion.id === accordionId
          ? { ...accordion, isExpanded: !accordion.isExpanded }
          : accordion,
      ),
    );
  };
  return (
    <View
      style={tw.style(
        'mx-5 rounded-2lg border border-strokecream bg-white px-5 py-2',
      )}
    >
      {accordions.map((accordion: any, index: number) => {
        return (
          <View style={tw.style('bg-white')} key={accordion.id}>
            <Pressable onPress={() => toggleAccordion(accordion.id)}>
              <View
                style={tw.style(
                  'flex-row justify-between bg-white py-4',
                  index === accordions.length - 1 || accordion.isExpanded
                    ? 'border-0'
                    : 'border-b border-strokecream',
                )}
              >
                <Text
                  style={tw.style(bodyLargeMedium, 'max-w-[252px] text-black')}
                >
                  {accordion.accordionTitle}
                </Text>
                <Feather
                  name={accordion.isExpanded ? 'x' : 'plus'}
                  size={24}
                  color={tw.color('black')}
                />
              </View>
            </Pressable>
            <Animatable.View
              style={tw.style(
                `${
                  accordion.isExpanded
                    ? `${
                        index === accordions.length - 1 ? '' : 'border-b'
                      } border-t border-strokecream bg-white  py-2.5`
                    : 'h-0 overflow-hidden'
                }`,
              )}
              duration={300}
            >
              <RenderHTML
                source={{
                  html: frameworkDeepLink(accordion.accordionText || ''),
                }}
                contentWidth={225}
                systemFonts={[
                  ...defaultSystemFonts,
                  'Saveful-Regular',
                  'Saveful-Bold',
                ]}
                tagsStyles={{
                  ...tagStyles,
                  b: tw.style('font-sans-bold text-black'),
                }}
                defaultViewProps={{
                  style: tw`m-0 shrink p-0`,
                }}
                defaultTextProps={{
                  style: tw.style(
                    `${tagStyles.li ? 'mb-2' : 'mb-6'} shrink text-midgray`,
                  ),
                }}
              />
              <View style={tw.style('pt-6')}>
                {accordion.accordionFramework.length > 0 && (
                  <View style={tw`gap-3`}>
                    <Text style={tw.style(subheadMediumUppercase)}>
                      featured framework:
                    </Text>
                    {accordion.accordionFramework.map((item: any) => {
                      return <AccordionFramework key={item.id} item={item} />;
                    })}
                  </View>
                )}
              </View>
            </Animatable.View>
          </View>
        );
      })}
    </View>
  );
}
