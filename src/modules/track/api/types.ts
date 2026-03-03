interface Feedback {
  framework_id: string;
  prompted: boolean;
  data: {
    did_you_like_it: boolean;
    food_saved: number;
    meal_id: string;
  };
}

interface FeedbackResult extends Feedback {
  id: string;
}

interface FeedbackResponse {
  feedback: FeedbackResult;
}

interface FeedbacksForFrameworkResponse {
  feedback_list: FeedbackResult[];
}

interface Favourite {
  id: string;
  type: string;
  framework_id: string;
}

interface FavouriteResult extends Favourite {
  id: string;
}

interface FavouriteResponse {
  favourite: FavouriteResult;
}

interface FavouritesResponse {
  favourites: FavouriteResult[];
}

interface Stats {
  best_co2_savings: string | null;
  best_cost_savings: string | null;
  best_food_savings: string | null;
  completed_meals_count: number;
  food_savings_all_users: string | null;
  food_savings_user: string | null;
  total_co2_savings: string | null;
  total_cost_savings: string | null;
}

interface StatsResponse {
  stats: Stats;
}

type ProduceWaste = Record<string, number>;

interface SurveyConfigProduceCategory {
  key: string;
  label: string;
  icon: string; 
  weightPerUnit: number;
  unit: string;
  order: number;
  isActive: boolean;
}

interface SurveyConfigQuestion {
  key: string;
  label: string;
  type: 'number' | 'slider' | 'select';
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
  order: number;
  isRequired: boolean;
  isActive: boolean;
}

interface SurveyConfigCountryRate {
  countryCode: string;
  countryName: string;
  costPerGram: number;
  currencySymbol: string;
  isActive: boolean;
}

interface SurveyConfigWeeklyTip {
  title: string;
  content: string;
  imageUrl: string;
  weekNumber: number;
  isActive: boolean;
  order: number;
}

interface SurveyConfigUi {
  surveyTitle: string;
  surveyDescription: string;
  completionMessage: string;
  eligibilityMessage: string;
  notEligibleMessage: string;
}

interface SurveyConfigResponse {
  _id: string;
  name: string;
  isActive: boolean;
  version: number;
  surveyQuestions: SurveyConfigQuestion[];
  produceWasteCategories: SurveyConfigProduceCategory[];
  countryRates: SurveyConfigCountryRate[];
  calculationConstants: {
    co2PerGram: number;
    avgWeeklyWasteGrams: number;
    scrapsWeightPerUnit: number;
    leftoversWeightPerUnit: number;
  };
  weeklyTips: SurveyConfigWeeklyTip[];
  uiConfig: SurveyConfigUi;
}

interface WeeklySavings {
  co2_savings: number;
  cost_savings: number;
  food_saved: number;
  currency_symbol: string;
}

interface TrackSurveyResponse {
  _id: string;
  userId: string;
  cookingFrequency: number;
  scraps: number;
  uneatenLeftovers: number;
  produceWaste: ProduceWaste;
  preferredIngredients: string[];
  noOfCooks: number;
  calculatedSavings: WeeklySavings;
  prev_personal_bests?: {
    co2_savings: number;
    cost_savings: number;
    food_saved: number;
  } | null;
  isBaseline: boolean;
  surveyWeek: string;
  surveyDay: number;
  isCo2PersonalBest: boolean;
  isCostPersonalBest: boolean;
  isFoodSavedPersonalBest: boolean;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface TrackSurveyEligibility {
  eligible: boolean;
  next_survey_date: string | null;
  last_survey_date: string | null;
  surveys_count: number;
  message?: string;
}

interface CreateTrackSurveyDto {
  cookingFrequency: number;
  scraps: number;
  uneatenLeftovers: number;
  produceWaste: ProduceWaste;
  preferredIngredients: string[];
  noOfCooks?: number;
  surveyDay?: number;
  country?: string; 
}

interface WeeklySavingsSummary {
  current_week: WeeklySavings;
  previous_week?: WeeklySavings | null;
  personal_bests: WeeklySavings;
  total_surveys: number;
  total_co2_saved: number;
  total_cost_saved: number;
  total_food_saved: number;
}

export {
  Favourite,
  FavouriteResponse,
  FavouriteResult,
  FavouritesResponse,
  Feedback,
  FeedbackResponse,
  FeedbackResult,
  FeedbacksForFrameworkResponse,
  Stats,
  StatsResponse,
  ProduceWaste,
  WeeklySavings,
  TrackSurveyResponse,
  TrackSurveyEligibility,
  CreateTrackSurveyDto,
  WeeklySavingsSummary,
  SurveyConfigResponse,
  SurveyConfigProduceCategory,
  SurveyConfigQuestion,
  SurveyConfigWeeklyTip,
};
