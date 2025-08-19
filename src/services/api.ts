// API service for AWS API Gateway backend
const API_BASE_URL = 'https://9lwgudjgw4.execute-api.eu-west-2.amazonaws.com/prod';

export interface Item {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: string;
  createdAt?: string;
  updatedAt?: string;
}

class ApiService {
  private makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making request to:', url);
    console.log('Request options:', options);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  createItem = async (item: Omit<Item, 'createdAt' | 'updatedAt'>): Promise<{ message: string; item: Item }> => {
    return this.makeRequest('/items', {
      method: 'POST',
      body: JSON.stringify({
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  getItem = async (id: string): Promise<Item> => {
    return this.makeRequest(`/items/${id}`);
  }

  updateItem = async (id: string, item: Partial<Item>): Promise<{ message: string; item: Item }> => {
    return this.makeRequest(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...item,
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  deleteItem = async (id: string): Promise<{ message: string }> => {
    return this.makeRequest(`/items/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
