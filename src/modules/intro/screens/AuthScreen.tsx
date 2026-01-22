import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import { useLoginMutation, useRequestOTPMutation, SignupData } from '../../auth/api';
import { saveSessionData } from '../../auth/sessionSlice';
import { useAppDispatch } from '../../../store/hooks';
import { useLazyGetCurrentUserQuery } from '../../auth/api';
import { TokenManager } from '../../pushNotifications/TokenManager';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { bodyMediumRegular, h6TextStyle } from '../../../theme/typography';
export default function AuthScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { sendAnalyticsUserID, sendAliasUserID } = useAnalytics();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [requestOTP, { isLoading: isRequestingOTP }] = useRequestOTPMutation();
  const [loadCurrentUser] = useLazyGetCurrentUserQuery();

  const handleAuth = async () => {
    try {
      console.log('Starting auth...', { isLogin, email });
      
      if (!email || !password) {
        Alert.alert('Error', 'Please enter email and password');
        return;
      }

      if (!isLogin) {
        // Signup flow - request OTP
        if (!name) {
          Alert.alert('Error', 'Please enter your name');
          return;
        }

        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }

        if (password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters');
          return;
        }

        console.log('Requesting OTP for signup...');
        const result = await requestOTP({
          email,
          password,
          confirmPassword,
          name,
          stateCode: 'IN-DL',
          vegType: 'OMNI',
        }).unwrap();
        
        console.log('OTP request result:', result);

        if (result.success) {
          Alert.alert(
            'OTP Sent',
            `A verification code has been sent to ${email}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate to OTP verification screen with all signup data
                  navigation.navigate('OTPVerificationScreen', { 
                    email, 
                    name,
                    password,
                    confirmPassword,
                    stateCode: 'IN-DL',
                    vegType: 'OMNI',
                  });
                },
              },
            ]
          );
        }
      } else {
        // Login flow - direct login
        console.log('Attempting login...');
        const result = await login({ email, password }).unwrap();
        console.log('Login result:', result);

        if (result.success && result.accessToken) {
          console.log('✅ Auth successful, saving session...');
          // Save session data
          const sessionData = {
            access_token: result.accessToken,
            refresh_token: result.refreshToken,
          };
          await dispatch(saveSessionData(sessionData));
          console.log('✅ Session saved');

          // Load user data - make this optional to prevent crash
          try {
            console.log('📡 Fetching user data from /api/auth/me...');
            const user = await loadCurrentUser({
              accessToken: result.accessToken,
            }).unwrap();
            console.log('✅ User data received:', user);

            if (user) {
              // Initialize analytics
              try {
                sendAliasUserID(user.id);
                sendAnalyticsUserID(user.id, {
                  id: user.id,
                  first_name: user.first_name || name,
                  email: user.email,
                });
              } catch (analyticsError) {
                console.log('Analytics error (non-critical):', analyticsError);
              }

              console.log('✅ Authentication completed successfully');
            }
          } catch (userError: any) {
            console.error('❌ Failed to load user data:', userError);
            console.error('Error details:', {
              status: userError.status,
              data: userError.data,
              message: userError.message
            });
            
            // Don't block login if user data fetch fails
            // The session is already saved, so user should still be logged in
            console.log('⚠️ Continuing with login despite user data fetch failure');
            Alert.alert(
              'Notice',
              'Login successful! Some profile data may be unavailable.',
              [{ text: 'OK' }]
            );
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

  const isLoading = isLoginLoading || isRequestingOTP;

  return (
    <ImageBackground
      style={tw`relative flex-1 bg-creme`}
      source={require('../../../../assets/intro/splash.png')}
      imageStyle={{
        resizeMode: 'contain',
      }}
    >
      <SafeAreaView style={tw`flex-1 justify-between pb-2.5 pt-6`}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={tw`flex-1`}
        >
          <ScrollView 
            contentContainerStyle={tw`flex-grow justify-between`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={tw`items-center pt-4 pb-4`}>
              <Image
                style={tw.style('h-[58px] w-[111px]')}
                resizeMode="contain"
                source={require('../../../../assets/intro/logo.png')}
              />
            </View>

            {/* Form Card */}
            <View style={tw`mx-5 bg-white rounded-3xl px-5 py-5 shadow-lg mb-6`}>
              {/* Title */}
              <View style={tw`mb-4`}>
                <Text style={tw.style(h6TextStyle, 'text-center text-radish mb-2')}>
                  {isLogin ? 'WELCOME BACK' : 'JOIN SAVEFUL'}
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
                  {isLogin 
                    ? 'Sign in to continue your culinary journey' 
                    : 'Create your account to get started'}
                </Text>
              </View>

              {/* Form Fields */}
              <View style={tw`gap-3`}>
                {!isLogin && (
                  <View>
                    <Text style={tw.style(bodyMediumRegular, 'text-stone mb-1.5')}>
                      Full Name *
                    </Text>
                    <View style={tw`flex-row items-center bg-creme rounded-xl px-3 py-2.5`}>
                      <Feather name="user" size={18} color="#666" style={tw`mr-2.5`} />
                      <TextInput
                        style={tw`flex-1 text-base text-black`}
                        placeholder="Enter your full name"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        editable={!isLoading}
                      />
                    </View>
                  </View>
                )}

                <View>
                  <Text style={tw.style(bodyMediumRegular, 'text-stone mb-1.5')}>
                    Email Address *
                  </Text>
                  <View style={tw`flex-row items-center bg-creme rounded-xl px-3 py-2.5`}>
                    <Feather name="mail" size={18} color="#666" style={tw`mr-2.5`} />
                    <TextInput
                      style={tw`flex-1 text-base text-black`}
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
                </View>

                <View>
                  <Text style={tw.style(bodyMediumRegular, 'text-stone mb-1.5')}>
                    Password *
                  </Text>
                  <View style={tw`flex-row items-center bg-creme rounded-xl px-3 py-2.5`}>
                    <Feather name="lock" size={18} color="#666" style={tw`mr-2.5`} />
                    <TextInput
                      style={tw`flex-1 text-base text-black`}
                      placeholder="Enter your password"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      editable={!isLoading}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Feather 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={18} 
                        color="#666" 
                      />
                    </Pressable>
                  </View>
                </View>

                {!isLogin && (
                  <View>
                    <Text style={tw.style(bodyMediumRegular, 'text-stone mb-1.5')}>
                      Confirm Password *
                    </Text>
                    <View style={tw`flex-row items-center bg-creme rounded-xl px-3 py-2.5`}>
                      <Feather name="lock" size={18} color="#666" style={tw`mr-2.5`} />
                      <TextInput
                        style={tw`flex-1 text-base text-black`}
                        placeholder="Confirm your password"
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoComplete="password"
                        editable={!isLoading}
                      />
                      <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Feather 
                          name={showConfirmPassword ? "eye-off" : "eye"} 
                          size={18} 
                          color="#666" 
                        />
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>

              {/* Submit Button */}
              <View style={tw`mt-4`}>
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
                        {isLogin ? 'Signing in...' : 'Sending OTP...'}
                      </Text>
                    </View>
                  ) : (
                    isLogin ? 'Sign In' : 'Continue'
                  )}
                </PrimaryButton>
              </View>

              {/* Toggle Login/Signup */}
              <TouchableOpacity
                onPress={() => setIsLogin(!isLogin)}
                disabled={isLoading}
                style={tw`pt-3 items-center`}
              >
                <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <Text style={tw`font-bold text-radish`}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Spacer for bottom */}
            <View />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      
      <FocusAwareStatusBar statusBarStyle="dark" />
    </ImageBackground>
  );
}
