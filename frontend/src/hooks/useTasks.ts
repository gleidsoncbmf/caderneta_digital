'use client'

import { useState, useCallback, useEffect } from 'react'
import { taskService } from '@/services/taskService'
import type { Task, TaskFilters, CreateTaskPayload, UpdateTaskPayload } from '@/types/task'
import toast from 'react-hot-toast'

export function useTasks(initialFilters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<TaskFilters>(initialFilters ?? {})

  const fetchTasks = useCallback(async (f?: TaskFilters) => {
    setIsLoading(true)
    try {
      const data = await taskService.list(f ?? filters)
      // Pinned tasks always on top
      const pinned = data.filter((t: Task) => t.is_pinned)
      const unpinned = data.filter((t: Task) => !t.is_pinned)
      setTasks([...pinned, ...unpinned])
    } catch {
      toast.error('Erro ao carregar tarefas.')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const applyFilters = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters)
    fetchTasks(newFilters)
  }, [fetchTasks])

  const createTask = useCallback(async (payload: CreateTaskPayload) => {
    try {
      const task = await taskService.create(payload)
      setTasks((prev) => [task, ...prev])
      toast.success('Tarefa criada!')
      return task
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao criar tarefa.'
      toast.error(msg)
      throw err
    }
  }, [])

  const updateTask = useCallback(async (id: number, payload: UpdateTaskPayload) => {
    try {
      const updated = await taskService.update(id, payload)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      toast.success('Tarefa atualizada!')
      return updated
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao atualizar.')
      throw err
    }
  }, [])

  const deleteTask = useCallback(async (id: number) => {
    try {
      await taskService.remove(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
      toast.success('Tarefa excluída.')
    } catch {
      toast.error('Erro ao excluir tarefa.')
    }
  }, [])

  const finalizeTask = useCallback(async (id: number) => {
    try {
      const updated = await taskService.finalize(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
      toast.success('Tarefa finalizada!')
      return updated
    } catch {
      toast.error('Erro ao finalizar tarefa.')
    }
  }, [])

  const pinTask = useCallback(async (id: number) => {
    try {
      const updated = await taskService.pin(id)
      setTasks((prev) => {
        const newTasks = prev.map((t) => (t.id === id ? updated : t))
        // Sort: pinned tasks first, then unpinned (preserve relative order)
        const pinned = newTasks.filter((t) => t.is_pinned)
        const unpinned = newTasks.filter((t) => !t.is_pinned)
        return [...pinned, ...unpinned]
      })
      toast.success(updated.is_pinned ? 'Tarefa fixada no topo!' : 'Tarefa desafixada.')
    } catch {
      toast.error('Erro ao fixar tarefa.')
    }
  }, [])

  const reorderTasks = useCallback(async (ordered: Task[]) => {
    setTasks(ordered)
    try {
      await taskService.reorder({ ids: ordered.map((t) => t.id) })
    } catch {
      toast.error('Erro ao reordenar.')
      fetchTasks()
    }
  }, [fetchTasks])

  const delegateTask = useCallback(async (id: number, delegatedTo: string) => {
    try {
      const result = await taskService.delegate(id, { delegated_to: delegatedTo })
      setTasks((prev) => prev.map((t) => (t.id === id ? result.task : t)))
      toast.success('Tarefa delegada!')
      return result
    } catch {
      toast.error('Erro ao delegar tarefa.')
    }
  }, [])

  return {
    tasks,
    isLoading,
    filters,
    applyFilters,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    finalizeTask,
    pinTask,
    reorderTasks,
    delegateTask,
  }
}
