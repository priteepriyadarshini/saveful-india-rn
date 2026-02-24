import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, Image, ImageBackground, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import { useLoginMutation, useRequestOTPMutation, useForgotPasswordMutation, useResetPasswordMutation, useLazyGetCurrentUserQuery } from '../../auth/api';
import { saveSessionData } from '../../auth/sessionSlice';
import { useAppDispatch } from '../../../store/hooks';
import { TokenManager } from '../../pushNotifications/TokenManager';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { bodyMediumRegular, bodySmallRegular, h6TextStyle, subheadSmallUppercase } from '../../../theme/typography';
import { getSafeErrorMessage } from '../../../modules/forms/validation';
import { cardDrop } from '../../../theme/shadow';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { sendAnalyticsUserID, sendAliasUserID } = useAnalytics();

  // ── view: 'auth' | 'forgot' | 'resetPassword'
  const [activeView, setActiveView] = useState<'auth' | 'forgot' | 'resetPassword'>('auth');

  // Auth fields
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOTP, setResetOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [requestOTP, { isLoading: isRequestingOTP }] = useRequestOTPMutation();
  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();
  const [loadCurrentUser] = useLazyGetCurrentUserQuery();

  // ── Auth (Login / Signup) ─────────────────────────────────────────────────
  const handleAuth = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter email and password');
        return;
      }

      if (!isLogin) {
        if (!name) { Alert.alert('Error', 'Please enter your name'); return; }
        if (password !== confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return; }
        if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }

        const result = await requestOTP({
          email, password, confirmPassword, name,
          stateCode: 'IN-DL', vegType: 'OMNI',
        }).unwrap();

        if (result.success) {
          Alert.alert('OTP Sent', `A verification code has been sent to ${email}`, [
            { text: 'OK', onPress: () => navigation.navigate('OTPVerificationScreen', { email, name, password, confirmPassword, stateCode: 'IN-DL', vegType: 'OMNI' }) },
          ]);
        }
      } else {
        const result = await login({ email, password }).unwrap();

        if (result.success && result.accessToken) {
          await dispatch(saveSessionData({ access_token: result.accessToken, refresh_token: result.refreshToken }));

          try {
            await TokenManager.shared.uploadToken();
          } catch { /* non-critical */ }

          try {
            const user = await loadCurrentUser({ accessToken: result.accessToken }).unwrap();
            if (user) {
              try {
                sendAliasUserID(user.id);
                sendAnalyticsUserID(user.id, { id: user.id, first_name: user.first_name || name, email: user.email });
              } catch { /* analytics non-critical */ }
            }
          } catch (userError: any) {
            Alert.alert('Notice', 'Login successful! Some profile data may be unavailable.', [{ text: 'OK' }]);
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Authentication Failed', getSafeErrorMessage(error, 'Please check your credentials and try again'));
    }
  };

  // ── Forgot Password – send OTP ────────────────────────────────────────────
  const handleForgotPassword = async () => {
    const trimmed = forgotEmail.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    try {
      await forgotPassword({ email: trimmed.toLowerCase() }).unwrap();
      setForgotEmail(trimmed.toLowerCase()); // normalise state so reset step uses same casing
      setActiveView('resetPassword');
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', msg);
    }
  };

  // ── Reset Password – verify OTP + set new password ────────────────────────
  const handleResetPassword = async () => {
    if (!resetOTP.trim()) { Alert.alert('Error', 'Please enter the OTP sent to your email'); return; }
    if (!newPassword) { Alert.alert('Error', 'Please enter a new password'); return; }
    if (newPassword.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    if (newPassword !== confirmNewPassword) { Alert.alert('Error', 'Passwords do not match'); return; }

    try {
      await resetPassword({ email: forgotEmail.trim().toLowerCase(), otp: resetOTP.trim(), newPassword, confirmPassword: confirmNewPassword }).unwrap();
      Alert.alert('Success', 'Password reset successfully! Please sign in with your new password.', [
        { text: 'Sign In', onPress: () => { setActiveView('auth'); setForgotEmail(''); setResetOTP(''); setNewPassword(''); setConfirmNewPassword(''); } },
      ]);
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || 'Reset failed. Please try again.';
      Alert.alert('Error', msg);
    }
  };

  const isLoading = isLoginLoading || isRequestingOTP;

  return (
    <ImageBackground
      style={tw`relative flex-1 bg-creme`}
      source={require('../../../../assets/intro/splash.png')}
      imageStyle={{ resizeMode: 'contain' }}
    >
      <SafeAreaView style={tw`flex-1 justify-between pb-2.5 pt-6`}>
        <KeyboardAwareScrollView
          enableOnAndroid
          enableAutomaticScroll
          extraScrollHeight={24}
          keyboardOpeningTime={0}
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

          {/* ── AUTH FORM CARD (Login / Signup) ── */}
          {activeView === 'auth' && (
            <View style={tw.style('mx-4 mb-6 overflow-hidden rounded-2xl border border-strokecream bg-white', cardDrop)}>
              <ImageBackground
                source={require('../../../../assets/ribbons/ingredients-ribbons/eggplant-light2.png')}
                resizeMode="cover"
                imageStyle={{ opacity: 0.1 }}
              >
              <View style={tw`px-4 pb-4 pt-4`}>
                <View style={tw`mb-3 rounded-xl border border-strokecream bg-creme p-1`}>
                  <View style={tw`flex-row`}>
                    <TouchableOpacity
                      onPress={() => setIsLogin(true)}
                      disabled={isLoading}
                      style={tw.style('flex-1 items-center rounded-lg py-2.5', isLogin ? 'bg-white' : 'bg-transparent')}
                    >
                      <Text style={tw.style(subheadSmallUppercase, isLogin ? 'text-eggplant' : 'text-stone')}>
                        Sign In
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIsLogin(false)}
                      disabled={isLoading}
                      style={tw.style('flex-1 items-center rounded-lg py-2.5', !isLogin ? 'bg-white' : 'bg-transparent')}
                    >
                      <Text style={tw.style(subheadSmallUppercase, !isLogin ? 'text-eggplant' : 'text-stone')}>
                        Sign Up
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={tw`mb-4`}>
                <Text style={tw.style(h6TextStyle, 'text-center text-eggplant mb-2')}>
                  {isLogin ? 'WELCOME BACK' : 'JOIN SAVEFUL'}
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
                  {isLogin ? 'Sign in to continue your culinary journey' : 'Create your account to get started'}
                </Text>
              </View>

              <View style={tw`gap-3`}>
                {!isLogin && (
                  <View>
                    <Text style={tw.style(bodyMediumRegular, 'text-stone mb-1.5')}>Full Name *</Text>
                    <View style={tw`flex-row items-center rounded-xl border border-strokecream bg-creme px-3 py-2.5`}>
                      <Feather name="user" size={18} color={tw.color('stone') || '#6D6D72'} style={tw`mr-2.5`} />
                      <TextInput
                        style={tw`flex-1 text-base text-black`}
                        placeholder="Enter your full name"
                        placeholderTextColor={tw.color('stone') || '#6D6D72'}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        editable={!isLoading}
                      />
                    </View>
                  </View>
                )}

                <View>
                  <Text style={tw.style(bodyMediumRegular, 'text-stone mb-1.5')}>Email Address *</Text>
                  <View style={tw`flex-row items-center rounded-xl border border-strokecream bg-creme px-3 py-2.5`}>
                    <Feather name="mail" size={18} color={tw.color('stone') || '#6D6D72'} style={tw`mr-2.5`} />
                    <TextInput
                      style={tw`flex-1 text-base text-black`}
                      placeholder="your@email.com"
                      placeholderTextColor={tw.color('stone') || '#6D6D72'}
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
                  <View style={tw`flex-row justify-between items-center mb-1.5`}>
                    <Text style={tw.style(bodyMediumRegular, 'text-stone')}>Password *</Text>
                    {isLogin && (
                      <TouchableOpacity
                        onPress={() => { setForgotEmail(email); setActiveView('forgot'); }}
                        disabled={isLoading}
                        style={tw`rounded-full border border-strokecream bg-white px-2.5 py-1`}
                      >
                        <Text style={tw.style(subheadSmallUppercase, 'text-eggplant')}>Forgot Password?</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={tw`flex-row items-center rounded-xl border border-strokecream bg-creme px-3 py-2.5`}>
                    <Feather name="lock" size={18} color={tw.color('stone') || '#6D6D72'} style={tw`mr-2.5`} />
                    <TextInput
                      style={tw`flex-1 text-base text-black`}
                      placeholder="Enter your password"
                      placeholderTextColor={tw.color('stone') || '#6D6D72'}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      editable={!isLoading}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={tw.color('stone') || '#6D6D72'} />
                    </Pressable>
                  </View>
                </View>

                {!isLogin && (
                  <View>
                    <Text style={tw.style(bodyMediumRegular, 'text-stone mb-1.5')}>Confirm Password *</Text>
                    <View style={tw`flex-row items-center rounded-xl border border-strokecream bg-creme px-3 py-2.5`}>
                      <Feather name="lock" size={18} color={tw.color('stone') || '#6D6D72'} style={tw`mr-2.5`} />
                      <TextInput
                        style={tw`flex-1 text-base text-black`}
                        placeholder="Confirm your password"
                        placeholderTextColor={tw.color('stone') || '#6D6D72'}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoComplete="password"
                        editable={!isLoading}
                      />
                      <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={18} color={tw.color('stone') || '#6D6D72'} />
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>

              <View style={tw`mt-4`}>
                <PrimaryButton onPress={handleAuth} disabled={isLoading} buttonSize="large" width="full">
                  {isLoading ? (
                    <View style={tw`flex-row items-center justify-center gap-2`}>
                      <ActivityIndicator color="white" />
                      <Text style={tw`text-white font-bold`}>{isLogin ? 'Signing in...' : 'Sending OTP...'}</Text>
                    </View>
                  ) : (
                    <View style={tw`flex-row items-center justify-center gap-2`}>
                      <Feather name={isLogin ? 'log-in' : 'arrow-right'} size={16} color="white" />
                      <Text style={tw`font-sans-bold text-white`}>{isLogin ? 'Sign In' : 'Continue'}</Text>
                    </View>
                  )}
                </PrimaryButton>
              </View>

              <TouchableOpacity
                onPress={() => setIsLogin(!isLogin)}
                disabled={isLoading}
                style={tw`mt-3 items-center rounded-full border border-strokecream bg-creme px-4 py-2.5`}
              >
                <Text style={tw.style(bodySmallRegular, 'text-center text-stone')}>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <Text style={tw`font-sans-semibold text-eggplant`}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
                </Text>
              </TouchableOpacity>
              </View>
              </ImageBackground>
            </View>
          )}

          {/* ── FORGOT PASSWORD CARD ── */}
          {activeView === 'forgot' && (
            <View style={tw.style('mx-4 mb-6 overflow-hidden rounded-2xl border border-strokecream bg-white', cardDrop)}>
              <ImageBackground
                source={require('../../../../assets/ribbons/ingredients-ribbons/lemon2.png')}
                resizeMode="cover"
                imageStyle={{ opacity: 0.1 }}
              >
              <View style={tw`px-4 py-4`}>
              <View style={tw`mb-5`}>
                <View style={tw`items-center mb-3`}>
                  <View style={tw`w-14 h-14 rounded-full bg-creme border border-strokecream items-center justify-center`}>
                    <Feather name="lock" size={24} color={tw.color('orange') || '#F99C46'} />
                  </View>
                </View>
                <Text style={tw.style(h6TextStyle, 'text-center text-eggplant mb-2')}>FORGOT PASSWORD</Text>
                <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
                  Enter your registered email and we'll send you a reset code.
                </Text>
              </View>

              <View style={tw`gap-3`}>
                <View>
                  <Text style={tw.style(bodyMediumRegular, 'text-stone mb-1.5')}>Email Address *</Text>
                  <View style={tw`flex-row items-center rounded-xl border border-strokecream bg-creme px-3 py-2.5`}>
                    <Feather name="mail" size={18} color={tw.color('stone') || '#6D6D72'} style={tw`mr-2.5`} />
                    <TextInput
                      style={tw`flex-1 text-base text-black`}
                      placeholder="your@email.com"
                      placeholderTextColor={tw.color('stone') || '#6D6D72'}
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      editable={!isForgotLoading}
                    />
                  </View>
                </View>
              </View>

              <View style={tw`mt-4`}>
                <PrimaryButton onPress={handleForgotPassword} disabled={isForgotLoading} buttonSize="large" width="full">
                  {isForgotLoading ? (
                    <View style={tw`flex-row items-center justify-center gap-2`}>
                      <ActivityIndicator color="white" />
                      <Text style={tw`text-white font-bold`}>Sending Code...</Text>
                    </View>
                  ) : (
                    <View style={tw`flex-row items-center justify-center gap-2`}>
                      <Feather name="send" size={16} color="white" />
                      <Text style={tw`font-sans-bold text-white`}>Send Reset Code</Text>
                    </View>
                  )}
                </PrimaryButton>
              </View>

              <TouchableOpacity
                onPress={() => setActiveView('auth')}
                disabled={isForgotLoading}
                style={tw`mt-3 items-center flex-row justify-center gap-1 rounded-full border border-strokecream bg-creme px-4 py-2.5`}
              >
                <Feather name="arrow-left" size={15} color={tw.color('stone') || '#6D6D72'} />
                <Text style={tw.style(bodySmallRegular, 'text-stone')}>Back to Sign In</Text>
              </TouchableOpacity>
              </View>
              </ImageBackground>
            </View>
          )}

          {/* ── RESET PASSWORD CARD ── */}
          {activeView === 'resetPassword' && (
            <View style={tw.style('mx-4 mb-6 overflow-hidden rounded-2xl border border-strokecream bg-white', cardDrop)}>
              <ImageBackground
                source={require('../../../../assets/ribbons/ingredients-ribbons/mint2.png')}
                resizeMode="cover"
                imageStyle={{ opacity: 0.1 }}
              >
              <View style={tw`px-4 py-4`}>
              <View style={tw`mb-5`}>
                <View style={tw`items-center mb-3`}>
                  <View style={tw`w-14 h-14 rounded-full bg-creme border border-strokecream items-center justify-center`}>
                    <Feather name="shield" size={24} color={tw.color('kale') || '#3A7E52'} />
                  </View>
                </View>
                <Text style={tw.style(h6TextStyle, 'text-center text-eggplant mb-2')}>RESET PASSWORD</Text>
                <Text style={tw.style(bodyMediumRegular, 'text-center text-stone')}>
                  Enter the 6-digit code sent to{'\n'}
                  <Text style={tw`font-semibold text-eggplant`}>{forgotEmail}</Text>
                </Text>
              </View>

              <View style={tw`gap-3`}>
                <View>
                  <Text style={tw.style(bodyMediumRegular, 'text-stone mb-1.5')}>Verification Code *</Text>
                  <View style={tw`flex-row items-center rounded-xl border border-strokecream bg-creme px-3 py-2.5`}>
                    <Feather name="key" size={18} color={tw.color('stone') || '#6D6D72'} style={tw`mr-2.5`} />
                    <TextInput
                      style={tw`flex-1 text-base text-black tracking-widest font-bold`}
                      placeholder="000000"
                      placeholderTextColor={tw.color('stone') || '#6D6D72'}
                      value={resetOTP}
                      onChangeText={setResetOTP}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!isResetLoading}
                    />
                  </View>
                </View>

                <View>
                  <Text style={tw.style(bodyMediumRegular, 'text-stone mb-1.5')}>New Password *</Text>
                  <View style={tw`flex-row items-center rounded-xl border border-strokecream bg-creme px-3 py-2.5`}>
                    <Feather name="lock" size={18} color={tw.color('stone') || '#6D6D72'} style={tw`mr-2.5`} />
                    <TextInput
                      style={tw`flex-1 text-base text-black`}
                      placeholder="New password (min. 6 chars)"
                      placeholderTextColor={tw.color('stone') || '#6D6D72'}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      autoComplete="new-password"
                      editable={!isResetLoading}
                    />
                    <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                      <Feather name={showNewPassword ? 'eye-off' : 'eye'} size={18} color={tw.color('stone') || '#6D6D72'} />
                    </Pressable>
                  </View>
                </View>

                <View>
                  <Text style={tw.style(bodyMediumRegular, 'text-stone mb-1.5')}>Confirm New Password *</Text>
                  <View style={tw`flex-row items-center rounded-xl border border-strokecream bg-creme px-3 py-2.5`}>
                    <Feather name="lock" size={18} color={tw.color('stone') || '#6D6D72'} style={tw`mr-2.5`} />
                    <TextInput
                      style={tw`flex-1 text-base text-black`}
                      placeholder="Confirm new password"
                      placeholderTextColor={tw.color('stone') || '#6D6D72'}
                      value={confirmNewPassword}
                      onChangeText={setConfirmNewPassword}
                      secureTextEntry={!showConfirmNewPassword}
                      autoComplete="new-password"
                      editable={!isResetLoading}
                    />
                    <Pressable onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                      <Feather name={showConfirmNewPassword ? 'eye-off' : 'eye'} size={18} color={tw.color('stone') || '#6D6D72'} />
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={tw`mt-4`}>
                <PrimaryButton onPress={handleResetPassword} disabled={isResetLoading} buttonSize="large" width="full">
                  {isResetLoading ? (
                    <View style={tw`flex-row items-center justify-center gap-2`}>
                      <ActivityIndicator color="white" />
                      <Text style={tw`text-white font-bold`}>Resetting...</Text>
                    </View>
                  ) : (
                    <View style={tw`flex-row items-center justify-center gap-2`}>
                      <Feather name="check-circle" size={16} color="white" />
                      <Text style={tw`font-sans-bold text-white`}>Reset Password</Text>
                    </View>
                  )}
                </PrimaryButton>
              </View>

              <TouchableOpacity
                onPress={() => setActiveView('forgot')}
                disabled={isResetLoading}
                style={tw`mt-3 items-center flex-row justify-center gap-1 rounded-full border border-strokecream bg-creme px-4 py-2.5`}
              >
                <Feather name="arrow-left" size={15} color={tw.color('stone') || '#6D6D72'} />
                <Text style={tw.style(bodySmallRegular, 'text-stone')}>Change email</Text>
              </TouchableOpacity>
              </View>
              </ImageBackground>
            </View>
          )}

          <View />
        </KeyboardAwareScrollView>
      </SafeAreaView>

      <FocusAwareStatusBar statusBarStyle="dark" />
    </ImageBackground>
  );
}