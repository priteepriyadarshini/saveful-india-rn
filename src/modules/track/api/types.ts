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
};
