import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'

// 示例: 使用 TanStack Query 的自定义 hook
export function useFetchData<T>(
  key: string[],
  fetchFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, Error, T, string[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: key,
    queryFn: fetchFn,
    ...options,
  })
}

// 示例: 使用 mutation 的自定义 hook
export function useMutateData() {
  const queryClient = useQueryClient()

  return {
    queryClient,
    invalidateQueries: (key: string[]) => queryClient.invalidateQueries({ queryKey: key }),
  }
}

// 本地存储 hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const storedValue = localStorage.getItem(key)
  const item = storedValue ? (JSON.parse(storedValue) as T) : initialValue

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(item) : value
    localStorage.setItem(key, JSON.stringify(valueToStore))
  }

  const removeValue = () => {
    localStorage.removeItem(key)
  }

  return { value: item, setValue, removeValue }
}
