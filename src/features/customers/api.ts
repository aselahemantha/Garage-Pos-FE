import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Customer, CreateCustomerInput, CreateVehicleInput, Vehicle } from './types';

interface CustomerListResponse {
  data: Customer[];
  meta: {
    page: number;
    page_size: number;
    total: number;
  };
}

export function useCustomers(search?: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['customers', search, page, pageSize],
    queryFn: () =>
      apiClient<CustomerListResponse>('/customers', {
        params: { q: search || undefined, page, page_size: pageSize },
      }),
  });
}

export function useCustomer(id?: number) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => apiClient<{ data: Customer }>(`/customers/${id}`).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) =>
      apiClient<{ data: Customer }>('/customers', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVehicleInput) =>
      apiClient<{ data: Vehicle }>('/vehicles', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
