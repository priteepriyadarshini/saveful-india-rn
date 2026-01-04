import axios from 'axios';
import EnvironmentManager from '../../environment/environmentManager';

export interface ApiSponsor {
  _id: string;
  title: string;
  broughtToYouBy?: string;
  tagline?: string;
  logo?: string;
  logoBlackAndWhite?: string;
}

export interface ApiHackOrTip {
  _id: string;
  title: string;
  type: 'miniHack' | 'proTip' | 'servingSuggestion';
  shortDescription: string;
  description?: string;
  sponsorId?: ApiSponsor | string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class HackOrTipApiService {
  private getBaseUrl(): string {
    return EnvironmentManager.shared.apiUrl();
  }

  async getHackOrTipById(id: string): Promise<ApiHackOrTip> {
    const baseUrl = this.getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/hack-or-tip/${id}`);
    return response.data;
  }
}

export const hackOrTipApiService = new HackOrTipApiService();
