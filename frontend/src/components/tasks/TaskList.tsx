'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import type { Task, UpdateTaskPayload } from '@/types/task'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  onReorder: (tasks: Task[]) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onFinalize: (task: Task) => void
  onPin: (task: Task) => void
  onDelegate: (task: Task) => void
}

export function TaskList({
  tasks,
  isLoading,
  onReorder,
  onEdit,
  onDelete,
  onFinalize,
  onPin,
  onDelegate,
}: TaskListProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = tasks.findIndex((t) => t.id === active.id)
    const newIndex = tasks.findIndex((t) => t.id === over.id)

    const reordered = arrayMove(tasks, oldIndex, newIndex)
    onReorder(reordered)
  }

  if (isLoading) {
    return (
      <div className="space-y-2 px-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl animate-pulse"
            style={{ backgroundColor: `rgba(239, 68, 68, ${0.2 - i * 0.03})` }}
          />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Nenhuma tarefa encontrada</p>
        <p className="text-gray-400 text-sm mt-1">Toque em "Criar" para adicionar</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="px-4 pt-2 pb-24">
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              total={tasks.length}
              onEdit={onEdit}
              onDelete={onDelete}
              onFinalize={onFinalize}
              onPin={onPin}
              onDelegate={onDelegate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
