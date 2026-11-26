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

export const fetchCurriculum = async () => {
  const { data } = await apiClient.get('/algorithms');
  return data;
};

export const fetchAlgorithmBySlug = async (slug) => {
  const { data } = await apiClient.get(`/algorithms/${slug}`);
  return data.data;
};

export const useCurriculum = () =>
  useQuery({
    queryKey: ['curriculum'],
    queryFn: fetchCurriculum,
    staleTime: 1000 * 60 * 15
  });

export const useAlgorithm = (slug) =>
  useQuery({
    queryKey: ['algorithm', slug],
    queryFn: () => fetchAlgorithmBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 15
  });
