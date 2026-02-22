import axios from 'axios';
import EnvironmentManager from '../../environment/environmentManager';
import { Ingredient } from './types';

class IngredientApiService {
  private getBaseUrl(): string {
    return EnvironmentManager.shared.apiUrl();
  }

  async getIngredientById(id: string): Promise<Ingredient> {
    const baseUrl = this.getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/ingredients/${id}`);
    return response.data;
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
    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const ing = await this.getIngredientById(id);
          results[id] = ing;
        } catch (err) {
          console.warn('Failed to fetch ingredient', id, err);
        }
      })
    );
    return results;
  }
}

export const ingredientApiService = new IngredientApiService();
