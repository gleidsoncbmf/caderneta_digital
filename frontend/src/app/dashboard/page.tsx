'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTasks } from '@/hooks/useTasks'
import { Header } from '@/components/layout/Header'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal'
import { EditTaskModal } from '@/components/tasks/EditTaskModal'
import type { Task, TaskFilters as Filters } from '@/types/task'

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [showCreate, setShowCreate] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [filters, setFilters] = useState<Filters>({})

  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    finalizeTask,
    pinTask,
    reorderTasks,
    delegateTask,
    applyFilters,
  } = useTasks()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters({ ...filters, search: searchValue || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue])

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters)
    applyFilters({ ...newFilters, search: searchValue || undefined })
  }, [searchValue, applyFilters])

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  const handleDelete = useCallback((task: Task) => {
    deleteTask(task.id)
  }, [deleteTask])

  const handleFinalize = useCallback((task: Task) => {
    finalizeTask(task.id)
  }, [finalizeTask])

  const handlePin = useCallback((task: Task) => {
    pinTask(task.id)
  }, [pinTask])

  const handleDelegate = useCallback((task: Task) => {
    setEditTask(task)
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <Header
        onCreateClick={() => setShowCreate(true)}
        onSearchChange={handleSearchChange}
        searchValue={searchValue}
      />

      {/* Fixed filters (below header) */}
      <div className="fixed top-14 left-0 right-0 z-30">
        <TaskFilters filters={filters} onChange={handleFilterChange} />
      </div>

      {/* Main content (offset for header + filters) */}
      <main className="pt-28">
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onReorder={reorderTasks}
          onEdit={setEditTask}
          onDelete={handleDelete}
          onFinalize={handleFinalize}
          onPin={handlePin}
          onDelegate={handleDelegate}
        />
      </main>

      {/* FAB for quick create on mobile */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full shadow-lg flex items-center justify-center text-white transition-colors z-30 sm:hidden"
        aria-label="Criar tarefa"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={createTask}
      />

      <EditTaskModal
        isOpen={!!editTask}
        task={editTask}
        onClose={() => setEditTask(null)}
        onSubmit={async (id, payload) => { await updateTask(id, payload) }}
        onDelegate={async (id, name) => {
          const result = await delegateTask(id, name)
          return result
        }}
      />
    </div>
  )
}
