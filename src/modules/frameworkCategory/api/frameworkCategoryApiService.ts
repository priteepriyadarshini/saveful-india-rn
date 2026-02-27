import axios from 'axios';
import EnvironmentManager from '../../environment/environmentManager';

export interface FrameworkCategory {
  _id: string;
  title: string;
  description?: string;
  heroImageUrl?: string;
  iconImageUrl?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class FrameworkCategoryApiService {
  private getBaseUrl(): string {
    return EnvironmentManager.shared.apiUrl();
  }

  // --- In-memory cache (5-minute TTL) ---
  private cachedCategories: FrameworkCategory[] | null = null;
  private cacheExpiry = 0;
  private static CACHE_TTL = 5 * 60 * 1000;

  /**
   * Get all framework categories (cached)
   */
  async getAllCategories(): Promise<FrameworkCategory[]> {
    if (this.cachedCategories && Date.now() < this.cacheExpiry) {
      return this.cachedCategories;
    }
    try {
      const baseUrl = this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/api/framework-category`);
      this.cachedCategories = response.data;
      this.cacheExpiry = Date.now() + FrameworkCategoryApiService.CACHE_TTL;
      return response.data;
    } catch (error) {
      console.error('Error fetching framework categories:', error);
      throw error;
    }
  }

  /**
   * Get a single framework category by ID
   */
  async getCategoryById(id: string): Promise<FrameworkCategory> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/api/framework-category/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching framework category ${id}:`, error);
      throw error;
    }
  }
}

export const frameworkCategoryApiService = new FrameworkCategoryApiService();
