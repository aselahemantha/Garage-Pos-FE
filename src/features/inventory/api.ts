import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  Part,
  CreatePartInput,
  UpdatePartInput,
  StockInInput,
  AdjustStockInput,
  BatchReorderInput,
  LowStockSummary,
} from './types';

export function useParts(search?: string, category?: string) {
  return useQuery({
    queryKey: ['parts', search, category],
    queryFn: () =>
      apiClient<{ data: Part[] }>('/parts', {
        params: { q: search || undefined, category: category || undefined },
      }).then((res) => res.data),
  });
}

export function useLowStockReport() {
  return useQuery({
    queryKey: ['parts', 'low-stock'],
    queryFn: () =>
      apiClient<{ data: LowStockSummary }>('/parts/low-stock').then((res) => res.data),
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

export function useUpdatePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdatePartInput }) =>
      apiClient<{ data: Part }>(`/parts/${id}`, {
        method: 'PATCH',
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

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ part_id, input }: { part_id: number; input: AdjustStockInput }) =>
      apiClient<{ data: Part }>(`/parts/${part_id}/adjust`, {
        method: 'POST',
        body: JSON.stringify(input),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
}

export function useBatchRestock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BatchReorderInput) =>
      apiClient<{ message: string }>('/parts/batch-restock', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
}
