import axios from 'axios';
import { UserProfile } from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const userService = {
  async getUsers(): Promise<UserProfile[]> {
    const token = localStorage.getItem('medpredict_auth_token');
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async createUser(userData: any): Promise<UserProfile> {
    const token = localStorage.getItem('medpredict_auth_token');
    const response = await axios.post(`${API_BASE_URL}/users`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
