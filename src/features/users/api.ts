import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { User, CreateUserInput, UpdateUserInput, ChangePasswordInput } from './types';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient<{ data: User[] }>('/users').then((res) => res.data),
  });
}

export function useUser(id?: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => apiClient<{ data: User }>(`/users/${id}`).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) =>
      apiClient<{ data: User }>('/users', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateUserInput }) =>
      apiClient<{ data: User }>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ChangePasswordInput }) =>
      apiClient<{ message: string }>(`/users/${id}/password`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
