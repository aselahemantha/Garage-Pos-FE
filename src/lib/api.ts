// Client API helper with access token handling and 401 refresh flow
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;

  let url = endpoint.startsWith('http') ? endpoint : `/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (accessToken) {
    reqHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: reqHeaders,
    });
  } catch {
    throw new Error('Unable to connect to the server. Please check that the backend service is running.');
  }

  // Handle 401 Unauthorized - attempt token refresh once
  if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
    try {
      const refreshRes = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // sends httpOnly refresh cookie
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json().catch(() => null);
        if (refreshData?.data?.access_token) {
          setAccessToken(refreshData.data.access_token);
          reqHeaders['Authorization'] = `Bearer ${refreshData.data.access_token}`;
          // Retry original request
          response = await fetch(url, {
            ...rest,
            headers: reqHeaders,
          });
        }
      } else {
        setAccessToken(null);
      }
    } catch {
      setAccessToken(null);
    }
  }

  const rawText = await response.text();
  let parsedBody: any = null;
  if (rawText) {
    try {
      parsedBody = JSON.parse(rawText);
    } catch {
      parsedBody = null;
    }
  }

  if (!response.ok) {
    if (
      (response.status === 502 || response.status === 503 || response.status === 504 || response.status === 500) &&
      !parsedBody?.error?.message
    ) {
      throw new Error('Backend server is unavailable. Please make sure the API server is running and try again.');
    }
    const message = parsedBody?.error?.message || response.statusText || 'An error occurred';
    throw new Error(message);
  }

  if (response.status === 204 || !rawText) {
    return {} as T;
  }

  if (parsedBody === null) {
    throw new Error('Received an invalid response from the server.');
  }

  return parsedBody as T;
}
