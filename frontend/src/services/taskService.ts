import api from './api'
import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  ReorderPayload,
  DelegatePayload,
  DelegateResponse,
} from '@/types/task'

export const taskService = {
  async list(filters?: TaskFilters): Promise<Task[]> {
    const { data } = await api.get('/tasks', { params: filters })
    return data.data ?? data
  },

  async create(payload: CreateTaskPayload): Promise<Task> {
    const { data } = await api.post('/tasks', payload)
    return data.task
  },

  async update(id: number, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await api.put(`/tasks/${id}`, payload)
    return data.task
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },

  async finalize(id: number): Promise<Task> {
    const { data } = await api.post(`/tasks/${id}/finalize`)
    return data.task
  },

  async pin(id: number): Promise<Task> {
    const { data } = await api.post(`/tasks/${id}/pin`)
    return data.task
  },

  async reorder(payload: ReorderPayload): Promise<void> {
    await api.post('/tasks/reorder', payload)
  },

  async delegate(id: number, payload: DelegatePayload): Promise<DelegateResponse> {
    const { data } = await api.post(`/tasks/${id}/delegate`, payload)
    return data
  },

  async getByShareToken(token: string): Promise<Task> {
    const { data } = await api.get(`/tasks/share/${token}`)
    return data.data ?? data
  },
}
