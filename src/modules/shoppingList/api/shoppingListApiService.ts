import axios from 'axios';
import EnvironmentManager from '../../environment/environmentManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ShoppingListItem {
  _id: string;
  userId: string;
  ingredientId: {
    _id: string;
    name: string;
    averageWeight: number;
    categoryId?: string;
    heroImageUrl?: string;
    theme?: string;
  };
  quantity: string;
  unit?: string;
  source: 'RECIPE' | 'MANUAL';
  status: 'PENDING' | 'PURCHASED';
  recipeId?: {
    _id: string;
    name: string;
    heroImageUrl?: string;
  };
  notes?: string;
  purchasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddShoppingListItemDto {
  ingredientId: string;
  quantity: string;
  unit?: string;
  source?: 'RECIPE' | 'MANUAL';
  recipeId?: string;
  notes?: string;
}

export interface AddIngredientsFromRecipeDto {
  recipeId: string;
  ingredients: {
    ingredientId: string;
    quantity: string;
  }[];
}

export interface UpdateShoppingListItemDto {
  quantity?: string;
  unit?: string;
  notes?: string;
  status?: 'PENDING' | 'PURCHASED';
}

export interface ShoppingListStatistics {
  total: number;
  pending: number;
  purchased: number;
  fromRecipes: number;
  manual: number;
}

class ShoppingListApiService {
  private getBaseUrl(): string {
    return EnvironmentManager.shared.apiUrl();
  }

  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  }

  private async getAuthHeaders() {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getShoppingList(status?: 'PENDING' | 'PURCHASED'): Promise<ShoppingListItem[]> {
    try {
      const baseUrl = this.getBaseUrl();
      const headers = await this.getAuthHeaders();
      const params = status ? { status } : {};
      
      console.log('[ShoppingList] Fetching from:', `${baseUrl}/api/shopping-list`);
      console.log('[ShoppingList] Headers:', headers);
      
      const response = await axios.get(`${baseUrl}/api/shopping-list`, {
        headers,
        params,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('[ShoppingList] Error fetching:', error.response?.status, error.response?.data);
      throw error;
    }
  }

  async getStatistics(): Promise<ShoppingListStatistics> {
    const baseUrl = this.getBaseUrl();
    const headers = await this.getAuthHeaders();
    
    const response = await axios.get(`${baseUrl}/api/shopping-list/statistics`, {
      headers,
    });
    
    return response.data;
  }

  async addItem(dto: AddShoppingListItemDto): Promise<ShoppingListItem> {
    const baseUrl = this.getBaseUrl();
    const headers = await this.getAuthHeaders();
    
    const response = await axios.post(`${baseUrl}/api/shopping-list`, dto, {
      headers,
    });
    
    return response.data;
  }

  async addIngredientsFromRecipe(dto: AddIngredientsFromRecipeDto): Promise<ShoppingListItem[]> {
    const baseUrl = this.getBaseUrl();
    const headers = await this.getAuthHeaders();
    
    const response = await axios.post(
      `${baseUrl}/api/shopping-list/from-recipe`,
      dto,
      { headers }
    );
    
    return response.data;
  }

  async updateItem(itemId: string, dto: UpdateShoppingListItemDto): Promise<ShoppingListItem> {
    const baseUrl = this.getBaseUrl();
    const headers = await this.getAuthHeaders();
    
    const response = await axios.put(`${baseUrl}/api/shopping-list/${itemId}`, dto, {
      headers,
    });
    
    return response.data;
  }

  async markAsPurchased(itemId: string): Promise<ShoppingListItem> {
    const baseUrl = this.getBaseUrl();
    const headers = await this.getAuthHeaders();
    
    const response = await axios.put(
      `${baseUrl}/api/shopping-list/${itemId}/purchase`,
      {},
      { headers }
    );
    
    return response.data;
  }

  async markMultipleAsPurchased(itemIds: string[]): Promise<ShoppingListItem[]> {
    const baseUrl = this.getBaseUrl();
    const headers = await this.getAuthHeaders();
    
    const response = await axios.put(
      `${baseUrl}/api/shopping-list/purchase-multiple`,
      { itemIds },
      { headers }
    );
    
    return response.data;
  }

  async deleteItem(itemId: string): Promise<void> {
    const baseUrl = this.getBaseUrl();
    const headers = await this.getAuthHeaders();
    
    await axios.delete(`${baseUrl}/api/shopping-list/${itemId}`, {
      headers,
    });
  }

  async clearPurchasedItems(): Promise<{ message: string; deletedCount: number }> {
    const baseUrl = this.getBaseUrl();
    const headers = await this.getAuthHeaders();
    
    const response = await axios.delete(`${baseUrl}/api/shopping-list/purchased/clear`, {
      headers,
    });
    
    return response.data;
  }

  async clearAllItems(): Promise<{ message: string; deletedCount: number }> {
    const baseUrl = this.getBaseUrl();
    const headers = await this.getAuthHeaders();
    
    const response = await axios.delete(`${baseUrl}/api/shopping-list/all/clear`, {
      headers,
    });
    
    return response.data;
  }
}

export const shoppingListApiService = new ShoppingListApiService();
