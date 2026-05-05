'use client'

import { useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types/task'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TaskCardProps {
  task: Task
  index: number
  total: number
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onFinalize: (task: Task) => void
  onPin: (task: Task) => void
  onDelegate: (task: Task) => void
}

type SwipeAction = 'finalize' | 'pin' | 'delegate' | 'delete' | 'edit' | null

const SWIPE_THRESHOLD = 40

export function TaskCard({ task, index, total, onEdit, onDelete, onFinalize, onPin, onDelegate }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [revealedSide, setRevealedSide] = useState<'left' | 'right' | null>(null)
  const [pendingAction, setPendingAction] = useState<SwipeAction>(null)
  const [showConfirm, setShowConfirm] = useState<'delete' | 'finalize' | null>(null)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isScrolling = useRef<boolean | null>(null)

  // Gradient: index 0 = red-600, progressively lighter
  const gradientStops = [
    'bg-red-600', 'bg-red-500', 'bg-red-400',
    'bg-rose-400', 'bg-rose-300', 'bg-orange-300',
    'bg-orange-200', 'bg-amber-200', 'bg-yellow-200', 'bg-yellow-100',
  ]
  const colorIndex = Math.min(index, gradientStops.length - 1)
  const cardBg = gradientStops[colorIndex]

  const textColor = index < 4 ? 'text-white' : 'text-gray-800'
  const subTextColor = index < 4 ? 'text-white/80' : 'text-gray-500'
  const borderColor = index < 4 ? 'border-white/20' : 'border-gray-200'

  const handlePointerDown = (e: React.PointerEvent) => {
    touchStartX.current = e.clientX
    touchStartY.current = e.clientY
    isScrolling.current = null
    setIsSwiping(true)
    // Capture pointer so we get all move/up events even outside the element
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSwiping) return
    const dx = e.clientX - touchStartX.current
    const dy = e.clientY - touchStartY.current

    // Lock direction on first significant movement
    if (isScrolling.current === null) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return
      isScrolling.current = Math.abs(dy) > Math.abs(dx)
    }

    // Vertical → don't interfere with DnD
    if (isScrolling.current) return

    // Horizontal → handle swipe
    e.preventDefault()
    e.stopPropagation()
    const clamped = Math.max(-220, Math.min(160, dx))
    setSwipeX(clamped)
    setRevealedSide(clamped < 0 ? 'left' : 'right')
  }

  const handlePointerUp = () => {
    if (!isSwiping) return
    setIsSwiping(false)

    if (Math.abs(swipeX) < SWIPE_THRESHOLD) {
      setSwipeX(0)
      setRevealedSide(null)
      return
    }

    // Snap open to reveal actions
    if (swipeX < -SWIPE_THRESHOLD) {
      setSwipeX(-220) // matches SNAP_RIGHT
    } else {
      setSwipeX(160) // matches SNAP_LEFT
    }
  }

  const resetSwipe = () => {
    setSwipeX(0)
    setRevealedSide(null)
  }

  const handleAction = (action: SwipeAction) => {
    if (action === 'finalize') {
      setShowConfirm('finalize')
    } else if (action === 'delete') {
      setShowConfirm('delete')
    } else if (action === 'edit') {
      resetSwipe()
      onEdit(task)
    } else if (action === 'pin') {
      resetSwipe()
      onPin(task)
    } else if (action === 'delegate') {
      resetSwipe()
      onDelegate(task)
    }
    setPendingAction(action)
  }

  const confirmAction = () => {
    if (showConfirm === 'finalize') onFinalize(task)
    if (showConfirm === 'delete') onDelete(task)
    setShowConfirm(null)
    resetSwipe()
  }

  const formatDate = (date: string | null) => {
    if (!date) return null
    return format(parseISO(date), 'dd/MM', { locale: ptBR })
  }

  // DnD style — moves ENTIRE container vertically
  const dndStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  }

  // How wide the action overlay is (based on swipe distance)
  const revealWidth = Math.abs(swipeX)
  const SNAP_LEFT = 160  // width when swiped right (left buttons)
  const SNAP_RIGHT = 220 // width when swiped left (right buttons)

  return (
    <>
      {/* DnD wrapper — moves everything together vertically */}
      <div ref={setNodeRef} style={dndStyle} {...attributes} {...listeners}>

        {/* Main card — DOES NOT MOVE */}
        <div
          className={`relative overflow-hidden ${cardBg} px-4 py-3 cursor-grab active:cursor-grabbing no-select border-b border-black/10`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={() => onEdit(task)}
        >
          {/* Card content — shifts right when left buttons are revealed */}
          <div style={{
            transform: revealedSide === 'right' ? `translateX(${revealWidth}px)` : undefined,
            transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
          }}>
            {/* Pin indicator */}
            {task.is_pinned && (
              <div className="absolute top-2 right-3">
                <svg className={`w-3.5 h-3.5 ${subTextColor}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
              </div>
            )}

            {/* Description */}
            <p className={`text-sm font-medium ${textColor} leading-snug pr-4 ${
              task.status === 'finalized' ? 'line-through opacity-60' : ''
            }`}>
              {task.description}
            </p>

            {/* Meta info */}
            <div className={`flex flex-wrap items-center gap-2 mt-2 text-xs ${subTextColor}`}>
              {task.project && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.project.color }} />
                  {task.project.name}
                </span>
              )}
              {(task.start_date || task.end_date) && (
                <span className={`flex items-center gap-1 ${task.is_overdue ? 'text-red-200 font-semibold' : ''}`}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {task.start_date && formatDate(task.start_date)}
                  {task.start_date && task.end_date && ' → '}
                  {task.end_date && formatDate(task.end_date)}
                  {task.is_overdue && ' ⚠'}
                </span>
              )}
              {task.who && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {task.who}
                </span>
              )}
              {task.delegated_to && (
                <span className={`flex items-center gap-1 ${index < 4 ? 'bg-white/20' : 'bg-gray-200'} rounded-full px-2 py-0.5`}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  {task.delegated_to}
                </span>
              )}
            </div>
          </div>

          {/* LEFT overlay — slides IN from left edge (swipe right) */}
          {revealedSide === 'right' && (
            <div
              className="absolute inset-y-0 left-0 flex items-stretch"
              style={{
                width: SNAP_LEFT,
                transform: `translateX(${-(SNAP_LEFT - revealWidth)}px)`,
                transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
              }}
            >
              <button onClick={() => handleAction('delete')} className="flex-1 flex flex-col items-center justify-center bg-red-600 text-white text-xs font-medium gap-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Excluir
              </button>
              <button onClick={() => handleAction('edit')} className="flex-1 flex flex-col items-center justify-center bg-amber-400 text-amber-900 text-xs font-medium gap-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Editar
              </button>
            </div>
          )}

          {/* RIGHT overlay — slides IN from right edge (swipe left) */}
          {revealedSide === 'left' && (
            <div
              className="absolute inset-y-0 right-0 flex items-stretch"
              style={{
                width: SNAP_RIGHT,
                transform: `translateX(${SNAP_RIGHT - revealWidth}px)`,
                transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
              }}
            >
              <button onClick={() => handleAction('finalize')} className="flex-1 flex flex-col items-center justify-center bg-emerald-500 text-white text-xs font-medium gap-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Finalizar
              </button>
              <button onClick={() => handleAction('pin')} className="flex-1 flex flex-col items-center justify-center bg-indigo-500 text-white text-xs font-medium gap-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                {task.is_pinned ? 'Desafixar' : 'Fixar'}
              </button>
              <button onClick={() => handleAction('delegate')} className="flex-1 flex flex-col items-center justify-center bg-purple-500 text-white text-xs font-medium gap-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Delegar
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowConfirm(null); resetSwipe() }} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {showConfirm === 'finalize' ? 'Finalizar tarefa?' : 'Excluir tarefa?'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {showConfirm === 'finalize'
                ? 'A tarefa será marcada como finalizada e removida da lista.'
                : 'A tarefa será excluída (mantida no banco de dados).'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowConfirm(null); resetSwipe() }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold ${
                  showConfirm === 'finalize' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {showConfirm === 'finalize' ? 'Finalizar' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
