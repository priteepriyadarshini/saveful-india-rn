import { OnboardingConfig } from '../api/onboardingApi';
import { ImageRequireSource } from 'react-native';

const imageAssets: Record<string, ImageRequireSource> = {
  'onboarding-01': require('../../../../assets/onboarding/01.png'),
  'onboarding-02': require('../../../../assets/onboarding/02.png'),
  'onboarding-day-result': require('../../../../assets/onboarding/day-result.png'),
  'notification-placeholder': require('../../../../assets/placeholder/notification.png'),
};

export interface CarouselItem {
  id: number;
  welcomeMessage?: string;
  image?: ImageRequireSource;
  heading?: string | ((param?: any) => string);
  buttonText: string;
  showPostcodeInput?: boolean;
  showPeopleInput?: boolean;
  showDietaryInput?: boolean;
  showFavouriteDishes?: boolean;
  showDayResult?: boolean;
  description: string | ((param?: any) => string);
  subHeading?: string;
  bigHeading?: string;
  subDescription?: string;
  showWeekPlanner?: boolean;
  showSavedItems?: boolean;
  showSavedResult?: boolean;
  showNotifications?: boolean;
}

export function transformOnboardingConfig(
  configs: OnboardingConfig[],
  firstName?: string,
): CarouselItem[] {
  return configs.map((config) => {
    const item: CarouselItem = {
      id: config.stepNumber,
      buttonText: config.buttonText,
      description: config.description,
    };

    // Add optional fields if they exist
    if (config.welcomeMessage) {
      item.welcomeMessage = config.welcomeMessage.replace(
        '{firstName}',
        firstName || '',
      );
    }

    if (config.heading) {
      item.heading = config.heading;
    }

    if (config.subHeading) {
      item.subHeading = config.subHeading;
    }

    if (config.bigHeading) {
      item.bigHeading = config.bigHeading;
    }

    if (config.subDescription) {
      item.subDescription = config.subDescription;
    }

    // Map image key to actual image asset
    if (config.imageKey && imageAssets[config.imageKey]) {
      item.image = imageAssets[config.imageKey];
    }

    // Set behavior flags
    item.showPostcodeInput = config.showPostcodeInput;
    item.showPeopleInput = config.showPeopleInput;
    item.showDietaryInput = config.showDietaryInput;
    item.showFavouriteDishes = config.showFavouriteDishes;
    item.showWeekPlanner = config.showWeekPlanner;
    item.showSavedItems = config.showSavedItems;
    item.showSavedResult = config.showSavedResult;
    item.showDayResult = config.showDayResult;
    item.showNotifications = config.showNotifications;

    return item;
  });
}


export const FALLBACK_ONBOARDING = (firstName?: string): CarouselItem[] => [
  {
    id: 1,
    welcomeMessage: `Welcome ${firstName ?? ''} 👋`,
    subHeading: "Let's get to know you (and your household).",
    description:
      'Your answers will help us provide a customized experience.',
    image: require('../../../../assets/onboarding/01.png'),
    buttonText: "Let's go",
  },
  {
    id: 2,
    heading: 'Where are you located?',
    showPostcodeInput: true,
    description:
      'Your location information helps us provide localized suggestions.',
    image: require('../../../../assets/onboarding/02.png'),
    buttonText: 'Next',
  },
  {
    id: 3,
    heading: 'Who do you usually cook for?',
    buttonText: "That's it",
    description: '',
    showPeopleInput: true,
  },
  {
    id: 4,
    heading: 'Got any dietary requirements?',
    description:
      'Let us know which of the following apply to you or your household.',
    buttonText: "That's it",
    showDietaryInput: true,
  },
  {
    id: 5,
    heading: 'When do you plan food for the week?',
    description:
      "We've all got that one day when we get ready for the week ahead. When's yours?",
    buttonText: 'Next',
    showWeekPlanner: true,
  },
  {
    id: 6,
    heading: (day?: string) =>
      `${
        day === "i don't have a set day"
          ? "WE'RE NOT ALL PLANNERS. BUT, WE CAN ALL BE SAVERS!"
          : `GREAT! We'll check in on ${day}`
      }`,
    buttonText: 'Next',
    image: require('../../../../assets/onboarding/day-result.png'),
    description: (day?: string) =>
      `${
        day?.toLowerCase() === "i don't have a set day"
          ? "We'll check back in a week to ask a few quick questions and give you tailored tips to help you save food, time and money."
          : "We'll ask a few quick questions and give you tailored tips to help you save food, time and money."
      }`,
    showDayResult: true,
  },
  {
    id: 7,
    bigHeading: 'May we send you notifications?',
    subDescription:
      "We'd love to help you save even more food, money and time. No spam, ever.",
    buttonText: 'Turn on notifications',
    description: '',
    image: require('../../../../assets/placeholder/notification.png'),
    showNotifications: true,
  },
];
