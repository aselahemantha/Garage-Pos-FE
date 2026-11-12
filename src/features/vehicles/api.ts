import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { VehicleHistoryResponse } from './types';

export function useVehicleHistory(id?: string | number) {
  return useQuery({
    queryKey: ['vehicles', id, 'history'],
    queryFn: () =>
      apiClient<{ data: VehicleHistoryResponse }>(`/vehicles/${id}/history`).then(
        (res) => res.data
      ),
    enabled: Boolean(id),
  });
}
