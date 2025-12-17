import { EnvironmentType } from '../../modules/environment/types';

export const infoModalEventName = 'Info Button Pressed';

export interface AnalyticsData {
  event: string;
  properties?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  email_verified?: boolean;
  as?: string;
  phone_number?: string;
  scope?: string;
  completed_onboarding?: boolean;
  app_joined_at?: string;
  account_status?: 'active' | 'deleted';
}

interface RouteConfig {
  excluded?: boolean;
  name?: string;
}

export const segmentScreens = {
  global: 'Global',
  login: 'Login',
  shop: 'Shop',
  merchant: 'Merchant',
  discover: 'Discover',
  article: 'Discovery Article',
  impact: 'Impact',
  bankLinking: 'Bank Linking',
  footprintquestionnaire: 'Footprint Questionnaire',
  purchases: 'Purchases',
  settings: 'Settings',
  monthlyPurchasesDetail: 'Monthly Purchases Detail',
  badgeDetail: 'Badge Detail',
};

export const mixpanelEventName = {
  accountUpdated: 'Account Updated',
  actionClicked: 'Action Clicked',
  actionInteracted: 'Action Interacted',
  scrollInitiated: 'Scroll Initiated',
  cookCompleted: 'Cook Completed',
  dismissNotification: 'Survey Notification Dismissed',
  enabledLocation: 'Location Enabled',
  enabledNotification: 'Notifications Enabled',
  error: 'Error Occured',
  exploreFramework: 'Explore Framework',
  faqExpanded: 'FAQ Expanded',
  filterClosed: 'Filter Closed',
  filterOpened: 'Filter Opened',
  foorprintInfoOpened: 'Footprint Info Opened',
  groupChangeOwner: 'Change Group Owner',
  groupCreate: 'Create Group',
  groupEdit: 'Edit Group',
  groupDelete: 'Delete Group',
  groupJoin: 'Join Group',
  groupLeave: 'Leave Group',
  groupRemoveMember: 'Remove Member From Group',
  groupChallengeCancel: 'Cancel Group Challenge',
  groupChallengeCreate: 'Create Group Challenge',
  groupChallengeJoin: 'Join Group Challenge',
  groupChallengeLeave: 'Leave Group Challenge',
  hackCategoryOpened: 'Hack Category Opened',
  hackDetailViewed: 'Hack Detail Viewed',
  hackVideoViewed: 'Hack Category Viewed',
  ingredientOpened: 'Ingredient List Opened',
  ingredientScrolled: 'Ingredient Scrolled',
  ingredientSearch: 'Ingredient Searched',
  ingredientSearchNoResults: 'Ingredients - No results found',
  ingredientSelected: 'Ingredient Selected',
  locationPermissionChanged: 'Location Permission State Changed',
  makeIngredientExit: 'Make Ingredient Exited',
  makeItPressed: 'Make It Pressed',
  mealViewed: 'Meal Viewed',
  notificationPermissionChanged: 'Notification Permission Changed',
  onboardingComplete: 'Onboarding Completed',
  onboardingSkipped: 'Onboarding Skipped',
  onboardingStarted: 'Onboarding Started',
  partnersOpened: 'Partners Opened',
  partnerScrolled: 'Partner Scrolled',
  passwordUpdated: 'Password Updated',
  personalisedFeedCompleted: 'Personalised Feed Completed',
  postMakeInitiate: 'Post Make Survey Initiated',
  postMakeScreenView: 'Post Make Screen View Time',
  postMakeSurveyCompleted: 'Post Make Survey Completed',
  postMakeSurveyExit: 'Post Make Survey Exited',
  postMakeSurveySubmitted: 'Post Make Survey Feedback Submitted',
  prepCarouselRead: 'Preparation Carousel Read More Opened',
  prepIngredientSelected: 'Preparation Ingredients Selected',
  preferencesUpdated: 'User Preferences Updated',
  preferenceDietaryUpdated: 'User Preferences Dietary Updated',
  profileHistoryOpened: 'Profile History Opened',
  profileUpdated: 'User Profile Updated',
  qantasLink: 'Link Qantas Frequent Flyer Account',
  qantasUnlink: 'Unlink Qantas Frequent Flyer Account',
  questionnaireSectionCompleted: 'Questionnaire Section Completed',
  resultsInfoOpen: 'Result Information Opened',
  saveFavoriteMeal: 'Favorite Meal Saved',
  removeFavoriteMeal: 'Favorite Meal Removed',
  screenLoaded: 'Screen Loaded',
  searchbarPressed: 'Search Bar Triggered',
  supportOpened: 'User Contact Support Opened',
  tabNavigated: 'Tab Navigated',
  triggerNotification: 'Survey Notification Opened',
  userCancelSignOut: 'Sign Out Cancelled',
  userDeleted: 'User Deleted',
  userSignin: 'User Signed In',
  userSignup: 'User Signed Up',
  userSignedout: 'User Signed Out',
  weeklySurveyCompleted: 'Weekly Survey Completed',
  weeklySurveyExit: 'Weekly Survey Exited',
  weeklySurveyScreenView: 'Weekly Survey Screen View Time',
  weeklySurveyStarted: 'Weekly Survey Started',
};

const AutomaticRouteTrackingConfiguration: Record<string, RouteConfig> = {
  Merchant: {
    excluded: true,
  },
  MerchantDetail: {
    excluded: true,
  },
  ShopHome: {
    excluded: false,
    name: 'Shop',
  },
  DiscoverHome: {
    excluded: true,
  },
  MyImpactHome: {
    excluded: true,
  },
  Transactions: {
    excluded: true,
  },
  BankingGetStarted: {
    excluded: true,
  },
  QuestionnaireGetStarted: {
    excluded: true,
  },
  PostDetail: {
    excluded: true,
  },
  FAQs: {
    name: 'Frequently Asked Questions',
  },
  MonthlyPurchasesDetail: {
    name: segmentScreens.monthlyPurchasesDetail,
  },
  BadgeDetails: {
    excluded: true,
  },
};

// Returns true if the route should be tracked, false if not
export function automaticallyTrackRouteName(route?: string) {
  if (!route) return false;
  return !AutomaticRouteTrackingConfiguration[route]?.excluded;
}

// Returns the overridden route name, or the route name
export function routeNameToScreenTrackingName(route?: string) {
  if (!route) return 'Unknown';
  return AutomaticRouteTrackingConfiguration[route]?.name ?? route;
}

export function getRefinerEnvironmentToken(env: EnvironmentType) {
  if (env === EnvironmentType.Production) {
    return '113181a0-2281-11ed-9301-5b01123fb4ae';
  } else {
    return '25d1ad60-280e-11ed-b8e9-3bc2725cc86a';
  }
}

export function getSegmentEnvironmentToken(env: EnvironmentType) {
  switch (env) {
    case EnvironmentType.Production: {
      return 'OzLjtP1MHcvMNiwR2LE4QVVR3TGbWnW5';
    }
    case EnvironmentType.Development: {
      return 'QCpqgUSBtZFPATOxbmu2n2O0jEHxjdG2';
    }
    case EnvironmentType.Test: {
      return 'ncsv0PxXQHhFIC6DMvZqvry7ZhDrXyMW';
    }
    case EnvironmentType.Staging: {
      return 'yeBU9T59MiW9fDKy6CvVgH1CSM7Q1gId';
    }
    default:
      // Using dev environment key for localhost event testing. Default as empty.
      // 'QCpqgUSBtZFPATOxbmu2n2O0jEHxjdG2';
      return 'QCpqgUSBtZFPATOxbmu2n2O0jEHxjdG2';
  }
}

export const getScreenLocation = (screenName: string): string => {
  type ScreenMapOptions = {
    [key: string]: string;
  };

  const screenMap: ScreenMapOptions = {
    purchase: 'All Purchases Transaction Pressed',
    impact: 'Impact Screen Transaction Pressed',
  };
  return screenMap[screenName];
};

export const convertToPercentage = (value: number) => {
  return (value * 100).toFixed(2);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function removeNullProperties(obj: any) {
  // Remove any object key that contains null.
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const hasProperties = value && Object.keys(value).length > 0;
    if (value === null) {
      delete obj[key];
    } else if (typeof value !== 'string' && hasProperties) {
      removeNullProperties(value);
    }
  });
  return obj;
}
