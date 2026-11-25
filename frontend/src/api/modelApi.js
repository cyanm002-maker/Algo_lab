import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const rawUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE_URL = rawUrl
  ? rawUrl.endsWith('/api')
    ? rawUrl
    : `${rawUrl}/api`
  : '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchAlgorithms = async (category) => {
  const params = category ? { category } : undefined;
  const { data } = await apiClient.get('/algorithms', { params });
  return data.data;
};

export const fetchAlgorithmBySlug = async (slug) => {
  const { data } = await apiClient.get(`/algorithms/${slug}`);
  return data.data;
};

export const useAlgorithms = (category) =>
  useQuery({
    queryKey: ['algorithms', category || 'all'],
    queryFn: () => fetchAlgorithms(category),
    staleTime: 1000 * 60 * 10
  });

export const useAlgorithm = (slug) =>
  useQuery({
    queryKey: ['algorithm', slug],
    queryFn: () => fetchAlgorithmBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10
  });
