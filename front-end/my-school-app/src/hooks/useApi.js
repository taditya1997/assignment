import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

const API_URL ='http://localhost:5000/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const clearStorageAndRedirect = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  }, [navigate]);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      clearStorageAndRedirect();
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      localStorage.setItem('token', data.accessToken);
      return data.token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearStorageAndRedirect();
      return null;
    }
  };

  const apiCall = useCallback(async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);

    try {
      let token = localStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      };

      const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
      };

      let response = await fetch(`${API_URL}${endpoint}`, config);

      if (response.status === 401) {
        // Token might be expired, try to refresh
        const newToken = await refreshToken();
        if (newToken) {
          // Retry the original request with the new token
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(`${API_URL}${endpoint}`, config);
        } else {
          // If refresh failed, we've already cleared storage and redirected
          return;
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      setLoading(false);
      return responseData;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [clearStorageAndRedirect]);

  return { apiCall, loading, error };
};