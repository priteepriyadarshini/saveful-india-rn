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

const EMPTY_STATS: RecipeRatingStats = {
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

class RecipeRatingApiService {
  private getBaseUrl(): string {
    return EnvironmentManager.shared.apiUrl();
  }

  private static CACHE_TTL = 3 * 60 * 1000; // 3 minutes
  private cache = new Map<string, CacheEntry>();

  // ── Micro-batch queue ───────────────────────────────────────────────────────
  // All calls to getRecipeRatingStats() within a 20ms window are coalesced into
  // a single batch request so the Make page fires one request instead of N.
  private pendingIds = new Set<string>();
  private pendingResolvers = new Map<string, ((stats: RecipeRatingStats) => void)[]>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  private scheduleFlush() {
    if (this.flushTimer !== null) return;
    this.flushTimer = setTimeout(() => this.flush(), 20);
  }

  private async flush() {
    this.flushTimer = null;
    const ids = Array.from(this.pendingIds);
    const resolvers = new Map(this.pendingResolvers);
    this.pendingIds.clear();
    this.pendingResolvers.clear();

    if (ids.length === 0) return;

    try {
      const baseUrl = this.getBaseUrl();
      const token = store.getState().session.access_token;
      const url = `${baseUrl}/api/analytics/recipe-rating-stats-batch?ids=${ids.join(',')}`;
      const response = await axios.get<Record<string, RecipeRatingStats>>(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const batchResult = response.data;

      for (const id of ids) {
        const stats = batchResult[id] ?? { ...EMPTY_STATS };
        this.cache.set(id, { data: stats, expiry: Date.now() + RecipeRatingApiService.CACHE_TTL });
        const callbacks = resolvers.get(id) ?? [];
        callbacks.forEach(cb => cb(stats));
      }
    } catch {
      // On error resolve everyone with cached or empty stats
      for (const id of ids) {
        const cached = this.cache.get(id);
        const stats = cached ? cached.data : { ...EMPTY_STATS };
        this.cache.set(id, { data: stats, expiry: Date.now() + RecipeRatingApiService.CACHE_TTL });
        const callbacks = resolvers.get(id) ?? [];
        callbacks.forEach(cb => cb(stats));
      }
    }
  }
  // ───────────────────────────────────────────────────────────────────────────

  async getRecipeRatingStats(recipeId: string): Promise<RecipeRatingStats> {
    // Return cached result if still fresh
    const cached = this.cache.get(recipeId);
    if (cached && Date.now() < cached.expiry) return cached.data;

    // Enqueue into micro-batch
    return new Promise<RecipeRatingStats>(resolve => {
      this.pendingIds.add(recipeId);
      const existing = this.pendingResolvers.get(recipeId) ?? [];
      existing.push(resolve);
      this.pendingResolvers.set(recipeId, existing);
      this.scheduleFlush();
    });
  }
}

export const recipeRatingApiService = new RecipeRatingApiService();

