import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import GenericCarouselPagination from '../../../common/components/GenericCarousel/GenericCarouselPagination';
import tw from '../../../common/tailwind';
import _ from 'lodash';
import { mixpanelEventName } from '../../analytics/analytics';
import { handleFormSubmitException, getSafeErrorMessage } from '../../forms/validation';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import { useCreateUserTrackSurveyMutation, useGetUserTrackSurveyEligibilityQuery } from '../../../modules/track/api/api';
import { useGetCurrentUserQuery } from '../../auth/api';
import TrackSurvey from '../../../modules/track/components/TrackSurvey';
import StartSurvey from '../components/WeeklySurvey/StartSurvey';
import SurveyResult from '../components/WeeklySurvey/SurveyResult';
import { SURVEY, SAVINGS } from '../data/data';
import { WeekResults, ISurveyList } from '../types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { TrackStackScreenProps } from '../navigation/TrackNavigation';


const schema = Yup.object({
  cookingFrequency: Yup.number().required('Please select a frequency'),
  scraps: Yup.number().required('Please select a scraps'),
  uneatenLeftovers: Yup.number().required('Please select a uneaten leftovers'),
  binnedFruit: Yup.number().required('Please select a binned fruit'),
  binnedVeggies: Yup.number().required('Please select a binned veggies'),
  binnedDairy: Yup.number().required('Please select a binned dairy'),
  binnedBread: Yup.number().required('Please select a binned bread'),
  binnedMeat: Yup.number().required('Please select a binned meat'),
  binnedHerbs: Yup.number().required('Please select a binned herbs'),
  preferredIngredients: Yup.array(Yup.string()).required(
    'Please select at least one preferred ingredient',
  ),
  noOfCooks: Yup.number().required('Please select a number of cooks'),
  promptAt: Yup.string().required('Please select a prompt at'),
});

interface FormData {
  cookingFrequency: number;
  scraps: number;
  uneatenLeftovers: number;
  binnedFruit: number;
  binnedVeggies: number;
  binnedDairy: number;
  binnedBread: number;
  binnedMeat: number;
  binnedHerbs: number;
  preferredIngredients: (string | undefined)[];
  noOfCooks: number;
  promptAt: string;
}

const defaultValues: FormData = {
  cookingFrequency: 0,
  scraps: 0,
  uneatenLeftovers: 0,
  binnedFruit: 0,
  binnedVeggies: 0,
  binnedDairy: 0,
  binnedBread: 0,
  binnedMeat: 0,
  binnedHerbs: 0,
  preferredIngredients: [],
  noOfCooks: 2,
  promptAt: new Date().toISOString(),
};

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth * 1;
const itemWidth = (windowWidth - itemLength) / 2;

export default function SurveyScreen() {
  const data = SURVEY;
  const linkTo = useLinkTo();
  const navigation = useNavigation<TrackStackScreenProps<'TrackHome'>['navigation']>();


  const insets = useSafeAreaInsets();
  const paddingTop = `pt-[${insets.top}px]`;
  const paddingBottom = `pb-${insets.bottom + 80}px`;

  const [createUserTrackSurvey, { isSuccess, isLoading }] =
    useCreateUserTrackSurveyMutation();

  const { data: currentUser } = useGetCurrentUserQuery();

  const { data: eligibilityData, isLoading: checkingEligibility } = 
    useGetUserTrackSurveyEligibilityQuery();

  const [surveyResult, setSurveyResult] = useState<WeekResults>();

  const {
    sendAnalyticsEvent,
    sendFailedEventAnalytics,
    sendTimeEventAnalytics,
  } = useAnalytics();

  const { newCurrentRoute } = useCurentRoute();

  const {
    control,
    handleSubmit,
    setError,
  } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  sendTimeEventAnalytics(mixpanelEventName.weeklySurveyScreenView);

  const currentDate = new Date();
  const dateAsString = currentDate.toISOString();

  const onSurveyComplete = handleSubmit(async formData => {
    if (_.isEmpty(formData)) {
      return;
    }

    if (!eligibilityData?.eligible) {
      Alert.alert(
        'Survey Not Available',
        eligibilityData?.message || 'You have already completed this week\'s survey. Please try again next week.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Ensure all numeric fields are integers as expected by backend
      const toInt = (v: unknown): number => {
        if (typeof v === 'number') return Math.round(v);
        const n = parseInt(String(v ?? 0), 10);
        return Number.isNaN(n) ? 0 : n;
      };

      const result = await createUserTrackSurvey({
        cookingFrequency: toInt(formData.cookingFrequency),
        scraps: toInt(formData.scraps),
        uneatenLeftovers: toInt(formData.uneatenLeftovers),
        produceWaste: {
          fruit: toInt(formData.binnedFruit),
          veggies: toInt(formData.binnedVeggies),
          dairy: toInt(formData.binnedDairy),
          bread: toInt(formData.binnedBread),
          meat: toInt(formData.binnedMeat),
          herbs: toInt(formData.binnedHerbs),
        },
        preferredIngredients: formData.preferredIngredients.filter(
          (i): i is string => !!i,
        ),
        noOfCooks: toInt(formData.noOfCooks),
        country: currentUser?.country,
      }).unwrap();

      if (result) {
        setSurveyResult(
          SAVINGS({
            spent: result.calculatedSavings.cost_savings.toString(),
            waste: result.calculatedSavings.food_saved.toString(),
            co2Savings: result.calculatedSavings.co2_savings,
            // When isCo2PersonalBest is true this is a new record — pass null so
            // SAVINGS shows "New personal best!". When false, pass the prior best
            // value so SAVINGS can show "Your personal best is X".
            co2SavingsPersonalBest: result.isCo2PersonalBest
              ? null
              : (result.prev_personal_bests?.co2_savings ?? null),
            costSavings: result.calculatedSavings.cost_savings,
            costSavingsPersonalBest: result.isCostPersonalBest
              ? null
              : (result.prev_personal_bests?.cost_savings ?? null),
            foodSaved: result.calculatedSavings.food_saved,
            foodSavedPersonalBest: result.isFoodSavedPersonalBest
              ? null
              : (result.prev_personal_bests?.food_saved ?? null),
            currencySymbol: result.calculatedSavings.currency_symbol,
          }),
        );

        const props = {
          location: newCurrentRoute,
          action: mixpanelEventName.weeklySurveyCompleted,
          completed_on: dateAsString,
          ...formData,
          ...result.calculatedSavings,
        };

        sendAnalyticsEvent({
          event: mixpanelEventName.weeklySurveyScreenView,
          properties: props,
        });

        sendAnalyticsEvent({
          event: mixpanelEventName.actionClicked,
          properties: props,
        });

        setIsCompleted(true);
      }
    } catch (error: any) {
      sendFailedEventAnalytics(error);
      
      // Handle specific error messages from backend using safe helper
      const errorMessage = getSafeErrorMessage(error, 'Failed to submit survey. Please try again.');
      
      Alert.alert('Survey Error', errorMessage, [{ text: 'OK' }]);
      handleFormSubmitException(error, setError);
    }
  });

  const scrollX = useRef(new Animated.Value(0)).current;
  const [dataWithPlaceholders, setDataWithPlaceholders] = useState<
    ISurveyList[]
  >([]);
  const currentIndex = useRef<number>(0);
  const flatListRef = useRef<any>(null);
  const [activeDotIndex, setActiveDotIndex] = useState<number>(0);
  const [isStartSurvey, setIsStartSurvey] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [selectedProduce, setSelectedProduce] = useState<string[]>([]);

  const onValueChecked = useCallback(
    (value: string) => {
      const valueIndex = selectedProduce.findIndex(x => x === value);

      if (valueIndex === -1) {
        setSelectedProduce([...selectedProduce, value]);
      } else {
        const updatedArray = [...selectedProduce];
        updatedArray.splice(valueIndex, 1);

        setSelectedProduce(updatedArray);
      }
    },
    [selectedProduce],
  );

  useEffect(() => {
    setDataWithPlaceholders([
      { id: -1 } as any,
      ...(data.surveyList as ISurveyList[]),
      { id: data.surveyList?.length },
    ]);
    currentIndex.current = 1;
  }, [data.surveyList]);

  useEffect(() => {
    scrollX.addListener(event => {
      const index = Math.round(event.value / itemLength);
      setActiveDotIndex(index);
    });
    return () => {
      scrollX.removeAllListeners();
    };
  }, [scrollX]);

  const getItemLayout = (_data: any, index: number) => ({
    length: itemLength,
    offset: itemLength * (index - 1),
    index,
  });

  const scrollToLeft = () => {
    scrollToItem(activeDotIndex - 1);
  };

  const scrollToItem = useCallback((index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        animated: true,
        index: index + 1,
      });
    }
  }, []);

  const resetForm = () => {
    setIsCompleted(false);
    setActiveDotIndex(0);
    setIsStartSurvey(false);

    const parent = (navigation as any)?.getParent?.();
    if (parent?.navigate) {
      parent.navigate('Root', { screen: 'Track' });
    } else {
      linkTo('/track');
    }
    
  };

  const HeaderMenu = () => {
    return (
      <View
        style={tw.style(
          `${
            isStartSurvey && !isCompleted
              ? 'flex-row justify-between'
              : 'items-end'
          } px-3 pt-4`,
        )}
      >
        {isStartSurvey && !isCompleted && (
          <Pressable
            onPress={() => {
              if (activeDotIndex > 0) {
                scrollToLeft();
              } else {
                setIsStartSurvey(false);
              }
            }}
          >
            <Feather name={'arrow-left'} size={20} color="white" />
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            const props = {
              location: newCurrentRoute,
              action: mixpanelEventName.weeklySurveyExit,
            };
            sendAnalyticsEvent({
              event: mixpanelEventName.weeklySurveyScreenView,
              properties: props,
            });
            sendAnalyticsEvent({
              event: mixpanelEventName.actionClicked,
              properties: props,
            });
            resetForm();
          }}
        >
          <Feather name={'x'} size={20} color="white" />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={tw`flex-1 bg-eggplant`}>
      {!isStartSurvey ? (
        <ImageBackground
          style={tw.style(paddingTop, paddingBottom)}
          imageStyle={tw.style('rounded-2xl')}
          source={require('../../../../assets/placeholder/purple-bg.png')}
        >
          <HeaderMenu />
          <StartSurvey 
            setIsStartSurvey={setIsStartSurvey} 
            eligibilityData={eligibilityData}
            isCheckingEligibility={checkingEligibility}
          />
        </ImageBackground>
      ) : (
        <>
          {isSuccess && surveyResult ? (
            <SurveyResult surveyResult={surveyResult} resetForm={resetForm} />
          ) : (
            <ImageBackground
              style={tw.style(paddingTop, paddingBottom)}
              imageStyle={tw.style('rounded-2xl')}
              source={require('../../../../assets/placeholder/purple-bg.png')}
            >
              <HeaderMenu />
              <FlatList
                ref={flatListRef}
                data={dataWithPlaceholders}
                renderItem={({ item }) => {
                  if (!item.title) {
                    return <View style={{ width: itemWidth }} />;
                  }

                  return (
                    <View style={{ width: itemLength }}>
                      <TrackSurvey
                        item={item}
                        data={data}
                        scrollToItem={(index: number) => {
                          scrollToItem(index);
                        }}
                        selectedProduce={selectedProduce}
                        setSelectedProduce={onValueChecked as any}
                        activeDotIndex={activeDotIndex}
                        control={control}
                        onSurveyComplete={onSurveyComplete}
                      />
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
                contentContainerStyle={tw.style(`mb-2 content-center`)}
                snapToInterval={itemLength}
                snapToAlignment="start"
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
                viewabilityConfig={{
                  itemVisiblePercentThreshold: 100,
                }}
              />
              <GenericCarouselPagination
                items={data.surveyList as any}
                dotSpacing={4}
                dotSize={4}
                activeDotColor="radish"
                inactiveDotColor="radish/60"
                currentIndex={activeDotIndex}
              />
            </ImageBackground>
          )}
        </>
      )}

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
