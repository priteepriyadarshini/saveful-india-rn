import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import { useLoginMutation, useSignupMutation, SignupData } from '../../auth/api';
import { saveSessionData } from '../../auth/sessionSlice';
import { useAppDispatch } from '../../../store/hooks';
import { useLazyGetCurrentUserQuery } from '../../auth/api';
import { TokenManager } from '../../pushNotifications/TokenManager';
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
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
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
          phoneNumber: phoneNumber ? `${countryCode}${phoneNumber}` : undefined,
          stateCode: 'IN-DL', 
          vegType: 'OMNI', // Default, will be updated in dietary profile
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

          // Initialize push notifications (disabled for now due to native module issues)
          try {
            console.log('OneSignal integration disabled in development - authentication proceeding normally');
            // TokenManager.shared.identifyUser(user);
            // OneSignal setup disabled to prevent blocking authentication
          } catch (error) {
            console.log('OneSignal error handled:', error);
          }

          console.log('Authentication completed successfully, user should be navigated to next screen');
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
                        style={tw`flex-1 text-base`}
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
                      style={tw`flex-1 text-base`}
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
                      style={tw`flex-1 text-base`}
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
                      Phone Number (Optional)
                    </Text>
                    <View style={tw`flex-row items-center bg-creme rounded-xl`}>
                      <Feather name="phone" size={18} color="#666" style={tw`ml-3`} />
                      <Pressable 
                        style={tw`flex-row items-center px-2.5 py-2.5 border-r border-stone/20`}
                        onPress={() => setShowCountryPicker(true)}
                      >
                        <Text style={tw`text-base text-stone mr-1`}>{countryCode}</Text>
                        <Feather name="chevron-down" size={16} color="#666" />
                      </Pressable>
                      <TextInput
                        style={tw`flex-1 px-3 py-2.5 text-base`}
                        placeholder="9876543210"
                        placeholderTextColor="#999"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        editable={!isLoading}
                      />
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
      
      {/* Country Code Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity 
          style={tw`flex-1 bg-black/50 justify-end`}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        >
          <View style={tw`bg-white rounded-t-3xl px-5 py-6`}>
            <Text style={tw.style(h6TextStyle, 'text-center mb-4')}>Select Country Code</Text>
            <ScrollView style={tw`max-h-80`}>
              {[
                { code: '+91', country: 'India' },
                { code: '+1', country: 'USA/Canada' },
                { code: '+44', country: 'UK' },
                { code: '+61', country: 'Australia' },
                { code: '+86', country: 'China' },
                { code: '+81', country: 'Japan' },
                { code: '+82', country: 'South Korea' },
                { code: '+65', country: 'Singapore' },
                { code: '+971', country: 'UAE' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={tw`py-4 border-b border-stone/10`}
                  onPress={() => {
                    setCountryCode(item.code);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={tw`text-base`}>
                    {item.code} - {item.country}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <FocusAwareStatusBar statusBarStyle="dark" />
    </ImageBackground>
  );
}
