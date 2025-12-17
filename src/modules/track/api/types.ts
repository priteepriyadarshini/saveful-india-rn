interface Survey {
  // week: number;
  cooking_frequency: number;
  scraps: number;
  uneaten_leftovers: number;
  binned_items: {
    fruit: number;
    veggies: number;
    dairy: number;
    bread: number;
    meat: number;
    herbs: number;
  };
  preferred_ingredients: string[];
  no_of_cooks?: number;
  prompt_at?: string;
}

interface SurveyResult extends Survey {
  co2: string;
  co2_savings: string;
  completed_at: string;
  cost_savings: string;
  food_saved: string;
  id: string;
  spent: string;
  waste: string;
}

interface SurveyResponse {
  track_survey: SurveyResult;
}

interface UserSurveysResponse {
  track_surveys: SurveyResult[];
}

interface SurveyEligibilityResponse {
  eligible: boolean;
  next_survey_date: string;
}

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

interface UserMeal {
  id: string;
  framework_id: string;
  variant_id: string;
  saved: boolean;
  completed: boolean;
  data: {
    ingredients: string[][];
  };
}

interface UserMealResult extends UserMeal {
  id: string;
}

interface UserMealResponse {
  meal: UserMealResult;
}

interface UserMealsResponse {
  meals: UserMealResult[];
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
  Survey,
  SurveyEligibilityResponse,
  SurveyResponse,
  SurveyResult,
  UserMeal,
  UserMealResponse,
  UserMealResult,
  UserMealsResponse,
  UserSurveysResponse,
};
