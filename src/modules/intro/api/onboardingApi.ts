export interface OnboardingConfig {
  stepNumber: number;
  buttonText: string;
  description: string | ((param?: any) => string);
  welcomeMessage?: string;
  heading?: string | ((param?: any) => string);
  subHeading?: string;
  bigHeading?: string;
  subDescription?: string;
  imageKey?: string;
  showPostcodeInput?: boolean;
  showPeopleInput?: boolean;
  showDietaryInput?: boolean;
  showFavouriteDishes?: boolean;
  showWeekPlanner?: boolean;
  showSavedItems?: boolean;
  showSavedResult?: boolean;
  showDayResult?: boolean;
  showNotifications?: boolean;
}
