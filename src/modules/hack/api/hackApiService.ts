import axios from 'axios';
import EnvironmentManager from '../../environment/environmentManager';

export interface HackCategory {
  _id?: string;
  id?: string; // Backend uses 'id' instead of '_id'
  name: string;
  heroImageUrl: string;
  iconImageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Hack {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  thumbnailImageUrl?: string;
  heroImageUrl?: string;
  iconImageUrl?: string;
  leadText?: string;
  sponsorId?: string;
  categoryId: string;
  articleBlocks: any[];
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HackCategoryWithHacks {
  category: HackCategory;
  hacks: Hack[];
}

class HackApiService {
  private getBaseUrl(): string {
    const url = EnvironmentManager.shared.apiUrl();
    console.log('Hack API Base URL:', url);
    return url;
  }

  async getAllCategories(): Promise<HackCategory[]> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/hack/category`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hack categories:', error);
      throw error;
    }
  }

  async getCategoryWithHacks(categoryId: string): Promise<HackCategoryWithHacks> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/hack/category/${categoryId}`);
      console.log('getCategoryWithHacks raw response:', response.data);
      const data = response.data.response || response.data;
      return data;
    } catch (error) {
      console.error('Error fetching category with hacks:', error);
      throw error;
    }
  }

  async getHackById(hackId: string): Promise<Hack> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/hack/${hackId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hack:', error);
      throw error;
    }
  }
}

export const hackApiService = new HackApiService();
