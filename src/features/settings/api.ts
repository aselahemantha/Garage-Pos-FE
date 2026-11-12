import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { GarageSettings, UpdateSettingsInput } from './types';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () =>
      apiClient<{ data: GarageSettings }>('/settings').then((res) => res.data),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) =>
      apiClient<{ data: GarageSettings }>('/settings', {
        method: 'PUT',
        body: JSON.stringify(input),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
