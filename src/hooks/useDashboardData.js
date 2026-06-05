import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

// Get Personal Profile
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/profile/me');
      if (!data.success) throw new Error(data.message);
      return data.data;
    }
  });
}

// Get Dashboard Stats (Totals, Averages)
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/me/dashboard');
      return data; // returns the dict directly
    }
  });
}

// Get Trends (Charts Data)
export function useTrends() {
  return useQuery({
    queryKey: ['dashboardTrends'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/me/trends');
      return data;
    }
  });
}

// Get Health Insights (Nutrition avgs, risk flags)
export function useHealthInsights() {
  return useQuery({
    queryKey: ['healthInsights'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/me/health-insights');
      return data;
    }
  });
}

// Get Scan History
export function useScanHistory() {
  return useQuery({
    queryKey: ['scanHistory'],
    queryFn: async () => {
      const { data } = await apiClient.get('/scan/history/me');
      return data;
    }
  });
}

// Get Latest Recommendations
export function useLatestRecommendations() {
  return useQuery({
    queryKey: ['latestRecommendations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/recommendations/latest');
      if (!data.success) throw new Error(data.message);
      return data.data;
    }
  });
}
