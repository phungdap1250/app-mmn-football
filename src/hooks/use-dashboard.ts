import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { DashboardData } from '@/types'

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard')
  if (!res.ok) throw new Error('Không thể tải dữ liệu dashboard')
  return res.json()
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  })
}

/** Invalidate dashboard cache — dùng sau khi tạo/sửa/xoá giao dịch */
export function useInvalidateDashboard() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['dashboard'] })
}
