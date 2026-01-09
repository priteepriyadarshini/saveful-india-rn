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

  /**
   * Get all framework categories
   */
  async getAllCategories(): Promise<FrameworkCategory[]> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/api/framework-category`);
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
