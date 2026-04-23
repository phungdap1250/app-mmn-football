/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import type { Member, CreateMemberInput } from '@/types'

async function fetchMembers(): Promise<Member[]> {
  const res = await fetch('/api/members')
  if (!res.ok) throw new Error('Không thể tải danh sách thành viên')
  const data = await res.json()
  // Chuẩn hoá snake_case → camelCase
  return data.map((m: any) => ({
    id: m.id,
    name: m.name,
    phone: m.phone,
    jerseyNumber: m.jersey_number,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  }))
}

export function useMembers() {
  return useQuery({
    queryKey: queryKeys.members(),
    queryFn: fetchMembers,
    staleTime: 0, // Luôn refetch khi mount — tránh tên cũ trong dropdown sau khi sửa thành viên
  })
}

export function useCreateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateMemberInput) => {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Lỗi khi tạo thành viên')
      }
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.members() }),
  })
}

export function useUpdateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: CreateMemberInput & { id: string }) => {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Lỗi khi cập nhật thành viên')
      }
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.members() }),
  })
}

export function useDeleteMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, force = false }: { id: string; force?: boolean }) => {
      const url = `/api/members/${id}${force ? '?force=true' : ''}`
      const res = await fetch(url, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Lỗi khi xoá thành viên')
      }
      return res.json()
    },
    onSuccess: (result, { force }) => {
      // Invalidate khi: force=true (xoá thật) hoặc force=false nhưng không có giao dịch (cũng xoá thật)
      if (force || !result.hasTransactions) {
        queryClient.invalidateQueries({ queryKey: queryKeys.members() })
      }
    },
  })
}
