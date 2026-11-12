import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { ServiceCategory, ServiceItem, CreateCategoryInput, CreateServiceInput } from './types';

export function useCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: () =>
      apiClient<{ data: ServiceCategory[] }>('/service-categories').then((res) => res.data),
  });
}

export function useServices(categoryId?: number) {
  return useQuery({
    queryKey: ['services', categoryId],
    queryFn: () =>
      apiClient<{ data: ServiceItem[] }>('/services', {
        params: { category_id: categoryId || undefined },
      }).then((res) => res.data),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      apiClient<{ data: ServiceCategory }>('/service-categories', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceInput) =>
      apiClient<{ data: ServiceItem }>('/services', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}
