export type TaskStatus = 'active' | 'finalized' | 'deleted'

export interface Task {
  id: number
  description: string
  who: string | null
  start_date: string | null
  end_date: string | null
  status: TaskStatus
  priority: number
  is_pinned: boolean
  delegated_to: string | null
  share_token: string
  project_id: number | null
  project: Project | null
  is_overdue: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  name: string
  color: string
  tasks_count?: number
  created_at: string
}

export type FilterType =
  | 'all'
  | 'today'
  | 'overdue'
  | 'finalized'
  | 'delegated'

export interface TaskFilters {
  search?: string
  filter?: FilterType
  start_date?: string
  end_date?: string
  who?: string
  delegated_to?: string
  project_id?: number
}

export interface CreateTaskPayload {
  description: string
  project_id?: number | null
  who?: string
  start_date?: string
  end_date?: string
  delegated_to?: string
}

export interface UpdateTaskPayload extends CreateTaskPayload {}

export interface ReorderPayload {
  ids: number[]
}

export interface DelegatePayload {
  delegated_to: string
}

export interface DelegateResponse {
  message: string
  task: Task
  share_url: string
  whatsapp_url: string
}
