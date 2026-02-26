// import React, { useEffect } from 'react';
// import { Image, StyleSheet, View } from 'react-native';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';

// export default function SplashScreen({ navigation }: Props) {
//   useEffect(() => {
//     const timer = setTimeout(() => navigation.replace('Loading'), 1000);
//     return () => clearTimeout(timer);
//   }, [navigation]);

//   return (
//     <View style={styles.container}>
//       <Image
//         source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/splash.png' }}
//         style={styles.image}
//         resizeMode="cover"
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//   },
// });

import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAccessToken from '../../auth/hooks/useSessionToken';
import { useGetUserOnboardingQuery } from '../api/api';
import { useGetCurrentUserQuery } from '../../auth/api';

const HAS_SEEN_INTRO_KEY = '@saveful_has_seen_intro';

export default function SplashPage() {
  const navigation = useNavigation();
  const accessToken = useAccessToken();
  const [hasNavigated, setHasNavigated] = useState(false);
  
  const { data: userOnboarding, isLoading: isOnboardingLoading } = useGetUserOnboardingQuery(
    undefined,
    { 
      skip: !accessToken,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: currentUser, isLoading: isUserLoading } = useGetCurrentUserQuery(
    undefined,
    {
      skip: !accessToken,
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    let isMounted = true;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    
    const navigateToAppropriateScreen = async () => {
      try {
        // Ensure minimum splash screen duration
        const startTime = Date.now();
        const minimumDisplayTime = 1500;
        const maxWaitTime = 4000; // Hard fallback to avoid getting stuck

        // If user is authenticated, wait for both user and onboarding data to load
        if (accessToken && (isOnboardingLoading || isUserLoading)) {
          // Data still loading, will retry when isOnboardingLoading changes
          // Set a hard fallback to navigate after maxWaitTime even if loading hangs
          if (!fallbackTimer) {
            fallbackTimer = setTimeout(() => {
              if (!isMounted || hasNavigated) return;
              const targetRoute = accessToken ? 'Root' : 'Auth';
              setHasNavigated(true);
              (navigation as any).reset({
                index: 0,
                routes: [{ name: targetRoute }],
              });
            }, maxWaitTime);
          }
          return;
        }

        // Calculate remaining time to show splash screen
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minimumDisplayTime - elapsedTime);
        
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        // Double check component is still mounted
        if (!isMounted || hasNavigated) return;

        // Determine target route
        let targetRoute: string;
        
        if (accessToken) {
          // User is authenticated
          const hasCompletedOnboarding = !!(currentUser?.country || userOnboarding);
          targetRoute = hasCompletedOnboarding ? 'Root' : 'Onboarding';
        } else {
          // User is not authenticated - check if first time
          const hasSeenIntro = await AsyncStorage.getItem(HAS_SEEN_INTRO_KEY);
          targetRoute = hasSeenIntro === 'true' ? 'Auth' : 'Intro';
        }

        setHasNavigated(true);
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
        }
        (navigation as any).reset({
          index: 0,
          routes: [{ name: targetRoute }],
        });
        
      } catch (error) {
        console.error('Navigation error:', error);
        if (!isMounted || hasNavigated) return;
        
        setHasNavigated(true);
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
        }
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    };

    navigateToAppropriateScreen();
    
    return () => {
      isMounted = false;
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };
  }, [accessToken, userOnboarding, isOnboardingLoading, navigation, hasNavigated]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/splash.png' }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF3',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export { HAS_SEEN_INTRO_KEY };