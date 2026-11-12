import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  InvoiceSummary,
  InvoiceDetail,
  CashSession,
  IssueInvoicePayload,
  RecordPaymentPayload,
  OpenCashSessionPayload,
  CloseCashSessionPayload,
} from './types';

export function useInvoices(status?: string, search?: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ['invoices', status, search, limit, offset],
    queryFn: () =>
      apiClient<{ data: { invoices: InvoiceSummary[]; total: number; limit: number; offset: number } }>('/invoices', {
        params: {
          status: status || undefined,
          search: search || undefined,
          limit,
          offset,
        },
      }).then((res) => res.data),
  });
}

export function useInvoice(id?: number | string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => apiClient<{ data: InvoiceDetail }>(`/invoices/${id}`).then((res) => res.data),
    enabled: Boolean(id),
  });
}

export function useIssueInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IssueInvoicePayload) =>
      apiClient<{ data: InvoiceDetail }>('/invoices', {
        method: 'POST',
        body: JSON.stringify(payload),
      }).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.setQueryData(['invoice', data.id], data);
    },
  });
}

export function useRecordPayment(invoiceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordPaymentPayload) =>
      apiClient<{ data: InvoiceDetail }>(`/invoices/${invoiceId}/payments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['invoice', invoiceId], data);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['cash-session-active'] });
      queryClient.invalidateQueries({ queryKey: ['cash-sessions'] });
    },
  });
}

export function useVoidInvoice(invoiceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      apiClient<{ data: InvoiceDetail }>(`/invoices/${invoiceId}/void`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['invoice', invoiceId], data);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// Cash Sessions
export function useActiveCashSession() {
  return useQuery({
    queryKey: ['cash-session-active'],
    queryFn: () => apiClient<{ data: CashSession | null }>('/cash-sessions/active').then((res) => res.data),
  });
}

export function useOpenCashSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpenCashSessionPayload) =>
      apiClient<{ data: CashSession }>('/cash-sessions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-session-active'] });
      queryClient.invalidateQueries({ queryKey: ['cash-sessions'] });
    },
  });
}

export function useCloseCashSession(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CloseCashSessionPayload) =>
      apiClient<{ data: CashSession }>(`/cash-sessions/${sessionId}/close`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-session-active'] });
      queryClient.invalidateQueries({ queryKey: ['cash-sessions'] });
    },
  });
}

export function useCashSessions(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ['cash-sessions', limit, offset],
    queryFn: () =>
      apiClient<{ data: CashSession[] }>('/cash-sessions', {
        params: { limit, offset },
      }).then((res) => res.data),
  });
}
