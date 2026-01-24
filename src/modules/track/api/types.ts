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

// Track Survey types
interface ProduceWaste {
  fruit: number;
  veggies: number;
  dairy: number;
  bread: number;
  meat: number;
  herbs: number;
}

interface WeeklySavings {
  co2_savings: number;
  cost_savings: number;
  food_saved: number;
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
};
