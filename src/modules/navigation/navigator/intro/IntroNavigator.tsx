import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IntroScreen from '../../../intro/screens/IntroScreen';
import AuthScreen from '../../../intro/screens/AuthScreen';

import { IntroStackParamList } from './types';

const IntroNavigationStack = createNativeStackNavigator<IntroStackParamList>();

function IntroNavigator() {
  return (
    <IntroNavigationStack.Navigator
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
        name="Auth"
        component={AuthScreen}
        options={{ 
          headerShown: true,
          title: '',
          headerTransparent: true,
        }}
      />
    </IntroNavigationStack.Navigator>
  );
}

export default IntroNavigator;