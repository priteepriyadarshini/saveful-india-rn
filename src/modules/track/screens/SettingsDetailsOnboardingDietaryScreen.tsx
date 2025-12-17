import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../common/tailwind';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import {
  useGetUserOnboardingQuery,
  useUpdateUserOnboardingMutation,
} from '../../../modules/intro/api/api';
import OnboardingDietary from '../../../modules/intro/components/OnboardingDietary';
import { MixPanelContext } from '../../../modules/mixpanel/context/MixpanelContext';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Dimensions, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';

const schema = Yup.object({
  dietaryRequirements: Yup.array().required(
    'Please select at least one dietary requirement',
  ),
  allergies: Yup.array().required('Please select at least one allergy'),
});

interface FormData {
  dietaryRequirements: string[];
  allergies: string[];
}

const defaultValues: FormData = {
  dietaryRequirements: [],
  allergies: [],
};

export default function SettingsDetailsOnboardingDietaryScreen() {
  const { data: userOnboarding } = useGetUserOnboardingQuery();
  const [updateUserOnboarding, { isLoading: isUpdateUserOnboardingLoading }] =
    useUpdateUserOnboardingMutation();

  const navigation = useNavigation();
  const {
    // control,
    handleSubmit,
    setValue,
    // setError,
    // watch,
    // formState: { errors },
  } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { sendAnalyticsEvent, sendFailedEventAnalytics } = useAnalytics();

  const [mixpanel] = useContext(MixPanelContext);

  const onUpdateUserOnboarding = handleSubmit(async data => {
    if (isUpdateUserOnboardingLoading || !userOnboarding) {
      return;
    }

    try {
      await updateUserOnboarding({
        ...data,
        noOfAdults: userOnboarding.no_of_people.adults,
        noOfChildren: userOnboarding.no_of_people.children,
      }).unwrap();

      sendAnalyticsEvent({
        event: mixpanelEventName.actionClicked,
        properties: {
          action: mixpanelEventName.preferenceDietaryUpdated,
          dietary_requirements: data.dietaryRequirements,
          allergies: data.allergies,
        },
      });
      mixpanel?.getPeople().set({
        dietary_requirements: data.dietaryRequirements,
        allergies: data.allergies,
      });

      // setIsUpdateUserSuccess(true);
      // setTimeout(() => {
      //   setIsUpdateUserSuccess(false);
      // }, 3000);
      navigation.goBack();
    } catch (error: unknown) {
      // Whoopss.
      sendFailedEventAnalytics(error);
      Alert.alert('User update error', JSON.stringify(error));
    }
  });

  useEffect(() => {
    if (userOnboarding) {
      setValue('dietaryRequirements', userOnboarding.dietary_requirements);
      setDietaryRequirements(userOnboarding.dietary_requirements);
      setValue('allergies', userOnboarding.allergies);
      setAllergies(userOnboarding.allergies);
    }
  }, [setValue, userOnboarding]);

  // Onboarding values
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);

  useEffect(() => {
    setValue('dietaryRequirements', dietaryRequirements);
  }, [setValue, dietaryRequirements]);

  useEffect(() => {
    setValue('allergies', allergies);
  }, [setValue, allergies]);

  if (!userOnboarding) {
    return null;
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView>
        <SafeAreaView>
          <View style={tw`px-5 w-[${Dimensions.get('window').width}px] pt-11`}>
            <View
              style={tw`gap-10 w-[${Dimensions.get('window').width - 40}px]`}
            >
              <OnboardingDietary
                dietaryRequirements={dietaryRequirements}
                setDietaryRequirements={setDietaryRequirements}
                allergies={allergies}
                setAllergies={setAllergies}
              />
            </View>
          </View>
          <View style={tw`mx-5 mt-8`}>
            <PrimaryButton
              onPress={onUpdateUserOnboarding}
              loading={isUpdateUserOnboardingLoading}
            >
              Save changes
            </PrimaryButton>
          </View>
        </SafeAreaView>
      </ScrollView>
      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
