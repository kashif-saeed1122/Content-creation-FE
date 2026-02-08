import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export function useOptimizedQuery<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError>
) {
  const query = useQuery(options);
  
  const memoizedData = useMemo(() => query.data, [query.data]);
  
  return {
    ...query,
    data: memoizedData,
  };
}

export function useOptimizedMutation<TData = unknown, TError = unknown, TVariables = void>(
  options: UseMutationOptions<TData, TError, TVariables>
) {
  const mutation = useMutation(options);
  
  const mutateAsync = useCallback(
    async (variables: TVariables) => {
      return mutation.mutateAsync(variables);
    },
    [mutation.mutateAsync]
  );
  
  return {
    ...mutation,
    mutateAsync,
  };
}

export function usePollingQuery<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError>,
  interval: number = 10000
) {
  return useQuery({
    ...options,
    refetchInterval: interval,
    refetchIntervalInBackground: false,
  });
}