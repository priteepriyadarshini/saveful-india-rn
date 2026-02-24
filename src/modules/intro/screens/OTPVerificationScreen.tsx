import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground, useWindowDimensions } from 'react-native';
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
import { cardDrop } from '../../../theme/shadow';
export default function OTPVerificationScreen({ route, navigation }: any) {
  const { email, name, password, confirmPassword, stateCode, vegType } = route.params;
  const dispatch = useAppDispatch();
  const { sendAnalyticsUserID, sendAliasUserID } = useAnalytics();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [rowWidth, setRowWidth] = useState(0);
  const gap = 8; // px between boxes
  const defaultBoxSize = 48; // fallback size
  const boxSize = React.useMemo(() => {
    if (!rowWidth) return defaultBoxSize;
    const computed = Math.floor((rowWidth - gap * 5) / 6);
    // Clamp for consistency across very small/large screens
    return Math.max(44, Math.min(64, computed));
  }, [rowWidth]);
  
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
      const { getSafeErrorMessage } = require('../../../modules/forms/validation');
      Alert.alert(
        'Verification Failed',
        getSafeErrorMessage(error, 'Invalid OTP. Please try again.')
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
      const { getSafeErrorMessage } = require('../../../modules/forms/validation');
      Alert.alert('Error', getSafeErrorMessage(error, 'Failed to resend OTP. Please try again.'));
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
            <View style={tw.style('mx-4 mb-6 overflow-hidden rounded-2xl border border-strokecream bg-white', cardDrop)}>
              <ImageBackground
                source={require('../../../../assets/ribbons/ingredients-ribbons/eggplant-light2.png')}
                resizeMode="cover"
                imageStyle={{ opacity: 0.1 }}
              >
              <View style={tw`px-5 py-5`}>
              {/* Back Button */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={tw`mb-4 flex-row items-center self-start rounded-full border border-strokecream bg-creme px-3 py-2`}
                disabled={isLoading}
              >
                <Feather name="arrow-left" size={16} color={tw.color('stone') || '#6D6D72'} />
                <Text style={tw.style(bodySmallRegular, 'ml-1.5 text-stone')}>Back</Text>
              </TouchableOpacity>

              {/* Title */}
              <View style={tw`mb-6`}>
                <Text style={tw.style(h6TextStyle, 'text-center text-eggplant mb-3 tracking-wide')}>
                  VERIFY YOUR EMAIL
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
                  We've sent a 6-digit code to
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-center text-eggplant font-bold mt-1')}>
                  {email}
                </Text>
              </View>

              {/* OTP Input */}
              <View style={tw`mb-4`}>
                <Text style={tw.style(bodySmallRegular, 'text-stone text-center mb-4')}>
                  Enter verification code
                </Text>
                <View
                  style={tw`flex-row justify-center items-center`}
                  onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
                >
                  {otp.map((digit, index) => (
                    <View
                      key={index}
                      style={{ marginHorizontal: gap / 2 }}
                    >
                      <View
                        style={[
                          tw`bg-white rounded-2xl justify-center items-center border-2 shadow-sm`,
                          digit ? tw`border-eggplant` : tw`border-stone/30`,
                          { width: boxSize, height: Math.round(boxSize * 1.2) },
                        ]}
                      >
                        <TextInput
                          ref={(ref) => {
                            inputRefs.current[index] = ref;
                          }}
                          style={[
                            tw`font-bold text-center text-eggplant`,
                            {
                              fontSize: Math.max(18, Math.min(28, Math.round(boxSize * 0.55))),
                              paddingVertical: 0,
                            },
                          ]}
                          maxLength={1}
                          keyboardType="number-pad"
                          value={digit}
                          onChangeText={(value) => handleOtpChange(value, index)}
                          onKeyPress={(e) => handleKeyPress(e, index)}
                          editable={!isLoading}
                          selectTextOnFocus
                          textAlignVertical="center"
                          allowFontScaling={false}
                          placeholderTextColor="#D1D5DB"
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={tw`mb-5 bg-creme/50 rounded-xl py-3 px-4`}>
                <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
                  Code expires in{' '}
                  <Text style={tw`font-bold text-lg ${timer < 60 ? 'text-chilli' : 'text-eggplant'}`}>
                    {formatTime(timer)}
                  </Text>
                </Text>
              </View>

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
                    <View style={tw`flex-row items-center justify-center gap-2`}>
                      <Feather name="check-circle" size={16} color="white" />
                      <Text style={tw`font-sans-bold text-white`}>Verify & Create Account</Text>
                    </View>
                  )}
                </PrimaryButton>
              </View>

              {/* Resend OTP */}
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={isLoading || timer > 0}
                style={tw.style(
                  'items-center rounded-full border px-4 py-2.5',
                  timer > 0 || isLoading ? 'border-strokecream bg-creme' : 'border-eggplant bg-white',
                )}
              >
                <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
                  Didn't receive the code?{' '}
                  <Text style={tw`font-sans-semibold ${timer > 0 ? 'text-stone' : 'text-eggplant'}`}>
                    Resend
                  </Text>
                </Text>
              </TouchableOpacity>
              </View>
              </ImageBackground>
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
