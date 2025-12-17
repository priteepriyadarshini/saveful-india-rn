// import tw from '../../../common/tailwind';
// import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
// import useAccessToken from 'modules/auth/hooks/useSessionToken';
// import { InitialNavigationStackParams } from '../../navigation/navigator/InitialNavigator';
// import React from 'react';
// import { Button, Text, View } from 'react-native';
// import { bodyMediumRegular, h1TextStyle } from '../../../theme/typography';

// export default function NotFoundScreen({
//   navigation,
//   route,
// }: InitialNavigationStackParams<'NotFound'>) {
//   const accessToken = useAccessToken();
//   const { sendAnalyticsEvent } = useAnalytics();

//   const onBackToHomePress = React.useCallback(() => {
//     if (navigation.canGoBack()) {
//       navigation.goBack();
//       return;
//     }

//     navigation.reset({
//       index: 0,
//       routes: [{ name: accessToken ? 'Root' : 'Onboarding' }],
//     });
//   }, [accessToken, navigation]);

//   React.useEffect(() => {
//     if (!route.path) {
//       return;
//     }

//     sendAnalyticsEvent({
//       event: 'Path Not Found',
//       properties: {
//         path: route.path,
//       },
//     });
//   }, [route.path, sendAnalyticsEvent]);

//   return (
//     <View style={tw`px-4.5 flex-1 items-center justify-center bg-white`}>
//       <Text style={tw.style(h1TextStyle, 'text-center')}>Screen Not Found</Text>
//       <Text style={tw.style(bodyMediumRegular, 'mb-10 mt-5 text-center')}>
//         The screen you are looking for doesn't exist or has been moved.
//       </Text>

//       <Button
//         onPress={onBackToHomePress}
//         title={navigation.canGoBack() ? 'Go back' : 'Back to Start'}
//       />
//     </View>
//   );
// }
