import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import tw from '../../../common/tailwind';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import { useLoginMutation, useSignupMutation, SignupData } from '../../auth/api';
import { saveSessionData } from '../../auth/sessionSlice';
import { useAppDispatch } from '../../../store/hooks';
import { useLazyGetCurrentUserQuery } from '../../auth/api';
import { TokenManager } from '../../pushNotifications/TokenManager';
import { OneSignal } from 'react-native-onesignal';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { bodyMediumRegular, h6TextStyle } from '../../../theme/typography';

export default function AuthScreen() {
  const dispatch = useAppDispatch();
  const { sendAnalyticsUserID, sendAliasUserID } = useAnalytics();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();
  const [loadCurrentUser] = useLazyGetCurrentUserQuery();

  const handleAuth = async () => {
    try {
      console.log('Starting auth...', { isLogin, email });
      
      if (!email || !password) {
        Alert.alert('Error', 'Please enter email and password');
        return;
      }

      if (!isLogin && !name) {
        Alert.alert('Error', 'Please enter your name');
        return;
      }

      let result;
      
      if (isLogin) {
        console.log('Attempting login...');
        result = await login({ email, password }).unwrap();
        console.log('Login result:', result);
      } else {
        const signupData: SignupData = {
          email,
          password,
          name,
          phoneNumber: phoneNumber || undefined,
          stateCode: 'IN-DL', 
          vegType: 'OMNI',
        };
        console.log('Attempting signup...', signupData);
        result = await signup(signupData).unwrap();
        console.log('Signup result:', result);
      }

      console.log('Auth response:', result);

      if (result.success && result.accessToken) {
        // Save session data
        const sessionData = {
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        };
        await dispatch(saveSessionData(sessionData));

        // Load user data
        const user = await loadCurrentUser({
          accessToken: result.accessToken,
        }).unwrap();

        if (user) {
          // Initialize analytics
          sendAliasUserID(user.id);
          sendAnalyticsUserID(user.id, {
            id: user.id,
            first_name: user.first_name || name,
            email: user.email,
          });

          // Initialize push notifications (skip in Expo Go)
          try {
            TokenManager.shared.identifyUser(user);
            OneSignal.login(user.id);
            OneSignal.User.addEmail(user.email);
            if (user.first_name) {
              OneSignal.User.addTag('first_name', user.first_name);
            }
          } catch (error) {
            console.log('OneSignal not available (Expo Go)', error);
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert(
        'Authentication Failed',
        error?.data?.message || error?.message || 'Please check your credentials and try again'
      );
    }
  };

  const isLoading = isLoginLoading || isSignupLoading;

  return (
    <ImageBackground
      style={tw`relative flex-1 bg-creme`}
      source={require('../../../../assets/intro/splash.png')}
      imageStyle={{
        resizeMode: 'contain',
      }}
    >
      {/* Semi-transparent overlay for better visibility */}
      <View style={tw`absolute inset-0 bg-white/70`} />
      
      <SafeAreaView style={tw`flex-1`}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={tw`flex-1`}
        >
          <ScrollView 
            contentContainerStyle={tw`flex-grow px-5 pt-6`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={tw`items-center mb-8`}>
              <Image
                style={tw.style('h-[58px] w-[111px]')}
                resizeMode="contain"
                source={require('../../../../assets/intro/logo.png')}
              />
            </View>

            {/* Title */}
            <View style={tw`mb-8`}>
              <Text style={tw.style(h6TextStyle, 'text-center text-radish mb-2')}>
                {isLogin ? 'WELCOME BACK' : 'JOIN SAVEFUL'}
              </Text>
              <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
                {isLogin 
                  ? 'Sign in to continue your culinary journey' 
                  : 'Create your account to get started'}
              </Text>
            </View>

            {/* Form */}
            <View style={tw`gap-4 mb-6`}>
              {!isLogin && (
                <View>
                  <Text style={tw.style(bodyMediumRegular, 'text-stone mb-2')}>
                    Full Name *
                  </Text>
                  <TextInput
                    style={tw`bg-white rounded-xl px-4 py-3.5 text-base border-2 border-mint/30 focus:border-mint`}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              )}

              <View>
                <Text style={tw.style(bodyMediumRegular, 'text-stone mb-2')}>
                  Email Address *
                </Text>
                <TextInput
                  style={tw`bg-white rounded-xl px-4 py-3.5 text-base border-2 border-mint/30 focus:border-mint`}
                  placeholder="your@email.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>

              <View>
                <Text style={tw.style(bodyMediumRegular, 'text-stone mb-2')}>
                  Password *
                </Text>
                <TextInput
                  style={tw`bg-white rounded-xl px-4 py-3.5 text-base border-2 border-mint/30 focus:border-mint`}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  editable={!isLoading}
                />
              </View>

              {!isLogin && (
                <View>
                  <Text style={tw.style(bodyMediumRegular, 'text-stone mb-2')}>
                    Phone Number (Optional)
                  </Text>
                  <TextInput
                    style={tw`bg-white rounded-xl px-4 py-3.5 text-base border-2 border-mint/30 focus:border-mint`}
                    placeholder="+91 9876543210"
                    placeholderTextColor="#999"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                </View>
              )}
            </View>

            {/* Submit Button */}
            <View style={tw`mb-4`}>
              <PrimaryButton
                onPress={handleAuth}
                disabled={isLoading}
                buttonSize="large"
                width="full"
              >
                {isLoading ? (
                  <View style={tw`flex-row items-center justify-center gap-2`}>
                    <ActivityIndicator color="white" />
                    <Text style={tw`text-white font-bold`}>
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </Text>
                  </View>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </PrimaryButton>
            </View>

            {/* Toggle Login/Signup */}
            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              disabled={isLoading}
              style={tw`py-4 items-center`}
            >
              <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={tw`font-bold text-radish`}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <FocusAwareStatusBar statusBarStyle="dark" />
    </ImageBackground>
  );
}
