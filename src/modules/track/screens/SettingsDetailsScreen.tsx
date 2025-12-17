import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../common/tailwind';
import _ from 'lodash';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
} from '../../../modules/auth/api';
import { ControlledTextInput, FieldWrapper, FormLabel } from '../../../modules/forms';
import { handleFormSubmitException } from '../../../modules/forms/validation';
import { MixPanelContext } from '../../../modules/mixpanel/context/MixpanelContext';
import AnimatedSettingsHeader from '../../../modules/track/components/AnimatedSettingsHeader';
import { TrackStackScreenProps } from '../../../modules/track/navigation/TrackNavigation';
import { useContext, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cardDrop } from '../../../theme/shadow';
import {
  bodyMediumRegular,
  subheadLargeUppercase,
  subheadMediumUppercase,
} from '../../../theme/typography';
import * as Yup from 'yup';

const schema = Yup.object({
  firstName: Yup.string().required('Please enter your name'),
});

interface FormData {
  firstName: string;
}

const defaultValues: FormData = {
  firstName: '',
};

export default function SettingsDetailsScreen({
  route: { params },
}: TrackStackScreenProps<'SettingsDetails'>) {
  const offset = useRef(new Animated.Value(0)).current;

  //const linkTo = useLinkTo();
  const navigation = useNavigation<TrackStackScreenProps<'Settings'>['navigation']>();
  
  const { sendAnalyticsEvent, sendFailedEventAnalytics } = useAnalytics();

  const [mixpanel] = useContext(MixPanelContext);

  // User
  const [updateUser, { isLoading: isUpdateUserLoading }] =
    useUpdateCurrentUserMutation();
  const [isUpdateUserSuccess, setIsUpdateUserSuccess] =
    useState<boolean>(false);

  const { data: user } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onUpdateUserPress = handleSubmit(async data => {
    if (!user) {
      return;
    }

    try {
      let updatedBody: object = {};

      if (data.firstName.length > 0 && data.firstName !== user.first_name) {
        updatedBody = {
          ...updatedBody,
          first_name: data.firstName,
        };
      }

      if (_.isEmpty(updatedBody)) {
        // No new data. Lets return
        return;
      }

      try {
        await updateUser({
          ...user,
          ...updatedBody,
        }).unwrap();

        setIsUpdateUserSuccess(true);
        mixpanel
          ?.getPeople()
          .set({ $name: data.firstName, $first_name: data.firstName });
        sendAnalyticsEvent({
          event: mixpanelEventName.actionClicked,
          properties: {
            action: mixpanelEventName.profileUpdated,
            profile_details: {
              ...updatedBody,
            },
          },
        });
        setTimeout(() => {
          setIsUpdateUserSuccess(false);
        }, 3000);
      } catch (error: unknown) {
        // Whoopss.
        sendFailedEventAnalytics(error);
        Alert.alert('User update error', JSON.stringify(error));
      }
    } catch (e) {
      sendFailedEventAnalytics(e);
      handleFormSubmitException(e, setError);
    }
  });

  useEffect(() => {
    if (user) {
      setValue('firstName', user.first_name);
    }
  }, [setValue, user]);

  const [isPasswordChanged, setIsPasswordChanged] = useState<boolean>(
    params?.isChangePasswordUpdated ?? false,
  );

  return (
    <View style={tw`flex-1 bg-creme`}>
      <AnimatedSettingsHeader animatedValue={offset} title="Your details" />
      <Image
        resizeMode="cover"
        style={tw.style(
          `absolute top-0 w-[${
            Dimensions.get('window').width
          }px] bg-eggplant h-[${
            (Dimensions.get('screen').width * 271) / 374
          }px]`,
        )}
        source={require('../../../../assets/ribbons/eggplant-tall.png')}
      />
      <ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: offset } } }],
          { useNativeDriver: false },
        )}
        contentContainerStyle={tw.style('grow')}
      >
        <SafeAreaView style={tw`z-10 flex-1`}>
          <View style={tw.style('mt-15 flex-1 bg-creme px-5 pt-8')}>
            <FieldWrapper>
              <FormLabel error={errors.firstName}>First Name</FormLabel>
              <ControlledTextInput
                name="firstName"
                control={control}
                error={errors.firstName}
              />
            </FieldWrapper>
            <View style={tw.style('mb-8')}>
              <FormLabel error={errors.firstName}>Email</FormLabel>
              <View style={tw`flex-row justify-between`}>
                <Text style={tw.style(bodyMediumRegular)}>{user?.email}</Text>
              </View>
            </View>

            <View style={tw.style('mb-8')}>
              <Text
                style={[
                  tw.style(subheadMediumUppercase, 'pb-2 text-midgray'),
                  { letterSpacing: 1 },
                ]}
              >
                password
              </Text>
              <SecondaryButton
                onPress={() => {
                  navigation.navigate("ChangePassword");
                }}
              >
                Change password
              </SecondaryButton>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>

      {(isPasswordChanged || isUpdateUserSuccess) && (
        <Pressable
          style={tw.style(
            'mx-5 mb-4 flex-row items-center justify-start rounded-md border border-kale bg-mint p-3.5',
            cardDrop,
          )}
          onPress={() => {
            setIsPasswordChanged(false);
            setIsUpdateUserSuccess(false);
          }}
        >
          <Feather
            style={tw.style('mr-3')}
            name={'check'}
            size={24}
            color="black"
          />
          <Text style={[tw.style(subheadLargeUppercase)]}>
            {isUpdateUserSuccess ? 'Profile updated' : 'password updated'}
          </Text>
        </Pressable>
      )}

      <View style={tw.style('mx-5 mb-7 gap-2')}>
        <PrimaryButton
          onPress={onUpdateUserPress}
          buttonSize="large"
          loading={isUpdateUserLoading}
        >
          Save changes
        </PrimaryButton>
      </View>

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
