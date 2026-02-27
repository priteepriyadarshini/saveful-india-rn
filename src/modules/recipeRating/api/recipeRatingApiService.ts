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

/** Simple TTL cache entry */
interface CacheEntry {
  data: RecipeRatingStats;
  expiry: number;
}

class RecipeRatingApiService {
  private getBaseUrl(): string {
    return EnvironmentManager.shared.apiUrl();
  }

  // --- In-memory cache (3-minute TTL) ---
  private static CACHE_TTL = 3 * 60 * 1000;
  private cache = new Map<string, CacheEntry>();

  async getRecipeRatingStats(recipeId: string): Promise<RecipeRatingStats> {
    // Return cached result if fresh
    const cached = this.cache.get(recipeId);
    if (cached && Date.now() < cached.expiry) return cached.data;

    try {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/api/analytics/recipe-rating-stats?framework_id=${encodeURIComponent(recipeId)}`;
      const token = store.getState().session.access_token;
      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const stats = response.data as RecipeRatingStats;
      this.cache.set(recipeId, { data: stats, expiry: Date.now() + RecipeRatingApiService.CACHE_TTL });
      return stats;
    } catch (error: any) {
      // Return empty stats if there's an error (recipe might have no ratings yet)
      const empty: RecipeRatingStats = {
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
      // Cache the empty result too to prevent hammering the server
      this.cache.set(recipeId, { data: empty, expiry: Date.now() + RecipeRatingApiService.CACHE_TTL });
      return empty;
    }
  }
}

export const recipeRatingApiService = new RecipeRatingApiService();
