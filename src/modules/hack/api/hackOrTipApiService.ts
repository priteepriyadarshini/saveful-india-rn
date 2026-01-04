import axios from 'axios';
import EnvironmentManager from '../../environment/environmentManager';
import { Sponsor } from './hackApiService';

export enum HackOrTipType {
  PRO_TIP = 'Pro Tip',
  MINI_HACK = 'Mini Hack',
  SERVING_SUGGESTION = 'Serving Suggestion',
}

export interface HackOrTip {
  _id: string;
  title: string;
  type: HackOrTipType;
  shortDescription: string;
  description: string;
  sponsorHeading?: string;
  sponsorId?: string | Sponsor;
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class HackOrTipApiService {
  private getBaseUrl(): string {
    const url = EnvironmentManager.shared.apiUrl();
    return url;
  }

  async getAll(type?: string, isActive?: boolean): Promise<HackOrTip[]> {
    try {
      const baseUrl = this.getBaseUrl();
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (isActive !== undefined) params.append('isActive', String(isActive));
      
      const response = await axios.get(`${baseUrl}/api/hack-or-tip?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hack or tips:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<HackOrTip> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/hack-or-tip/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching hack or tip ${id}:`, error);
      throw error;
    }
  }

  async getByIds(ids: string[]): Promise<HackOrTip[]> {
    try {
      // Fetch all IDs in parallel
      const promises = ids.map(id => this.getById(id));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error fetching hack or tips by IDs:', error);
      throw error;
    }
  }
}

export const hackOrTipApiService = new HackOrTipApiService();
