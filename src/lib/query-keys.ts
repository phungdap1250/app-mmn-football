/** TanStack Query key factory — nguồn chân lý duy nhất cho cache invalidation */
export const queryKeys = {
  dashboard: () => ['dashboard'] as const,
  transactions: (filters?: object) => ['transactions', filters] as const,
  transaction: (id: string) => ['transactions', id] as const,
  members: () => ['members'] as const,
  settings: () => ['settings'] as const,
}
