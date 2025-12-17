import tw from '../../../common/tailwind';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { MakeStackScreenProps } from '../../make/navigation/MakeNavigation';
import React from 'react';
import { Button, Text, View } from 'react-native';
import { bodyMediumRegular, h1TextStyle } from '../../../theme/typography';

export default function FrameworkNotFoundScreen({
  navigation,
  route,
}: MakeStackScreenProps<'FrameworkNotFound'>) {
  const { sendAnalyticsEvent } = useAnalytics();

  const onBackToHomePress = React.useCallback(() => {
    navigation.navigate('MakeHome');
  }, [navigation]);

  React.useEffect(() => {
    if (!route.path) {
      return;
    }

    sendAnalyticsEvent({
      event: 'Framework Not Found',
      properties: {
        path: route.path,
      },
    });
  }, [route.path, sendAnalyticsEvent]);

  return (
    <View style={tw`px-4.5 flex-1 items-center justify-center bg-white`}>
      <Text style={tw.style(h1TextStyle, 'text-center')}>
        Framework Not Found
      </Text>
      <Text style={tw.style(bodyMediumRegular, 'mb-10 mt-5 text-center')}>
        Oops can’t find this framework, please ensure you’ve got the latest
        version of the app!
      </Text>

      <Button
        onPress={onBackToHomePress}
        title={navigation.canGoBack() ? 'Go back' : 'Back to Start'}
      />
    </View>
  );
}
