import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../common/tailwind';
import * as WebBrowser from 'expo-web-browser';
import { mixpanelEventName } from '../../analytics/analytics';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { ControlledTextInput, FormLabel } from '../../forms';
import { handleFormSubmitException, getSafeErrorMessage } from '../../forms/validation';
import { useLinkFFNMutation } from '../../qantas/api/api';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  bodyMediumRegular,
  bodySmallRegular,
  h6TextStyle,
} from '../../../theme/typography';
import * as Yup from 'yup';

const schema = Yup.object({
  ffn: Yup.string()
    .required('Please enter your Frequent Flyer number')
    .matches(/^\d+$/, 'FFN must contain only digits')
    .min(6, 'FFN must be at least 6 digits')
    .max(12, 'FFN must be at most 12 digits'),
  surname: Yup.string()
    .required('Please enter your surname')
    .min(2, 'Surname must be at least 2 characters'),
});

interface FormData {
  ffn: string;
  surname: string;
}

const defaultValues: FormData = { ffn: '', surname: '' };

export default function QantasLinkScreen() {
  const navigation = useNavigation();
  const { sendAnalyticsEvent, sendFailedEventAnalytics } = useAnalytics();
  const [linkFFN, { isLoading }] = useLinkFFNMutation();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onLinkFFN = handleSubmit(async (formData) => {
    try {
      await linkFFN({ memberId: formData.ffn, surname: formData.surname }).unwrap();

      sendAnalyticsEvent({
        event: mixpanelEventName.qantasLink,
        properties: { action: 'ffn_linked' },
      });

      Alert.alert(
        'Account Linked!',
        'Your Qantas Frequent Flyer account has been linked successfully. Complete 4 weekly surveys to earn 100 Qantas Points!',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      sendFailedEventAnalytics(error);
      const errorMessage = getSafeErrorMessage(
        error,
        'Failed to link your Qantas account. Please check your details and try again.',
      );
      Alert.alert('Link Failed', errorMessage, [{ text: 'OK' }]);
      handleFormSubmitException(error, setError);
    }
  });

  return (
    <View style={tw`flex-1 bg-creme`}>
      {/* Red Qantas ribbon at the bottom */}
      <Image
        source={require('../../../../assets/ribbons/qantas.png')}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        style={[
          tw`absolute bottom-0`,
          { width: screenWidth, height: screenWidth * 0.55 },
        ]}
      />
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={tw`flex-1`}>
          {/* Back button */}
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={tw`px-4 pt-2 h-12 justify-center w-12`}
          >
            <Feather name="arrow-left" size={24} color={tw.color('black')} />
          </Pressable>

          {/* Main content fills remaining space */}
          <View style={tw`flex-1 px-5 justify-between pb-4`}>

            {/* Top section */}
            <View>
              {/* Title */}
              <Text
                style={tw.style(h6TextStyle, 'text-center')}
                maxFontSizeMultiplier={1}
              >
                Link your Qantas{'\n'}Frequent Flyer account
              </Text>

              {/* Subtitle */}
              <Text
                style={tw.style(bodyMediumRegular, 'mt-2 text-center text-midgray')}
                maxFontSizeMultiplier={1}
              >
                Make your sustainable choices go further and get closer to the exclusive
                benefits of Green Tier
              </Text>

              {/* Form card */}
              <View style={tw`mt-4 rounded-2xl border border-strokecream bg-white px-5 pt-4 pb-5`}>
                {/* Logo */}
                <Image
                  resizeMode="contain"
                  source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/qantas/frequent-flyer.png' }}
                  accessibilityIgnoresInvertColors
                  style={tw`mx-auto mb-4 h-[56px] w-[160px]`}
                />

                {/* FFN Input */}
                <View style={tw`mb-3`}>
                  <FormLabel error={errors.ffn}>FREQUENT FLYER NUMBER</FormLabel>
                  <ControlledTextInput
                    name="ffn"
                    control={control}
                    error={errors.ffn}
                    placeholder="123456"
                    keyboardType="numeric"
                    maxLength={12}
                  />
                </View>

                {/* Surname Input */}
                <View>
                  <FormLabel error={errors.surname}>YOUR SURNAME</FormLabel>
                  <ControlledTextInput
                    name="surname"
                    control={control}
                    error={errors.surname}
                    placeholder="Aaronson"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Info links */}
              <View style={tw`mt-3 flex-row justify-evenly`}>
                <Pressable
                  onPress={() =>
                    WebBrowser.openBrowserAsync(
                      'https://www.qantas.com/au/en/frequent-flyer/status-and-clubs/green-tier.html',
                    )
                  }
                >
                  <Text style={tw.style(bodySmallRegular, 'text-midgray underline')}>
                    What is Green Tier?
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    WebBrowser.openBrowserAsync('https://www.saveful.com/qantasterms')
                  }
                >
                  <Text style={tw.style(bodySmallRegular, 'text-midgray underline')}>
                    Terms & conditions
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Bottom actions — pinned to bottom of flex container */}
            <View>
              <PrimaryButton
                buttonSize="large"
                onPress={onLinkFFN}
                loading={isLoading}
                style={tw`mb-3`}
              >
                Link now
              </PrimaryButton>

              <Pressable
                onPress={() =>
                  WebBrowser.openBrowserAsync(
                    'https://www.qantas.com/au/en/frequent-flyer/discover-and-join/join-now.html/code/saveful',
                  )
                }
                style={tw`items-center py-2`}
              >
                <Text style={tw.style(bodySmallRegular, 'text-center text-qantas underline')}>
                  Not a Qantas Frequent Flyer? Join for free.
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <FocusAwareStatusBar statusBarStyle="dark" />
    </View>
  );
}

