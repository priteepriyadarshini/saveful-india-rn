// import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
// import tw from '../../../common/tailwind';
// import useAccessToken from 'modules/auth/hooks/useSessionToken';
// import RotatingLoading from '../../../modules/intro/components/RotatingLoading';
// import { InitialNavigationStackParams } from '../../navigation/navigator/InitialNavigator';
// import React, { useEffect } from 'react';
// import { View } from 'react-native';

// type Mode = 'logged_out' | 'onboarding' | 'logged_in';

// export default function AppCallbacksScreen({
//   navigation,
// }: InitialNavigationStackParams<'AppCallbacks'>) {
//   const accessToken = useAccessToken();

//   let mode: Mode = 'logged_out';

//   if (!accessToken) {
//     mode = 'logged_out';
//   } else {
//     mode = 'logged_in';
//   }

//   useEffect(() => {
//     if (mode === 'logged_in') {
//       navigation.navigate('Onboarding');
//     }
//     if (mode === 'logged_out') {
//       navigation.navigate('Intro');
//     }
//   }, [mode, navigation]);

//   return (
//     <View style={tw`flex-1`}>
//       <View style={[tw.style('flex-1 items-center justify-center bg-radish')]}>
//         <RotatingLoading />
//       </View>
//       <FocusAwareStatusBar statusBarStyle="dark" />
//     </View>
//   );
// }
