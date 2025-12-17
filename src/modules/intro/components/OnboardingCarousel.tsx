import { yupResolver } from '@hookform/resolvers/yup';
import { useLinkTo } from '@react-navigation/native';
import CheckGroupWithImage from '../../../common/components/Form/CheckGroupWithImage';
import RadioGroup from '../../../common/components/Form/RadioGroup';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../common/tailwind';
import _ from 'lodash';
import { mixpanelEventName } from '../../analytics/analytics';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { handleFormSubmitException } from '../../forms/validation';
import { useCreateUserOnboardingMutation } from '../api/api';
import FavouriteDishes from './FavouriteDishes';
import OnboardingDietary from './OnboardingDietary';
import OnboardingHeader from './OnboardingHeader';
import OnboardingItemHeader from './OnboardingItemHeader';
import OnboardingTrickQuestion from './OnboardingTrickQuestion';
import {
  FAVOURITE_DISHES,
  SAVED_ITEMS,
  WEEK_PLANNER,
} from '../../../modules/intro/data/onboarding';
import { MixPanelContext } from '../../../modules/mixpanel/context/MixpanelContext';
import useNotifications from '../../../modules/notifications/hooks/useNotifications';
import ControlledSurveyCounter from '../../../modules/track/components/SurveyCounter';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Dimensions,
  ImageRequireSource,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { labelLarge } from '../../../theme/typography';
import * as Yup from 'yup';

const schema = Yup.object({
  postcode: Yup.string().required('Please enter your postcode'),
  suburb: Yup.string().required('Please enter your suburb'),
  noOfAdults: Yup.number().required('Please enter the number of adults'),
  noOfChildren: Yup.number().required('Please enter the number of children'),
  dietaryRequirements: Yup.array().required(
    'Please select at least one dietary requirement',
  ),
  allergies: Yup.array().required('Please select at least one allergy'),
  tastePreference: Yup.array().required(
    'Please select at least one taste preference',
  ),
  trackSurveyDay: Yup.string().required('Please select a day'),
});

interface FormData {
  postcode: string;
  suburb: string;
  noOfAdults: number;
  noOfChildren: number;
  dietaryRequirements: string[];
  allergies: string[];
  tastePreference: string[];
  trackSurveyDay: string;
}

const defaultValues: FormData = {
  postcode: '',
  suburb: '',
  noOfAdults: 0,
  noOfChildren: 0,
  dietaryRequirements: [],
  allergies: [],
  tastePreference: FAVOURITE_DISHES.map(dish => dish.title),
  trackSurveyDay: '',
};

const screenWidth = Dimensions.get('window').width;

interface CarouselItem {
  id: number;
  welcomeMessage?: string;
  image?: ImageRequireSource;
  heading?: string | ((weekPlanner: string) => string);
  buttonText: string;
  showPostcodeInput?: boolean;
  showPeopleInput?: boolean;
  showDietaryInput?: boolean;
  showFavouriteDishes?: boolean;
  showDayResult?: boolean;
  description: string | ((weekPlanner: string) => string);
  subHeading?: string;
  bigHeading?: string;
  subDescription?: string;
  showWeekPlanner?: boolean;
  showSavedItems?: boolean;
  showSavedResult?: boolean;
  showNotifications?: boolean;
}

export default function OnboardingCarousel({ data }: { data: CarouselItem[] }) {
  const linkTo = useLinkTo();
  const flatListRef = useRef<FlatList<any>>(null);
  const [mixpanel] = useContext(MixPanelContext);

  const { registerForNotifications } = useNotifications();

  const handleAllowNotificationsPressed = () => {
    registerForNotifications();
  };

  const getItemLayout = (_data: any, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  });

  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentSlideSize =
        screenWidth || event.nativeEvent.layoutMeasurement.width;
      const index = event.nativeEvent.contentOffset.x / currentSlideSize;
      const roundIndex = Math.round(index);

      setCurrentIndex(roundIndex);
    },
    [],
  );

  const scrollToItem = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        animated: true,
        index,
      });
    }
  };

  const [createUserOnboarding, { isLoading }] =
    useCreateUserOnboardingMutation();

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    // formState: { errors },
  } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const trackSurveyDay = watch('trackSurveyDay');
  const postcode = watch('postcode');
  const {
    sendAnalyticsEvent,
    sendOnboardingEventAnalytics,
    sendFailedEventAnalytics,
  } = useAnalytics();

  const onOnboardingComplete = handleSubmit(async data => {
    if (_.isEmpty(data)) {
      // No new data. Lets return
      return;
    }

    try {
      try {
        const result = await createUserOnboarding({
          ...data,
          trackSurveyDay:
            data.trackSurveyDay === 'i don’t have a set day'
              ? 'sunday'
              : data.trackSurveyDay,
        }).unwrap();

        if (result) {
          sendAnalyticsEvent({
            event: mixpanelEventName.actionClicked,
            properties: {
              action: mixpanelEventName.onboardingComplete,
            },
          });
          mixpanel?.getPeople().set({
            allergies: data.allergies,
            dietary_requirements: data.dietaryRequirements,
            adult_number: data.noOfAdults,
            child_number: data.noOfChildren,
            postcode: data.postcode,
            suburb: data.suburb,
            taste_preference: data.tastePreference,
            track_survey_day: data.trackSurveyDay,
            household_composition: `${data.noOfAdults} Adult ${data.noOfChildren} Children`,
          });

          linkTo('/feed');
        }
      } catch (error: unknown) {
        // Whoopss.
        sendFailedEventAnalytics('User update error' + { error });
        Alert.alert('User update error', JSON.stringify(error));
      }
    } catch (e) {
      sendFailedEventAnalytics(e);
      handleFormSubmitException(e, setError);
    }
  });

  // Onboarding values
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [savedItems, setSavedItems] = useState<string[]>([]);

  useEffect(() => {
    setValue('dietaryRequirements', dietaryRequirements);
  }, [setValue, dietaryRequirements]);

  useEffect(() => {
    setValue('allergies', allergies);
  }, [setValue, allergies]);

  return (
    <>
      <SafeAreaView edges={['top']} style={tw`flex-1`}>
        <OnboardingHeader
          progress={currentIndex / (data.length - 1)}
          onPressBack={() => {
            // Reset scroll before prev step
            scrollViewRef?.current?.scrollToPosition(0, 0, true);

            if (
              data[currentIndex].showSavedItems &&
              trackSurveyDay === 'I don’t have a set day'
            ) {
              scrollToItem(currentIndex - 2);
            } else {
              scrollToItem(currentIndex - 1);
            }
          }}
        />
        <View style={tw`flex-1 justify-between`}>
          <KeyboardAwareScrollView
            decelerationRate={10}
            contentContainerStyle={tw`pb-5.5`}
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
          >
            <FlatList
              ref={flatListRef}
              data={data}
              renderItem={({ item }) => {
                return (
                  <View
                    style={tw`px-5 w-[${Dimensions.get('window').width}px]`}
                    key={item.id}
                  >
                    <View
                      style={tw`gap-10 w-[${
                        Dimensions.get('window').width - 40
                      }px]`}
                    >
                      <ScrollView
                        style={tw`mx-1px py-1px]`}
                        bounces={false}
                        keyboardDismissMode="on-drag"
                      >
                        <OnboardingItemHeader
                          image={item.image}
                          itemId={item.id}
                          heading={
                            item.id === 9 && typeof item.heading === 'function'
                              ? item.heading(savedItems.length > 5)
                              : typeof item.heading === 'function'
                              ? item.heading(trackSurveyDay.toLowerCase())
                              : item.heading
                          }
                          welcomeMessage={item.welcomeMessage}
                          subHeading={item.subHeading}
                          description={
                            typeof item.description === 'function'
                              ? item.description(trackSurveyDay)
                              : item.description
                          }
                          subDescription={item.subDescription}
                          bigHeading={item.bigHeading}
                          showPostcodeInput={item.showPostcodeInput}
                          control={control}
                          setValue={setValue}
                        />
                      </ScrollView>

                      {item.showPeopleInput && (
                        <View style={tw``}>
                          <ControlledSurveyCounter
                            name="noOfAdults"
                            title="Adults"
                            control={control}
                            theme="dark"
                          />
                          <View style={tw`mb-6.5 h-px w-full bg-strokecream`} />
                          <ControlledSurveyCounter
                            name="noOfChildren"
                            title="Children"
                            control={control}
                            theme="dark"
                          />
                        </View>
                      )}

                      {item.showDietaryInput && (
                        <OnboardingDietary
                          dietaryRequirements={dietaryRequirements}
                          setDietaryRequirements={setDietaryRequirements}
                          allergies={allergies}
                          setAllergies={setAllergies}
                        />
                      )}

                      {item.showFavouriteDishes && (
                        <FavouriteDishes
                          data={FAVOURITE_DISHES}
                          name="tastePreference"
                          control={control}
                        />
                      )}

                      {item.showWeekPlanner && (
                        <RadioGroup
                          values={WEEK_PLANNER}
                          name="trackSurveyDay"
                          control={control}
                        />
                      )}

                      {item.showSavedItems && (
                        <CheckGroupWithImage
                          values={SAVED_ITEMS}
                          selectedValues={savedItems}
                          setSelectedValues={setSavedItems}
                        />
                      )}

                      {item.showSavedResult && <OnboardingTrickQuestion />}
                    </View>
                  </View>
                );
              }}
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              bounces={false}
              decelerationRate={0}
              getItemLayout={getItemLayout}
              renderToHardwareTextureAndroid
              contentContainerStyle={tw.style(`mb-1 content-center`)}
              snapToInterval={screenWidth}
              snapToAlignment="start"
              onScroll={onScroll}
              scrollEventThrottle={16}
              viewabilityConfig={{
                itemVisiblePercentThreshold: 100,
              }}
              initialScrollIndex={0}
              keyboardShouldPersistTaps="handled"
            />
          </KeyboardAwareScrollView>

          <View style={tw`mb-2.5 w-full gap-3 px-5`}>
            <PrimaryButton
              onPress={() => {
                sendOnboardingEventAnalytics(currentIndex);

                if (data[currentIndex].showNotifications) {
                  handleAllowNotificationsPressed();
                }

                if (currentIndex < data.length - 1) {
                  // Reset scroll before next step
                  scrollViewRef?.current?.scrollToPosition(0, 0, true);

                  if (
                    data[currentIndex].showWeekPlanner &&
                    trackSurveyDay === 'I don’t have a set day'
                  ) {
                    scrollToItem(currentIndex + 2);
                  } else {
                    scrollToItem(currentIndex + 1);
                  }
                } else {
                  onOnboardingComplete();
                }
              }}
              width="full"
              loading={isLoading}
              buttonSize="large"
              disabled={
                (data[currentIndex].showSavedItems && savedItems.length < 1) ??
                (data[currentIndex].showWeekPlanner && trackSurveyDay === '') ??
                (data[currentIndex].showPostcodeInput &&
                  (postcode === '' || postcode.length <= 3))
              }
            >
              {data[currentIndex].buttonText}
            </PrimaryButton>
            {data[currentIndex].showPostcodeInput && (
              <SecondaryButton
                onPress={() => {
                  setValue('postcode', '0000');
                  setValue('suburb', 'Outside Australia');
                  scrollToItem(currentIndex + 1);
                }}
              >
                <Text style={tw.style(labelLarge, 'text-center')}>
                  I am outside Australia
                </Text>
              </SecondaryButton>
            )}
            {data[currentIndex].showNotifications && (
              <Pressable
                style={tw`py-2`}
                onPress={() => {
                  onOnboardingComplete();
                }}
              >
                <Text style={tw.style(labelLarge, 'text-center')}>
                  No thanks
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
