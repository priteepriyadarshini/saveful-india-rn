import axios from 'axios';
import EnvironmentManager from '../../environment/environmentManager';

export interface RatingTagBreakdown {
  tagName: string;
  count: number;
  order: number;
}

export interface RatingTag {
  _id: string;
  name: string;
  order: number;
  description?: string;
  isActive: boolean;
}

export interface RecipeRatingStats {
  totalRatings: number;
  ratingBreakdown: RatingTagBreakdown[];
  averageRatingOrder: number;
}

class RecipeRatingApiService {
  private getBaseUrl(): string {
    return EnvironmentManager.shared.apiUrl();
  }

 
  async getActiveTags(): Promise<RatingTag[]> {
    try {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/api/rating-tags/active`;
      const response = await axios.get(url);
      return response.data.sort((a: RatingTag, b: RatingTag) => b.order - a.order);
    } catch (error: any) {
      console.error('[RecipeRatingApiService] Error fetching active tags:', error);
      return [];
    }
  }

  async getRecipeRatingStats(recipeId: string): Promise<RecipeRatingStats> {
    try {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/api/recipe-ratings/recipe/${recipeId}/stats`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      console.error(`[RecipeRatingApiService] Error fetching rating stats for recipe ${recipeId}:`, error);
      console.error('[RecipeRatingApiService] Error details:', error.response?.data || error.message);
      // Return empty stats if there's an error (recipe might have no ratings yet)
      return {
        totalRatings: 0,
        ratingBreakdown: [],
        averageRatingOrder: 0,
      };
    }
  }
}

export const recipeRatingApiService = new RecipeRatingApiService();
