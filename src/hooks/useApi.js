import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Create API instance with default configuration
const createApiInstance = (token, showNotifications = false) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return {
    baseURL: API_BASE_URL,
    headers,
    timeout: DEFAULT_TIMEOUT,
    showNotifications
  };
};

// Main useApi hook for general API calls
export const useApi = (showErrorNotifications = true) => {
  const { token, refreshToken, logout } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortController = useRef(null);

  // Cancel any ongoing requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Generic API call function
  const apiCall = useCallback(async (
    endpoint, 
    options = {}, 
    showNotifications = showErrorNotifications
  ) => {
    setIsLoading(true);
    setError(null);

    // Create new abort controller for this request
    abortController.current = new AbortController();

    try {
      const config = createApiInstance(token, showNotifications);
      const url = `${config.baseURL}${endpoint}`;
      
      const requestOptions = {
        signal: abortController.current.signal,
        headers: config.headers,
        ...options
      };

      // Add timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), config.timeout);
      });

      const fetchPromise = fetch(url, requestOptions);
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      // Handle different response statuses
      if (response.status === HTTP_STATUS.UNAUTHORIZED) {
        // Try to refresh token
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          // Retry request with new token
          const retryConfig = createApiInstance(token, showNotifications);
          const retryResponse = await fetch(url, {
            ...requestOptions,
            headers: retryConfig.headers
          });
          return await handleResponse(retryResponse, showNotifications);
        } else {
          logout();
          throw new Error('Session expired. Please log in again.');
        }
      }

      return await handleResponse(response, showNotifications);

    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }

      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);

      if (showNotifications && showError) {
        showError('API Error', errorMessage);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshToken, logout, showError, showErrorNotifications]);

  // Handle API response
  const handleResponse = async (response, showNotifications) => {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let data;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (response.ok) {
      if (showNotifications && showSuccess && data.message) {
        showSuccess('Success', data.message);
      }
      return { success: true, data, status: response.status };
    } else {
      const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
  };

  // HTTP method helpers
  const get = useCallback((endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiCall(url, { method: 'GET' });
  }, [apiCall]);

  const post = useCallback((endpoint, data = {}) => {
    return apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }, [apiCall]);

  const put = useCallback((endpoint, data = {}) => {
    return apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }, [apiCall]);

  const patch = useCallback((endpoint, data = {}) => {
    return apiCall(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }, [apiCall]);

  const del = useCallback((endpoint) => {
    return apiCall(endpoint, { method: 'DELETE' });
  }, [apiCall]);

  // Upload file
  const upload = useCallback((endpoint, file, additionalData = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return apiCall(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData, let browser set it with boundary
      }
    });
  }, [apiCall, token]);

  // Cancel current request
  const cancel = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  return {
    isLoading,
    error,
    apiCall,
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    cancel
  };
};

// Hook for paginated API calls
export const usePaginatedApi = (endpoint, initialParams = {}, dependencies = []) => {
  const { get } = useApi();
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (page = 1, reset = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: pageSize,
        ...initialParams
      };

      const result = await get(endpoint, params);
      
      if (result.success) {
        const newData = result.data.items || result.data.data || [];
        const total = result.data.total || result.data.totalCount || 0;
        
        if (reset || page === 1) {
          setData(newData);
        } else {
          setData(prev => [...prev, ...newData]);
        }
        
        setTotalCount(total);
        setCurrentPage(page);
        setHasMore(newData.length === pageSize && data.length + newData.length < total);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, pageSize, initialParams, get, data.length]);

  // Load initial data
  useEffect(() => {
    fetchData(1, true);
  }, [endpoint, pageSize, ...dependencies]);

  // Load next page
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchData(currentPage + 1, false);
    }
  }, [fetchData, currentPage, isLoading, hasMore]);

  // Refresh data
  const refresh = useCallback(() => {
    setData([]);
    setCurrentPage(1);
    fetchData(1, true);
  }, [fetchData]);

  // Change page size
  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setData([]);
    setCurrentPage(1);
  }, []);

  return {
    data,
    totalCount,
    currentPage,
    pageSize,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    changePageSize
  };
};

// Hook for data fetching with caching
export const useFetch = (endpoint, params = {}, options = {}) => {
  const { get } = useApi();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const {
    cacheKey = `${endpoint}_${JSON.stringify(params)}`,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    refetchOnMount = false,
    enabled = true
  } = options;

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // Check cache first
    const cached = localStorage.getItem(`api_cache_${cacheKey}`);
    const cacheTimestamp = localStorage.getItem(`api_cache_time_${cacheKey}`);
    
    if (!force && cached && cacheTimestamp) {
      const age = Date.now() - parseInt(cacheTimestamp);
      if (age < cacheTime) {
        setData(JSON.parse(cached));
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await get(endpoint, params);
      
      if (result.success) {
        setData(result.data);
        setLastFetch(Date.now());
        
        // Cache the result
        localStorage.setItem(`api_cache_${cacheKey}`, JSON.stringify(result.data));
        localStorage.setItem(`api_cache_time_${cacheKey}`, Date.now().toString());
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, params, get, cacheKey, cacheTime, enabled]);

  // Fetch data on mount and dependency changes
  useEffect(() => {
    if (enabled) {
      fetchData(refetchOnMount);
    }
  }, [fetchData, enabled, refetchOnMount]);

  // Manual refetch
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Clear cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(`api_cache_${cacheKey}`);
    localStorage.removeItem(`api_cache_time_${cacheKey}`);
  }, [cacheKey]);

  return {
    data,
    isLoading,
    error,
    lastFetch,
    refetch,
    clearCache
  };
};

// Hook for form submissions
export const useFormSubmit = (endpoint, method = 'POST') => {
  const { apiCall } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submit = useCallback(async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const result = await apiCall(endpoint, {
        method: method.toUpperCase(),
        body: JSON.stringify(data)
      });

      if (result.success) {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
        return { success: true, data: result.data };
      } else {
        setSubmitError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setSubmitError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [apiCall, endpoint, method]);

  const reset = useCallback(() => {
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  return {
    submit,
    isSubmitting,
    submitError,
    submitSuccess,
    reset
  };
};

// Hook for optimistic updates
export const useOptimisticUpdate = (endpoint, optimisticUpdateFn) => {
  const { post, put, patch } = useApi();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (updates, method = 'PUT') => {
    setError(null);
    
    // Apply optimistic update immediately
    const previousData = data;
    const optimisticData = optimisticUpdateFn ? optimisticUpdateFn(data, updates) : { ...data, ...updates };
    setData(optimisticData);

    setIsLoading(true);

    try {
      let result;
      switch (method.toUpperCase()) {
        case 'POST':
          result = await post(endpoint, updates);
          break;
        case 'PATCH':
          result = await patch(endpoint, updates);
          break;
        default:
          result = await put(endpoint, updates);
      }

      if (result.success) {
        setData(result.data);
        return { success: true, data: result.data };
      } else {
        // Revert optimistic update on failure
        setData(previousData);
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      // Revert optimistic update on error
      setData(previousData);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [data, endpoint, post, put, patch, optimisticUpdateFn]);

  return {
    data,
    setData,
    update,
    isLoading,
    error
  };
};

// Hook for real-time data (WebSocket/SSE)
export const useRealTimeData = (endpoint, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const eventSourceRef = useRef(null);

  useEffect(() => {
    // Setup Server-Sent Events connection
    const setupConnection = () => {
      const eventSource = new EventSource(`${API_BASE_URL}${endpoint}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnectionStatus('connected');
      };

      eventSource.onmessage = (event) => {
        try {
          const newData = JSON.parse(event.data);
          setData(newData);
        } catch (error) {
          console.error('Error parsing real-time data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Real-time connection error:', error);
        setConnectionStatus('error');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (eventSource.readyState === EventSource.CLOSED) {
            setupConnection();
          }
        }, 5000);
      };

      eventSource.onclose = () => {
        setConnectionStatus('disconnected');
      };
    };

    setupConnection();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [endpoint]);

  return {
    data,
    connectionStatus,
    isConnected: connectionStatus === 'connected'
  };
};

export default useApi;