import { yupResolver } from '@hookform/resolvers/yup';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../common/tailwind';
import _ from 'lodash';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import { useUpdateCurrentUserPasswordMutation } from '../../../modules/auth/api';
import { ControlledTextInput, FieldWrapper, FormLabel } from '../../../modules/forms';
import { handleFormSubmitException } from '../../../modules/forms/validation';
import { TrackStackScreenProps } from '../../../modules/track/navigation/TrackNavigation';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { h7TextStyle } from '../../../theme/typography';
import * as Yup from 'yup';

const schema = Yup.object({
  currentPassword: Yup.string().required('Please enter your current password'),
  newPassword: Yup.string().required('Please enter your new password'),
  confirmNewPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const defaultValues: FormData = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

export default function ChangePasswordScreen({
  navigation,
}: TrackStackScreenProps<'ChangePassword'>) {
  const [updateCurrentUserPassword, { isLoading }] =
    useUpdateCurrentUserPasswordMutation();

  const { sendAnalyticsEvent, sendFailedEventAnalytics } = useAnalytics();

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

  const onSetNewPasswordPress = handleSubmit(async data => {
    try {
      if (_.isEmpty(data)) {
        // No new data. Lets return
        return;
      }

      try {
        await updateCurrentUserPassword({
          ...data,
        }).unwrap();

        sendAnalyticsEvent({
          event: mixpanelEventName.actionClicked,
          properties: {
            action: mixpanelEventName.passwordUpdated,
          },
        });

        navigation.navigate('Settings', {
          isChangePasswordUpdated: true,
        });
      } catch (error: unknown) {
        // Whoopss.
        sendFailedEventAnalytics(error);
        Alert.alert('Password update error');
      }
    } catch (e) {
      sendFailedEventAnalytics(e);
      handleFormSubmitException(e, setError);
    }
  });

  return (
    <SafeAreaView edges={['top']} style={tw`flex-1 bg-creme`}>
      <View style={tw`flex-1 bg-creme px-5 pt-11`}>
        <ScrollView>
          <View style={tw.style('items-center')}>
            <Text style={tw.style(h7TextStyle, 'mb-6')}>Change password</Text>
          </View>
          <View style={tw`mb-8`}>
            <FieldWrapper>
              <FormLabel error={errors.currentPassword}>
                Current password
              </FormLabel>
              <ControlledTextInput
                name="currentPassword"
                control={control}
                error={errors.currentPassword}
                secureTextEntry
              />
            </FieldWrapper>
            <FieldWrapper>
              <FormLabel error={errors.newPassword}>New password</FormLabel>
              <ControlledTextInput
                name="newPassword"
                control={control}
                error={errors.newPassword}
                secureTextEntry
              />
            </FieldWrapper>
            <FieldWrapper>
              <FormLabel error={errors.confirmNewPassword}>
                Confirm new password
              </FormLabel>
              <ControlledTextInput
                name="confirmNewPassword"
                control={control}
                error={errors.confirmNewPassword}
                secureTextEntry
              />
            </FieldWrapper>
          </View>
        </ScrollView>
        <PrimaryButton
          style={tw.style('mb-10')}
          onPress={onSetNewPasswordPress}
          buttonSize="large"
          loading={isLoading}
        >
          Set new password
        </PrimaryButton>
      </View>
    </SafeAreaView>
  );
}
