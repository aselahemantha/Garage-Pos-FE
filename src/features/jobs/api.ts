import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  JobCard,
  JobDetail,
  CreateJobCardInput,
  CreateJobItemInput,
  UpdateJobCardInput,
} from './types';

export function useBoardJobs() {
  return useQuery({
    queryKey: ['jobs', 'board'],
    queryFn: () =>
      apiClient<{ data: JobCard[] }>('/jobs/board').then((res) => res.data),
    refetchInterval: 30000,
  });
}

export function useJob(id?: number | string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () =>
      apiClient<{ data: JobDetail }>(`/jobs/${id}`).then((res) => res.data),
    enabled: Boolean(id),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJobCardInput) =>
      apiClient<{ data: JobDetail }>('/jobs', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiClient<{ data: JobDetail }>(`/jobs/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      }).then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['jobs', variables.id], data);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
}

export function useAddJobItem(jobId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJobItemInput) =>
      apiClient<{ data: JobDetail }>(`/jobs/${jobId}/items`, {
        method: 'POST',
        body: JSON.stringify(input),
      }).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['jobs', jobId], data);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
}

export function useRemoveJobItem(jobId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) =>
      apiClient<{ data: JobDetail }>(`/jobs/${jobId}/items/${itemId}`, {
        method: 'DELETE',
      }).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['jobs', jobId], data);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
}

export function useUpdateJob(jobId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateJobCardInput) =>
      apiClient<{ data: JobDetail }>(`/jobs/${jobId}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['jobs', jobId], data);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
