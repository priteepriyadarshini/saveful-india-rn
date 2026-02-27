import axios from 'axios';
import EnvironmentManager from '../../environment/environmentManager';
import { Ingredient } from './types';

/** Simple TTL cache entry */
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class IngredientApiService {
  private getBaseUrl(): string {
    return EnvironmentManager.shared.apiUrl();
  }

  // --- In-memory cache (5-minute TTL) ---
  private static CACHE_TTL = 5 * 60 * 1000;
  private cacheById = new Map<string, CacheEntry<Ingredient>>();

  private isCacheValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
    return !!entry && Date.now() < entry.expiry;
  }

  async getIngredientById(id: string): Promise<Ingredient> {
    const cached = this.cacheById.get(id);
    if (this.isCacheValid(cached)) return cached.data;

    const baseUrl = this.getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/ingredients/${id}`);
    const ing = response.data;
    this.cacheById.set(id, { data: ing, expiry: Date.now() + IngredientApiService.CACHE_TTL });
    return ing;
  }

  async getAllIngredients(country?: string): Promise<Ingredient[]> {
    const baseUrl = this.getBaseUrl();
    const params = country ? `?country=${encodeURIComponent(country)}` : '';
    const response = await axios.get(`${baseUrl}/api/ingredients${params}`);
    return response.data;
  }

  async getIngredientsByIds(ids: string[]): Promise<Record<string, Ingredient>> {
    const results: Record<string, Ingredient> = {};
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    
    // Resolve from cache first
    const missingIds: string[] = [];
    for (const id of uniqueIds) {
      const cached = this.cacheById.get(id);
      if (this.isCacheValid(cached)) {
        results[id] = cached.data;
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length === 0) return results;

    // Use batch endpoint to fetch all missing in one request
    try {
      const baseUrl = this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/ingredients/batch?ids=${missingIds.join(',')}`);
      const ingredients: Ingredient[] = response.data;
      for (const ing of ingredients) {
        const ingId = (ing as any)._id || (ing as any).id;
        if (ingId) {
          results[ingId] = ing;
          this.cacheById.set(ingId, { data: ing, expiry: Date.now() + IngredientApiService.CACHE_TTL });
        }
      }
    } catch (err) {
      // Fallback: fetch individually (old behavior) if batch endpoint not available
      console.warn('Batch ingredients endpoint failed, falling back to individual fetches:', err);
      await Promise.all(
        missingIds.map(async (id) => {
          try {
            const ing = await this.getIngredientById(id);
            results[id] = ing;
          } catch (fetchErr) {
            console.warn('Failed to fetch ingredient', id, fetchErr);
          }
        })
      );
    }

    return results;
  }
}

export const ingredientApiService = new IngredientApiService();
