import AsyncStorage from '@react-native-async-storage/async-storage';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import { getAllIngredientsFromComponents } from '../../../common/helpers/filterIngredients';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import CompletedCookWithSurvey from '../../../modules/make/components/CompletedCookWithSurvey';
import MakeItCarousel from '../../../modules/make/components/MakeItCarousel';
import MakeItHeader from '../../../modules/make/components/MakeItHeader';
import MakeItNavigation from '../../../modules/make/components/MakeItNavigation';
import MakeItSurveyModal from '../components/MakeItSurveyModal';
import { InitialNavigationStackParams } from '../../navigation/navigator/InitialNavigator';
import TutorialModal from '../../../modules/prep/components/TutorialModal';
import { MAKETUTORIAL } from '../../../modules/prep/data/data';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  ImageRequireSource,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('screen').width;
const StorageKey = 'MakeTutorial';

export default function MakeItScreen({
  route: {
    params: { id, variant, ingredients, mealId },
  },
}: InitialNavigationStackParams<'MakeIt'>) {
  const { getFramework } = useContent();
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  const [framework, setFramework] = useState<IFramework>();
  const [isIntercted, setIsIntercted] = useState<boolean>(false);
  const [isFirstMakeSession, setIsFirstMakeSession] = useState<boolean>(false);
  const [isIngredientsModalVisible, setIngredientsModalVisible] =
    useState(false);
  const [isCompletedModalVisible, setIsCompletedModalVisible] = useState(false);
  const [preExistingIngredients, setPreExistingIngredients] = useState<
    { id: string; title: string; averageWeight: number }[]
  >([]);

  const getFrameworksData = async () => {
    const data = await getFramework(id);

    if (data) {
      setFramework(data);
    }
  };

  useEffect(() => {
    const checkIsFirstMakeTutorial = async () => {
      const isFirstMakeTutorial = await AsyncStorage.getItem(StorageKey);

      if (!isFirstMakeTutorial) {
        setIsFirstMakeSession(true);
      } else {
        setIngredientsModalVisible(true);
      }
    };

    checkIsFirstMakeTutorial();
  }, []);

  useEffect(() => {
    getFrameworksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [slideIndex, setSlideIndex] = useState(0);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentSlideSize =
        screenWidth || event.nativeEvent.layoutMeasurement.width;
      const index = event.nativeEvent.contentOffset.x / currentSlideSize;

      const roundIndex = Math.round(index);

      setSlideIndex(index);

      if (setCurrentIndex !== undefined) {
        setCurrentIndex(roundIndex);
      }
    },
    [setCurrentIndex, setSlideIndex],
  );

  useEffect(() => {
    if (!isIntercted && currentIndex > 1) {
      setIsIntercted(true);
      sendAnalyticsEvent({
        event: mixpanelEventName.actionClicked,
        properties: {
          location: newCurrentRoute,
          action: 'Make Ingredient Interacted',
          meal_id: framework?.id,
          meal_name: framework?.title,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  if (!framework) {
    return null;
  }

  let iconSource: ImageRequireSource;

  switch (currentIndex) {
    case 0:
    case 5:
    case 10:
      iconSource = require('../../../../assets/animations/cook-01.png');
      break;
    case 1:
    case 6:
    case 11:
      iconSource = require('../../../../assets/animations/cook-02.png');
      break;
    case 2:
    case 7:
    case 12:
      iconSource = require('../../../../assets/animations/cook-03.png');
      break;
    case 3:
    case 8:
    case 13:
      iconSource = require('../../../../assets/animations/cook-04.png');
      break;
    case 4:
    case 9:
    case 14:
      iconSource = require('../../../../assets/animations/cook-05.png');
      break;
    default:
      iconSource = require('../../../../assets/animations/cook-01.png');
      break;
  }

  const makeItSteps = framework.components
    .filter(component =>
      component.includedInVariants.some(item => item.id === variant),
    )
    .flatMap(component =>
      component.componentSteps.map(step => ({
        ...step,
        // Title of the component
        title: component.componentTitle,
        // Only ingredients that are required for this component
        ingredients: ingredients.filter(item => item.id === component.id),
      })),
    )
    // Remove any steps that don't have ingredients
    .filter((item, index, array) => {
      if (item.alwaysShow || index === array.length - 1) {
        return true;
      }

      return item.ingredients.length > 0;
    })
    // Remove any steps if relevantIngredients is not empty and the step doesn't have any of the relevant ingredients
    .filter((item, index, array) => {
      if (item.alwaysShow || index === array.length - 1) {
        return true;
      }

      if (item.relevantIngredients.length === 0) {
        return true;
      }

      return item.ingredients.some(
        ingredient =>
          item.relevantIngredients.findIndex(
            item => item.title === ingredient.title,
          ) !== -1,
      );
    })
    // Add a step to the end of the array to show the "Let's eat" screen
    .concat({
      title: 'Let’s eat',
      ingredients: [],
      id: 'lets-eat',
      stepInstructions: `<p>That’s it! Time to eat!</p>`,
      hackOrTip: [],
      relevantIngredients: [],
      alwaysShow: true,
    });

  if (!makeItSteps) {
    return null;
  }

  // To capture feedback regarding the ingredients used in the meal
  const usedIngredients = makeItSteps
    .flatMap(item => item.ingredients)
    .map(item => item.title);

  const mealIngredients = getAllIngredientsFromComponents(framework.components)
    .filter(
      (ingredient, index, self) =>
        index === self.findIndex(t => t.id === ingredient.id),
    )
    // Show only the ingredients actually used in make this dish
    // Using title as a unique identifier
    .filter(ingredient => usedIngredients?.includes(ingredient.title))
    // Sort by title
    .sort((a, b) => a.title.localeCompare(b.title));

  // Total weight of selected ingredients
  const totalWeightOfSelectedIngredients = preExistingIngredients.reduce(
    (acc, ingredient) => acc + ingredient.averageWeight,
    0,
  );

  const completedSteps = () => {
    const percentage = (currentIndex + 1 / makeItSteps.length) * 100;
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: 'Make Steps Progressed',
        total_steps: makeItSteps.length,
        completed_steps: currentIndex + 1,
        end_steps: makeItSteps[currentIndex].title,
        total_percentage: Math.min(100, Math.max(0, percentage)),
        meal_id: framework?.id,
        meal_name: framework?.title,
      },
    });
  };

  return (
    <View style={tw`flex-1 bg-kale`}>
      <ImageBackground
        source={require('../../../../assets/ribbons/makeit.png')}
        style={tw`relative flex-1`}
      >
        <MakeItHeader
          completedSteps={completedSteps}
          mealName={framework?.title}
          title={makeItSteps?.[currentIndex]?.title ?? ''}
          mealId={mealId}
          frameworkId={id}
        />

        <Image
          style={[
            tw`absolute bottom-0 left-0 w-[${
              Dimensions.get('screen').width
            }px] h-[${
              (Dimensions.get('screen').width * 288) / 636
            }px] opacity-50`,
          ]}
          resizeMode="contain"
          source={iconSource}
          accessibilityIgnoresInvertColors
        />

        <View style={tw`relative flex-1`}>
          <SafeAreaView edges={['top']}>
            <View style={tw`h-full items-center justify-start py-11`}>
              <MakeItNavigation
                slideIndex={slideIndex}
                currentIndex={currentIndex}
                items={makeItSteps}
              />

              <MakeItCarousel
                frameworkId={id}
                title={framework?.title}
                data={makeItSteps}
                totalWeightOfSelectedIngredients={
                  totalWeightOfSelectedIngredients
                }
                mealId={mealId}
                completedSteps={completedSteps}
                onScroll={onScroll}
              />
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>

      <MakeItSurveyModal
        isVisible={isIngredientsModalVisible}
        setIsVisible={setIngredientsModalVisible}
        setIsCompltedModalVisible={setIsCompletedModalVisible}
        frameworkId={id}
        title={framework.title}
        mealId={mealId}
        ingredientsForComponents={makeItSteps.map(item =>
          item.ingredients.map(ingredient => ingredient.title),
        )}
        mealIngredients={mealIngredients}
        preExistingIngredients={preExistingIngredients}
        setPreExistingIngredients={setPreExistingIngredients}
        totalWeightOfSelectedIngredients={totalWeightOfSelectedIngredients}
      />

      <CompletedCookWithSurvey
        isModalVisible={isCompletedModalVisible}
        //toggleModal={toggleCompletedModal}
        setIsModalVisible={setIsCompletedModalVisible}
        totalWeightOfSelectedIngredients={totalWeightOfSelectedIngredients}
      />

      <TutorialModal
        data={MAKETUTORIAL}
        isFirst={isFirstMakeSession}
        setIsFirst={(value: boolean) => {
          setIsFirstMakeSession(value);
          if (!value) {
            setIngredientsModalVisible(true);
          }
        }}
        storageKey={StorageKey}
      />
      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
