import axios from 'axios';
import EnvironmentManager from '../../environment/environmentManager';
import { store } from '../../../store/store';

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface RecipeRatingStats {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: RatingDistribution[];
}

class RecipeRatingApiService {
  private getBaseUrl(): string {
    return EnvironmentManager.shared.apiUrl();
  }

  async getRecipeRatingStats(recipeId: string): Promise<RecipeRatingStats> {
    try {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/api/analytics/recipe-rating-stats?framework_id=${encodeURIComponent(recipeId)}`;
      const token = store.getState().session.access_token;
      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return response.data as RecipeRatingStats;
    } catch (error: any) {
      console.error(`[RecipeRatingApiService] Error fetching rating stats for recipe ${recipeId}:`, error);
      console.error('[RecipeRatingApiService] Error details:', error.response?.data || error.message);
      // Return empty stats if there's an error (recipe might have no ratings yet)
      return {
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: [
          { rating: 5, count: 0, percentage: 0 },
          { rating: 4, count: 0, percentage: 0 },
          { rating: 3, count: 0, percentage: 0 },
          { rating: 2, count: 0, percentage: 0 },
          { rating: 1, count: 0, percentage: 0 },
        ],
      };
    }
  }
}

export const recipeRatingApiService = new RecipeRatingApiService();
