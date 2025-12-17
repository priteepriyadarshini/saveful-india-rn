import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import GenericCarouselPagination from '../../../common/components/GenericCarousel/GenericCarouselPagination';
import tw from '../../../common/tailwind';
import _ from 'lodash';
import { mixpanelEventName } from '../../analytics/analytics';
import { handleFormSubmitException } from '../../forms/validation';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
//import { useCreateUserTrackSurveyMutation } from 'modules/track/api/api';
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
  //const linkTo = useLinkTo();
  const navigation = useNavigation<TrackStackScreenProps<'TrackHome'>['navigation']>();


  const insets = useSafeAreaInsets();
  const paddingTop = `pt-[${insets.top}px]`;
  const paddingBottom = `pb-${insets.bottom + 80}px`;

  // const [createUserTrackSurvey, { isSuccess }] =
  //   useCreateUserTrackSurveyMutation(); //Uncommnet when available

  //Temporary MOCK Data
const [isSuccess, setIsSuccess] = useState(false);

type SurveyApiResponse = {
  spent: string;
  waste: string;
  co2_savings?: number;
  cost_savings?: number;
  food_saved?: number;
};

const createUserTrackSurvey = async (data: FormData): Promise<SurveyApiResponse> =>  {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        spent: '1200',
        waste: '300',
        co2_savings: 15,
        cost_savings: 200,
        food_saved: 5,
      });
    }, 1000);
  });
};
//Temporary data ends here

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
    // setValue,
    setError,
    // formState: { errors },
  } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  sendTimeEventAnalytics(mixpanelEventName.weeklySurveyScreenView);

  // Get the current date
  const currentDate = new Date();
  const dateAsString = currentDate.toISOString();

  const onSurveyComplete = handleSubmit(async data => {
    if (_.isEmpty(data)) {
      // No new data. Lets return
      return;
    }

    try {
      try {
        //const result = await createUserTrackSurvey(data).unwrap(); //Uncomment when available
        const result = await createUserTrackSurvey(data); 

        if (result) {
          // TODO: Change after getting the result from the API
          setSurveyResult(
            SAVINGS({
              spent: result.spent,
              waste: result.waste,
              co2Savings: result.co2_savings ? Number(result.co2_savings) : 0,
              co2SavingsPersonalBest: null,
              costSavings: result.cost_savings
                ? Number(result.cost_savings)
                : 0,
              costSavingsPersonalBest: null,
              foodSaved: result.food_saved ? Number(result.food_saved) : 0,
              foodSavedPersonalBest: null,
            }),
          );

          const props = {
            location: newCurrentRoute,
            action: mixpanelEventName.weeklySurveyCompleted,
            completed_on: dateAsString,
            ...data,
            ...surveyResult,
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
      } catch (error: unknown) {
        // Whoopss.
        sendFailedEventAnalytics(error);
        Alert.alert('Update error', JSON.stringify(error));
      }
    } catch (e) {
      sendFailedEventAnalytics(e);
      handleFormSubmitException(e, setError);
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
    navigation.reset({
    index: 0,
    routes: [{ name: 'TrackHome' }],
  });
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
          <StartSurvey setIsStartSurvey={setIsStartSurvey} />
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
