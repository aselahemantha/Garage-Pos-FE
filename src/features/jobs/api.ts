import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { JobCard, JobDetail, CreateJobCardInput } from './types';

export function useBoardJobs() {
  return useQuery({
    queryKey: ['jobs', 'board'],
    queryFn: () =>
      apiClient<{ data: JobCard[] }>('/jobs/board').then((res) => res.data),
    refetchInterval: 30000, // Poll every 30 seconds per spec 9.3
  });
}

export function useJob(id?: number) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () =>
      apiClient<{ data: JobDetail }>(`/jobs/${id}`).then((res) => res.data),
    enabled: !!id,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
}
