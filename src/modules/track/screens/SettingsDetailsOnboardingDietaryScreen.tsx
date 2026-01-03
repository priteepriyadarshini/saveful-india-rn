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
import { useGetCurrentUserQuery, useUpdateDietaryProfileMutation } from '../../../modules/auth/api';
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
  const [updateDietaryProfile, { isLoading: isUpdateDietaryProfileLoading }] =
    useUpdateDietaryProfileMutation();

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
    if (isUpdateUserOnboardingLoading || isUpdateDietaryProfileLoading || !userOnboarding) {
      return;
    }

    try {
      console.log('Saving dietary profile with values:', {
        vegType,
        dairyFree,
        nutFree,
        glutenFree,
        hasDiabetes,
      });

      // Update onboarding data (dietary requirements and allergies)
      await updateUserOnboarding({
        ...data,
        noOfAdults: userOnboarding.no_of_people.adults,
        noOfChildren: userOnboarding.no_of_people.children,
      }).unwrap();
      
      // Update dietary profile (veg type and restrictions)
      const result = await updateDietaryProfile({
        vegType,
        dairyFree,
        nutFree,
        glutenFree,
        hasDiabetes,
        otherAllergies: allergies,
      }).unwrap();

      console.log('Dietary profile update result:', result);

      sendAnalyticsEvent({
        event: mixpanelEventName.actionClicked,
        properties: {
          action: mixpanelEventName.preferenceDietaryUpdated,
          dietary_requirements: data.dietaryRequirements,
          allergies: data.allergies,
          veg_type: vegType,
          dairy_free: dairyFree,
          nut_free: nutFree,
          gluten_free: glutenFree,
          has_diabetes: hasDiabetes,
        },
      });
      mixpanel?.getPeople().set({
        dietary_requirements: data.dietaryRequirements,
        allergies: data.allergies,
        veg_type: vegType,
        dairy_free: dairyFree,
        nut_free: nutFree,
        gluten_free: glutenFree,
        has_diabetes: hasDiabetes,
      });

      navigation.goBack();
    } catch (error: unknown) {
      // Whoopss.
      sendFailedEventAnalytics(error);
      Alert.alert('User update error', JSON.stringify(error));
    }
  });

  // Onboarding values
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  
  // Dietary profile values
  const [vegType, setVegType] = useState<'OMNI' | 'VEGETARIAN' | 'VEGAN'>('OMNI');
  const [dairyFree, setDairyFree] = useState(false);
  const [nutFree, setNutFree] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [hasDiabetes, setHasDiabetes] = useState(false);
  
  const { data: currentUser } = useGetCurrentUserQuery();

  useEffect(() => {
    if (userOnboarding) {
      setValue('dietaryRequirements', userOnboarding.dietary_requirements);
      setDietaryRequirements(userOnboarding.dietary_requirements);
      setValue('allergies', userOnboarding.allergies);
      setAllergies(userOnboarding.allergies);
    }
  }, [setValue, userOnboarding]);
  
  useEffect(() => {
    if (currentUser?.dietary_profile) {
      console.log('Loading dietary profile:', currentUser.dietary_profile);
      setVegType(currentUser.dietary_profile.veg_type || 'OMNI');
      setDairyFree(currentUser.dietary_profile.dairy_free || false);
      setNutFree(currentUser.dietary_profile.nut_free || false);
      setGlutenFree(currentUser.dietary_profile.gluten_free || false);
      setHasDiabetes(currentUser.dietary_profile.has_diabetes || false);
    }
  }, [currentUser]);

  useEffect(() => {
    setValue('dietaryRequirements', dietaryRequirements);
  }, [setValue, dietaryRequirements]);

  useEffect(() => {
    setValue('allergies', allergies);
  }, [setValue, allergies]);

  if (!userOnboarding) {
    return null;
  }

  console.log('Rendering with state:', {
    dairyFree,
    nutFree,
    glutenFree,
    hasDiabetes,
    vegType,
  });

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
                vegType={vegType}
                setVegType={(value) => {
                  console.log('setVegType called with:', value);
                  setVegType(value);
                }}
                dairyFree={dairyFree}
                setDairyFree={(value) => {
                  console.log('setDairyFree called with:', value);
                  setDairyFree(value);
                }}
                nutFree={nutFree}
                setNutFree={(value) => {
                  console.log('setNutFree called with:', value);
                  setNutFree(value);
                }}
                glutenFree={glutenFree}
                setGlutenFree={(value) => {
                  console.log('setGlutenFree called with:', value);
                  setGlutenFree(value);
                }}
                hasDiabetes={hasDiabetes}
                setHasDiabetes={(value) => {
                  console.log('setHasDiabetes called with:', value);
                  setHasDiabetes(value);
                }}
              />
            </View>
          </View>
          <View style={tw`mx-5 mt-8`}>
            <PrimaryButton
              onPress={onUpdateUserOnboarding}
              loading={isUpdateUserOnboardingLoading || isUpdateDietaryProfileLoading}
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
