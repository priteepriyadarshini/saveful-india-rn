import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import tw from '../../../common/tailwind';
import { mixpanelEventName } from '../../analytics/analytics';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { bodyMediumRegular, bodySmallBold } from '../../../theme/typography';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FeedStackParamList } from '../navigation/FeedNavigation';

export default function Partners() {
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const onPartnersTapped = React.useCallback(() => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: mixpanelEventName.partnersOpened,
      },
    });
    navigation.navigate('Partners'); // Navigate to PartnersScreen
  }, [navigation, newCurrentRoute, sendAnalyticsEvent]);

  return (
    <View
      style={tw.style(
        'mx-5 mb-5 items-center rounded-[10px] border border-eggplant-vibrant bg-eggplant-vibrant',
      )}
    >
      <View
        style={tw.style(
          'w-full items-center rounded-t-[10px] bg-eggplant-vibrant py-[17px]',
        )}
      >
        <Text
          style={[
            tw.style(bodySmallBold, 'uppercase text-white'),
            { letterSpacing: 1 },
          ]}
        >
          our partners
        </Text>
      </View>
      <View
        style={tw.style('w-full items-center rounded-b-[10px] bg-white py-4')}
      >
        <View style={tw.style('max-w-[232px]')}>
          <Text style={tw.style(bodyMediumRegular, 'text-center text-midgray')}>
            We couldn’t serve you up Saveful without their support.
          </Text>
          <Pressable
            onPress={onPartnersTapped}
            style={tw.style('flex-row items-center justify-center pt-2')}
          >
            <Text
              style={[
                tw.style(bodySmallBold, 'pr-1 uppercase underline'),
                { letterSpacing: 1.5, },
              ]}
            >
              meet our partners
            </Text>
            <Feather name="arrow-right" size={16} color={tw.color('black')} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}