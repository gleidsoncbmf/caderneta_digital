import api from './api'
import type { Project } from '@/types/task'

export const projectService = {
  async list(search?: string): Promise<Project[]> {
    const { data } = await api.get('/projects', { params: search ? { search } : undefined })
    return data.data ?? data
  },

  async create(payload: { name: string; color?: string }): Promise<Project> {
    const { data } = await api.post('/projects', payload)
    return data.project
  },

  async update(id: number, payload: { name: string; color?: string }): Promise<Project> {
    const { data } = await api.put(`/projects/${id}`, payload)
    return data.project
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/projects/${id}`)
  },
}
