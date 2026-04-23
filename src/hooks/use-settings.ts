import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import type { FundSettings } from '@/types'

async function fetchSettings(): Promise<FundSettings> {
  const res = await fetch('/api/settings')
  if (!res.ok) throw new Error('Không thể tải cài đặt')
  return res.json()
}

export function useSettings() {
  return useQuery({ queryKey: queryKeys.settings(), queryFn: fetchSettings })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<FundSettings> & { id: string }) => {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Lỗi khi cập nhật cài đặt')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.settings(), data)
      // Khi opening_balance hoặc fundName thay đổi, dashboard phải refresh ngay
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useRevokePublicToken() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/settings/revoke-token', { method: 'POST' })
      if (!res.ok) throw new Error('Lỗi khi tạo link mới')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings() }),
  })
}
