import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Part, CreatePartInput, StockInInput } from './types';

export function useParts(search?: string, category?: string) {
  return useQuery({
    queryKey: ['parts', search, category],
    queryFn: () =>
      apiClient<{ data: Part[] }>('/parts', {
        params: { q: search || undefined, category: category || undefined },
      }).then((res) => res.data),
  });
}

export function useCreatePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePartInput) =>
      apiClient<{ data: Part }>('/parts', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
}

export function useStockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ part_id, ...rest }: StockInInput) =>
      apiClient<{ message: string }>(`/parts/${part_id}/stock-in`, {
        method: 'POST',
        body: JSON.stringify(rest),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
}
