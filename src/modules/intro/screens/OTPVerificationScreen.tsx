import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import { useVerifyOTPMutation, useRequestOTPMutation } from '../../auth/api';
import { saveSessionData } from '../../auth/sessionSlice';
import { useAppDispatch } from '../../../store/hooks';
import { useLazyGetCurrentUserQuery } from '../../auth/api';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { bodyMediumRegular, h6TextStyle, bodySmallRegular } from '../../../theme/typography';
export default function OTPVerificationScreen({ route, navigation }: any) {
  const { email, name, password, confirmPassword, stateCode, vegType } = route.params;
  const dispatch = useAppDispatch();
  const { sendAnalyticsUserID, sendAliasUserID } = useAnalytics();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [requestOTP, { isLoading: isResending }] = useRequestOTPMutation();
  const [loadCurrentUser] = useLazyGetCurrentUserQuery();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const otpArray = value.slice(0, 6).split('');
      const newOtp = [...otp];
      otpArray.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input
      const lastIndex = Math.min(index + otpArray.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    try {
      console.log('Verifying OTP...', { email, otp: otpCode });
      const result = await verifyOTP({ email, otp: otpCode }).unwrap();
      console.log('OTP verification result:', result);

      if (result.success && result.accessToken) {
        console.log('✅ OTP verified, saving session...');
        
        // Save session data
        const sessionData = {
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        };
        await dispatch(saveSessionData(sessionData));
        console.log('✅ Session saved');

        // Load user data
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

            console.log('✅ Account created and authenticated successfully');
          }
        } catch (userError: any) {
          console.error('❌ Failed to load user data:', userError);
          console.log('⚠️ Continuing with login despite user data fetch failure');
          Alert.alert(
            'Notice',
            'Account created! Some profile data may be unavailable.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      Alert.alert(
        'Verification Failed',
        error?.data?.message || error?.message || 'Invalid OTP. Please try again.'
      );
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) {
      Alert.alert('Please wait', `You can resend OTP in ${formatTime(timer)}`);
      return;
    }

    try {
      console.log('Resending OTP...');
      const result = await requestOTP({
        email,
        password,
        confirmPassword,
        name,
        stateCode: stateCode || 'IN-DL',
        vegType: vegType || 'OMNI',
      }).unwrap();
      
      if (result.success) {
        // Reset timer
        setTimer(600);
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        Alert.alert('Success', 'A new verification code has been sent to your email');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const isLoading = isVerifying || isResending;

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

            {/* OTP Card */}
            <View style={tw`mx-5 bg-white rounded-3xl px-5 py-6 shadow-lg mb-6`}>
              {/* Back Button */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={tw`flex-row items-center mb-4`}
                disabled={isLoading}
              >
                <Feather name="arrow-left" size={20} color="#666" />
                <Text style={tw.style(bodyMediumRegular, 'text-stone ml-2')}>Back</Text>
              </TouchableOpacity>

              {/* Title */}
              <View style={tw`mb-4`}>
                <Text style={tw.style(h6TextStyle, 'text-center text-radish mb-2')}>
                  VERIFY YOUR EMAIL
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
                  We've sent a 6-digit code to
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-center text-radish font-bold mt-1')}>
                  {email}
                </Text>
              </View>

              {/* OTP Input */}
              <View style={tw`mb-4`}>
                <Text style={tw.style(bodySmallRegular, 'text-stone text-center mb-3')}>
                  Enter verification code
                </Text>
                <View style={tw`flex-row justify-center gap-2`}>
                  {otp.map((digit, index) => (
                    <View
                      key={index}
                      style={tw`bg-creme rounded-xl w-12 h-14 justify-center items-center border-2 ${
                        digit ? 'border-radish' : 'border-transparent'
                      }`}
                    >
                      <TextInput
                        ref={(ref) => {
                          inputRefs.current[index] = ref;
                        }}
                        style={tw`text-2xl font-bold text-center w-full text-radish`}
                        maxLength={1}
                        keyboardType="number-pad"
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        editable={!isLoading}
                        selectTextOnFocus
                      />
                    </View>
                  ))}
                </View>
              </View>

              {/* Timer */}
              <View style={tw`mb-4`}>
                <Text style={tw.style(bodySmallRegular, 'text-center text-stone')}>
                  Code expires in{' '}
                  <Text style={tw`font-bold ${timer < 60 ? 'text-red-500' : 'text-radish'}`}>
                    {formatTime(timer)}
                  </Text>
                </Text>
              </View>

              {/* Verify Button */}
              <View style={tw`mt-2 mb-3`}>
                <PrimaryButton
                  onPress={handleVerify}
                  disabled={isLoading || otp.join('').length !== 6}
                  buttonSize="large"
                  width="full"
                >
                  {isVerifying ? (
                    <View style={tw`flex-row items-center justify-center gap-2`}>
                      <ActivityIndicator color="white" />
                      <Text style={tw`text-white font-bold`}>Verifying...</Text>
                    </View>
                  ) : (
                    'Verify & Create Account'
                  )}
                </PrimaryButton>
              </View>

              {/* Resend OTP */}
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={isLoading || timer > 0}
                style={tw`pt-2 items-center`}
              >
                <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
                  Didn't receive the code?{' '}
                  <Text style={tw`font-bold ${timer > 0 ? 'text-gray-400' : 'text-radish'}`}>
                    Resend
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
