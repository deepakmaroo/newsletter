import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Newsletter API functions
export const fetchNewsletters = async () => {
  const response = await api.get('/newsletters');
  return response.data;
};

export const fetchNewsletterById = async (id) => {
  const response = await api.get(`/newsletters/${id}`);
  return response.data;
};

// Subscription API functions
export const subscribeToNewsletter = async (email) => {
  const response = await api.post('/subscriptions/subscribe', { email });
  return response.data;
};

export const unsubscribeFromNewsletter = async (email) => {
  const response = await api.post('/subscriptions/unsubscribe', { email });
  return response.data;
};

export const checkSubscriptionStatus = async (email) => {
  const response = await api.get(`/subscriptions/status/${email}`);
  return response.data;
};

// Admin API functions (require authentication)
export const loginAdmin = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerAdmin = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const fetchAllNewsletters = async (token) => {
  const response = await api.get('/newsletters/admin/all', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createNewsletter = async (newsletterData, token) => {
  const response = await api.post('/newsletters', newsletterData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateNewsletter = async (id, newsletterData, token) => {
  const response = await api.put(`/newsletters/${id}`, newsletterData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteNewsletter = async (id, token) => {
  const response = await api.delete(`/newsletters/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchAllSubscriptions = async (token) => {
  const response = await api.get('/subscriptions/admin/all', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export default api;
