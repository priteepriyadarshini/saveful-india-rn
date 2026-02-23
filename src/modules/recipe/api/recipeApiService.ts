import axios from 'axios';
import EnvironmentManager from '../../environment/environmentManager';
import { Recipe, PopulatedRecipe } from '../models/recipe';

class RecipeApiService {
  private getBaseUrl(): string {
    return EnvironmentManager.shared.apiUrl();
  }

  async getAllRecipes(country?: string): Promise<Recipe[]> {
    try {
      const baseUrl = this.getBaseUrl();
      const params = country ? `?country=${encodeURIComponent(country)}` : '';
      const response = await axios.get(`${baseUrl}/api/api/recipe${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  }

  async getRecipeById(id: string): Promise<PopulatedRecipe> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/api/recipe/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recipe ${id}:`, error);
      throw error;
    }
  }


  async getRecipeBySlug(slug: string, country?: string): Promise<PopulatedRecipe | null> {
    try {
      const allRecipes = await this.getAllRecipes(country);
      
      const recipe = allRecipes.find(r => {
        const recipeSlug = r.title.toLowerCase().replace(/\s+/g, '-');
        return recipeSlug === slug;
      });

      if (recipe) {
        return await this.getRecipeById(recipe._id);
      }

      return null;
    } catch (error) {
      console.error(`Error fetching recipe by slug ${slug}:`, error);
      throw error;
    }
  }

  async getRecipesByCategory(categoryId: string, country?: string): Promise<Recipe[]> {
    try {
      const baseUrl = this.getBaseUrl();
      const params = country ? `?country=${encodeURIComponent(country)}` : '';
      const response = await axios.get(`${baseUrl}/api/api/recipe/category/${categoryId}${params}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recipes for category ${categoryId}:`, error);
      throw error;
    }
  }

 
  async getRecipesByIngredient(ingredientId: string, country?: string): Promise<Recipe[]> {
    try {
      const baseUrl = this.getBaseUrl();
      const params = country ? `?country=${encodeURIComponent(country)}` : '';
      const response = await axios.get(`${baseUrl}/api/api/recipe/ingredient/${ingredientId}${params}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recipes for ingredient ${ingredientId}:`, error);
      throw error;
    }
  }

  
  async getRecipesByCategories(categoryIds: string[], country?: string): Promise<Recipe[]> {
    try {
    
      const allRecipes = await this.getAllRecipes(country);
      
      if (categoryIds.length === 0) {
        return allRecipes;
      }

      const extractId = (val: any): string => {
        if (typeof val === 'string') return val;
        if (val?.$oid) return val.$oid as string;
        if (val?._id) {
          return typeof val._id === 'string'
            ? (val._id as string)
            : (val._id?.$oid as string) || String(val._id);
        }
        const str = String(val);
        return str === '[object Object]' ? '' : str;
      };

      const filtered = allRecipes.filter(recipe =>
        Array.isArray(recipe.frameworkCategories) &&
        recipe.frameworkCategories.some(cat => {
          const catId = extractId(cat);
          return catId && categoryIds.includes(catId);
        })
      );

      if (!filtered || filtered.length === 0) {
        return allRecipes.filter(recipe => {
          if (!Array.isArray(recipe.frameworkCategories)) return false;
          for (const cat of recipe.frameworkCategories) {
            const id = extractId(cat);
            if (id && categoryIds.includes(id)) return true;
          }
          return false;
        });
      }

      return filtered;
    } catch (error) {
      console.error('Error filtering recipes by categories:', error);
      throw error;
    }
  }

 
  async scaleServings(params: {
    originalServings: number;
    desiredServings: number;
    recipeTitle?: string;
    ingredients: {
      ingredientName: string;
      originalQuantity: string;
      preparation?: string;
      ingredientId?: string;
    }[];
  }): Promise<{
    originalServings: number;
    desiredServings: number;
    scaledIngredients: {
      ingredientName: string;
      originalQuantity: string;
      scaledQuantity: string;
      ingredientId?: string;
      preparation?: string;
    }[];
    cookingNotes?: string;
  }> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await axios.post(
        `${baseUrl}/api/api/recipe/scale-servings`,
        params,
      );
      return response.data;
    } catch (error) {
      console.error('Error scaling servings:', error);
      throw error;
    }
  }
}

export const recipeApiService = new RecipeApiService();
