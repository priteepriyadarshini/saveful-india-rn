import axios from 'axios';
import EnvironmentManager from '../../environment/environmentManager';
import { Recipe, PopulatedRecipe } from '../models/recipe';

class RecipeApiService {
  private getBaseUrl(): string {
    return EnvironmentManager.shared.apiUrl();
  }

  /**
   * Get all active recipes
   */
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/api/recipe`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  }

  /**
   * Get a single recipe by ID
   */
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

  /**
   * Get a recipe by slug (generated from title)
   * Note: This fetches all recipes and finds the matching one
   */
  async getRecipeBySlug(slug: string): Promise<PopulatedRecipe | null> {
    try {
      const allRecipes = await this.getAllRecipes();
      
      // Generate slug from recipe title and match
      const recipe = allRecipes.find(r => {
        const recipeSlug = r.title.toLowerCase().replace(/\s+/g, '-');
        return recipeSlug === slug;
      });

      if (recipe) {
        // Fetch the full recipe with populated data
        return await this.getRecipeById(recipe._id);
      }

      return null;
    } catch (error) {
      console.error(`Error fetching recipe by slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Get recipes by framework category
   */
  async getRecipesByCategory(categoryId: string): Promise<Recipe[]> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/api/recipe/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recipes for category ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * Get recipes filtered by multiple framework categories
   */
  async getRecipesByCategories(categoryIds: string[]): Promise<Recipe[]> {
    try {
      // Get all recipes and filter on client side
      // Or you can modify backend to accept multiple category IDs
      const allRecipes = await this.getAllRecipes();
      
      if (categoryIds.length === 0) {
        return allRecipes;
      }

      return allRecipes.filter(recipe => 
        recipe.frameworkCategories.some(cat => {
          const catId = typeof cat === 'string' ? cat : (cat as any)._id;
          return categoryIds.includes(catId);
        })
      );
    } catch (error) {
      console.error('Error filtering recipes by categories:', error);
      throw error;
    }
  }
}

export const recipeApiService = new RecipeApiService();
