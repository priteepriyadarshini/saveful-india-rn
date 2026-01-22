import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IntroScreen from '../../../intro/screens/IntroScreen';
import AuthScreen from '../../../intro/screens/AuthScreen';
import OTPVerificationScreen from '../../../intro/screens/OTPVerificationScreen';

import { IntroStackParamList } from './types';

const IntroNavigationStack = createNativeStackNavigator<IntroStackParamList>();

function IntroNavigator() {
  return (
    <IntroNavigationStack.Navigator
      initialRouteName="AuthScreen"
      screenOptions={{
        headerTransparent: true,
        headerTintColor: '#000000',
        headerBackTitle: '',
      }}
    >
      <IntroNavigationStack.Screen
        name="IntroHome"
        component={IntroScreen}
        options={{ headerShown: false }}
      />
      <IntroNavigationStack.Screen
        name="AuthScreen"
        component={AuthScreen}
        options={{ 
          headerShown: false,
          title: '',
        }}
      />
      <IntroNavigationStack.Screen
        name="OTPVerificationScreen"
        component={OTPVerificationScreen}
        options={{ 
          headerShown: false,
          title: '',
        }}
      />
    </IntroNavigationStack.Navigator>
  );
}

export default IntroNavigator;