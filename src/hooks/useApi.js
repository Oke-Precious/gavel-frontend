import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useApi — wraps an API function with loading/error/data state.
 *
 * @param {Function} apiFn — async function to call
 * @param {Array}    deps  — dependencies (re-runs when these change)
 * @param {object}   options
 * @param {boolean}  options.immediate — whether to fire on mount (default true)
 * @param {*}        options.initialData — initial value for data (default null)
 *
 * @returns {{ data, loading, error, refetch }}
 *
 * Example:
 *   const { data, loading, error, refetch } = useApi(
 *     () => casesApi.list({ page: 1 }),
 *     [],
 *   );
 */
export function useApi(apiFn, deps = [], { immediate = true, initialData = null } = {}) {
  const [data, setData]       = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError]     = useState(null);

  // Keep a stable ref to the function to avoid stale closures
  const apiFnRef = useRef(apiFn);
  useEffect(() => { apiFnRef.current = apiFn; }, [apiFn]);

  const abortControllerRef = useRef(null);

  const execute = useCallback(async () => {
    // Abort any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await apiFnRef.current();
      setData(result);
      return result;
    } catch (err) {
      // Don't set error state if the request was aborted (component unmounted)
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;

      // Classify the error
      let errorMessage;
      if (!err.response) {
        // Network failure
        errorMessage = 'Network error — please check your connection and try again.';
      } else if (err.response.status >= 500) {
        // Server error — don't expose details to the user
        errorMessage = 'Something went wrong on our end. Please try again in a moment.';
      } else {
        // 4xx — use the backend's message if available
        errorMessage = err.response?.data?.message ?? 'An unexpected error occurred.';
      }

      setError({
        message: errorMessage,
        status: err.response?.status ?? null,
        raw: err,
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) execute();

    return () => {
      // Abort on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

export default useApi;
