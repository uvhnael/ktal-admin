import { useState, useEffect, useCallback } from 'react';

// Custom hook để handle API calls
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Custom hook cho async operations (POST, PUT, DELETE)
export const useAsyncApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiFunction) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};

// Custom hook cho pagination
export const usePagination = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalParams = { ...params, ...newParams };
      const result = await apiFunction(finalParams);
      
      setData(result.data || result);
      setPagination(result.pagination || {
        page: finalParams.page || 1,
        limit: finalParams.limit || 10,
        total: result.total || 0,
        totalPages: Math.ceil((result.total || 0) / (finalParams.limit || 10)),
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    fetchData(params);
  }, [params.page, params.limit]);

  const changePage = (page) => {
    setParams(prev => ({ ...prev, page }));
  };

  const changeLimit = (limit) => {
    setParams(prev => ({ ...prev, limit, page: 1 }));
  };

  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams, page: 1 }));
  };

  const refetch = useCallback(() => {
    fetchData(params);
  }, [fetchData, params]);

  return {
    data,
    pagination,
    loading,
    error,
    refetch,
    changePage,
    changeLimit,
    updateParams,
  };
};

// Custom hook cho form handling với API
export const useFormApi = (apiFunction, onSuccess, onError) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async (formData) => {
    try {
      setLoading(true);
      setErrors({});
      
      const result = await apiFunction(formData);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
      const fieldErrors = err.response?.data?.errors || {};
      
      setErrors(fieldErrors);
      
      if (onError) {
        onError(errorMessage, fieldErrors);
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, errors };
};

// Custom hook cho search/filter
export const useSearch = (apiFunction, debounceMs = 500) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(searchQuery);
        setResults(result.data || result);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    }, debounceMs),
    [apiFunction, debounceMs]
  );

  useEffect(() => {
    search(query);
  }, [query, search]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => setResults([]),
  };
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
