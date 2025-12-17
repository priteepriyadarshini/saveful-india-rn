import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AnimatedHeader from '../../../common/components/AnimatedHeader';
import DebouncedPressable from '../../../common/components/DebouncePressable';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import SkeletonLoader from '../../../common/components/SkeletonLoader';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import useArrayState from '../../../common/hooks/useArrayState';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import useEnvironment from '../../../modules/environment/hooks/useEnvironment';
import {
  MakeStackParamList,
  MakeStackScreenProps,
} from '../../../modules/make/navigation/MakeNavigation';
import { InitialStackParamList } from '../../navigation/navigator/InitialNavigator';
import PrepCarousel from '../../../modules/prep/components/PrepCarousel';
import PrepComponent from '../../../modules/prep/components/PrepComponent';
import PrepFavorite from '../../../modules/prep/components/PrepFavorite';
import PrepFlavor from '../../../modules/prep/components/PrepFlavor';
import PrepInfoSticker from '../../../modules/prep/components/PrepInfoSticker';
import PrepIt from '../../../modules/prep/components/PrepIt';
import PrepVideo from '../../../modules/prep/components/PrepVideo';
import TutorialModal from '../../../modules/prep/components/TutorialModal';
import { PREPTUTORIAL } from '../../../modules/prep/data/data';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
//import { useCreateUserMealMutation } from 'modules/track/api/api';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { h2TextStyle, subheadMediumUppercase } from '../../../theme/typography';


// DEMO: Replace this with your actual mutation hook when ready
type CreateUserMealPayload = {
  frameworkId: string;
  variantId: string;
  completed: boolean;
  saved: boolean;
};

type CreateUserMealHook = () => [
  (payload: CreateUserMealPayload) => Promise<{ id: string }>,
  { isLoading: boolean }
];

const useCreateUserMealMutation: CreateUserMealHook = () => {
  const createUserMeal = async (payload: CreateUserMealPayload) => {
    return new Promise<{ id: string }>((resolve) => {
      setTimeout(() => {
        resolve({ id: `demo-meal-${Date.now()}` });
      }, 500);
    });
  };

  return [createUserMeal, { isLoading: false }];
};




const StorageKey = 'PrepTutorial';

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth - 60;

export default function PrepScreen({
  // navigation,
  route: {
    params: { slug },
  },
}: MakeStackScreenProps<'PrepDetail'>) {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<InitialStackParamList & MakeStackParamList>
    >();
  const offset = useRef(new Animated.Value(0)).current;

  const { sendAnalyticsEvent, sendScrollEventInitiation } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  const env = useEnvironment();

  const skeletonStyles = [
    `h-10 w-[${itemLength}px] mt-3 mb-1 items-center`,
    `h-10 w-[${itemLength}px] mb-3 items-center`,
    `h-6 rounded-full w-[${itemLength - 100}px] mb-10 items-center`,
    `mb-3 h-[311px] w-[${itemLength}px] overflow-hidden rounded-2lg`,
    `mb-3 h-[311px] w-[${itemLength}px] overflow-hidden rounded-2lg`,
  ];

  const { getFrameworkBySlug } = useContent();
  const [framework, setFramework] = React.useState<IFramework>();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isFirstPrepSession, setIsFirstPrepSession] =
    React.useState<boolean>(false);

  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const selectFlavor = (item: string) => {
    setSelectedFlavor(item);
  };

  const [allRequiredIngredients, setAllRequiredIngredients] = useArrayState<
    {
      id: string;
      title: string;
      quantity: string;
      preparation?: string;
      ingredientId: string;
    }[]
  >();
  const [allOptionalIngredients, setAllOptionalIngredients] = useArrayState<
    {
      id: string;
      title: string;
      quantity: string;
      preparation?: string;
      ingredientId: string;
    }[]
  >();

  const setDefaultRequiredIngredients = () => {
    if (!framework) return;

    const data = framework;

    // set default required ingredients
    setAllRequiredIngredients.set(
      data.components
        .filter(component =>
          component.includedInVariants.some(
            variant => variant.id === selectedFlavor,
          ),
        )
        .map(component => {
          return component.requiredIngredients.map(item => ({
            id: component.id,
            title: item.recommendedIngredient[0].title,
            quantity: item.quantity,
            preparation: item.preparation,
            ingredientId: item.recommendedIngredient[0].id,
          }));
        }),
    );
  };

  const getFrameworksData = async () => {
    const data = await getFrameworkBySlug(slug);

    if (data) {
      setFramework(data);

      // set default flavor
      setSelectedFlavor(data.variantTags[0].id);
      setIsLoading(false);

      setDefaultRequiredIngredients();
    } else {
      navigation.navigate('FrameworkNotFound');
    }
  };

  useEffect(() => {
    if (selectedFlavor) {
      setDefaultRequiredIngredients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlavor]);

  useEffect(() => {
    const checkIsFirstPrepTutorial = async () => {
      const isFirstPrepTutorial = await AsyncStorage.getItem(StorageKey);

      if (!isFirstPrepTutorial) {
        setIsFirstPrepSession(true);
      }
    };

    checkIsFirstPrepTutorial();
  }, []);

  useEffect(() => {
    getFrameworksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const [createUserMeal, { isLoading: isCreateUserMealLoading }] =
    useCreateUserMealMutation();

  const onMakeIt = useCallback(async () => {
    if (isCreateUserMealLoading || !framework) {
      return;
    }

    try {
      const result = await createUserMeal({
        frameworkId: framework.id,
        variantId: selectedFlavor,
        completed: false,
        saved: true, // Use this for notifications
      });  // use.unwrap() when the mock data is removed

      if (result) {
        sendAnalyticsEvent({
          event: mixpanelEventName.actionClicked,
          properties: {
            location: newCurrentRoute,
            action: mixpanelEventName.makeItPressed,
            title: framework?.title,
            ingredients: [
              ...allRequiredIngredients.flatMap(item => item),
              ...allOptionalIngredients.flatMap(item => item),
            ].map(item => item.title),
            result,
          },
        });

        sendAnalyticsEvent({
          event: mixpanelEventName.actionClicked,
          properties: {
            location: newCurrentRoute,
            action: mixpanelEventName.prepIngredientSelected,
            title: framework?.title,
            ingredients: [
              ...allRequiredIngredients.flatMap(item => item),
              ...allOptionalIngredients.flatMap(item => item),
            ].map(item => item.title),
            result,
          },
        });

        navigation.navigate('MakeIt', {
          id: framework.id,
          variant: selectedFlavor,
          ingredients: [
            ...allRequiredIngredients.flatMap(item => item),
            ...allOptionalIngredients.flatMap(item => item),
          ],
          mealId: result.id,
        });
      }
    } catch (error: unknown) {
      Alert.alert('Create meal error', JSON.stringify(error));
    }
  }, [
    allOptionalIngredients,
    allRequiredIngredients,
    createUserMeal,
    framework,
    isCreateUserMealLoading,
    navigation,
    newCurrentRoute,
    selectedFlavor,
    sendAnalyticsEvent,
  ]);

  if (!framework || isLoading) {
    return (
      <View style={tw`flex-1 bg-creme`}>
        <AnimatedHeader animatedValue={offset} title={framework?.title} />
        <ScrollView>
          <SafeAreaView
            edges={['bottom']}
            style={tw`flex-row flex-wrap justify-center`}
          >
            <SkeletonLoader styles={skeletonStyles} />
          </SafeAreaView>
          <FocusAwareStatusBar statusBarStyle="dark" />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-creme`}>
      <AnimatedHeader animatedValue={offset} title={framework.title} />

      <ScrollView
        contentContainerStyle={tw`pb-20`}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: offset } } }],
          {
            useNativeDriver: false,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) =>
              sendScrollEventInitiation(event, 'Framework Page Interacted'),
          },
        )}
      >
        <SafeAreaView edges={['bottom']}>
          <View style={tw`w-full items-center justify-start px-5`}>
            <View style={tw.style('gap-2 py-3')}>
              {framework.frameworkSponsor &&
                framework.frameworkSponsor.length > 0 && (
                  <View style={tw`flex-row items-center justify-center gap-2`}>
                    <Text
                      style={tw.style(subheadMediumUppercase, `text-center`)}
                    >
                      Presented by
                    </Text>
                    <View style={tw`shrink-0`}>
                      {(framework.frameworkSponsor[0]?.sponsorLogo[0]?.url ||
                        framework.frameworkSponsor[0]
                          ?.sponsorLogoBlackAndWhite[0]?.url) && (
                        <Image
                          style={[tw`h-[35px] w-[96px]`]}
                          resizeMode="contain"
                          source={bundledSource(
                            framework.frameworkSponsor[0]?.sponsorLogo[0]?.url
                              ? framework.frameworkSponsor[0]?.sponsorLogo[0]
                                  ?.url
                              : framework.frameworkSponsor[0]
                                  ?.sponsorLogoBlackAndWhite[0]?.url,
                            env.useBundledContent,
                          )}
                          accessibilityIgnoresInvertColors
                        />
                      )}
                    </View>
                  </View>
                )}
              <Text
                style={tw.style(h2TextStyle, 'text-center')}
                maxFontSizeMultiplier={1}
              >
                {framework.title}
              </Text>
            </View>
          </View>

          <PrepFavorite
            frameworkId={framework.id}
            frameworkName={framework.title}
          />

          <PrepInfoSticker
            portions={framework.portions}
            prepAndCookTime={framework.prepAndCookTime}
            sticker={framework.sticker}
            heroImage={framework.heroImage}
          />

          <PrepCarousel
            shortDescription={framework.shortDescription}
            description={framework.description}
            freezeKeepTime={framework.freezeKeepTime}
            fridgeKeepTime={framework.fridgeKeepTime}
            hackOrTip={framework.hackOrTip}
            frameworkId={framework.id}
            frameworkName={framework.title}
          />

          {framework.youtubeId && <PrepVideo id={framework.youtubeId} />}

          {framework.variantTags.length > 1 && (
            <PrepFlavor
              flavors={framework.variantTags}
              selectedFlavor={selectedFlavor}
              selectFlavor={selectFlavor}
            />
          )}

          <PrepIt
            shortDescription={framework.prepShortDescription}
            description={framework.prepLongDescription}
          />

          {/* Filter the components based on the selectedFlavour id being one of the includedInVariants */}
          {framework.components
            .filter(component =>
              component.includedInVariants.some(
                variant => variant.id === selectedFlavor,
              ),
            )
            .map((component, index) => (
              <PrepComponent
                key={component.id}
                {...component}
                index={index}
                allRequiredIngredients={allRequiredIngredients}
                setAllRequiredIngredients={setAllRequiredIngredients}
                setAllOptionalIngredients={setAllOptionalIngredients}
              />
            ))}
        </SafeAreaView>
      </ScrollView>

      <DebouncedPressable
        style={tw.style(
          'absolute bottom-0 mr-1 flex w-full items-center justify-center rounded-tl-2lg rounded-tr-2lg bg-kale py-3.5',
        )}
        onPress={onMakeIt}
      >
        <Text
          style={tw.style('font-sans-bold text-2xl text-white')}
          maxFontSizeMultiplier={1}
        >
          MAKE IT
        </Text>
      </DebouncedPressable>
      <TutorialModal
        data={PREPTUTORIAL}
        isFirst={isFirstPrepSession}
        setIsFirst={setIsFirstPrepSession}
        storageKey={StorageKey}
      />
      <FocusAwareStatusBar statusBarStyle="dark" />
    </View>
  );
}
