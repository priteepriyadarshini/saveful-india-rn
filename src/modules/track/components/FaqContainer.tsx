import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { mixpanelEventName } from '../../analytics/analytics';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import { FAQ } from '../data/data';
import { useState } from 'react';
import { LayoutAnimation, Pressable, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { bodyLargeMedium, subheadLargeUppercase } from '../../../theme/typography';

export default function FaqContainer() {
  const [accordions, setAccordions] = useState(FAQ);
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const toggleAccordion = (accordionId: number) => {
    /* Adding LayoutAnimation causes warning, trying to fix this  */
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAccordions(prevAccordions =>
      prevAccordions.map(accordion =>
        accordion.id === accordionId
          ? { ...accordion, isExpanded: !accordion.isExpanded }
          : accordion,
      ),
    );
    // Send a Mixpanel event when the accordion is expanded
    if (!accordions[accordionId].isExpanded) {
      const expandedAccordionTitle = accordions[accordionId].title;
      sendAnalyticsEvent({
        event: mixpanelEventName.actionClicked,
        properties: {
          location: newCurrentRoute,
          action: mixpanelEventName.faqExpanded,
          title: expandedAccordionTitle,
        },
      });
    }
  };

  return (
    <View>
      <Text style={tw.style(subheadLargeUppercase, 'mb-3 text-midgray')}>
        FAQ
      </Text>
      <View
        style={tw.style(
          'rounded-2lg border border-strokecream bg-white px-5 py-2',
        )}
      >
        {accordions.map((accordion, index) => {
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
                    style={tw.style(
                      bodyLargeMedium,
                      'max-w-[252px] text-black',
                    )}
                  >
                    {accordion.title}
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
                <Text>{accordion.description}</Text>
              </Animatable.View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
