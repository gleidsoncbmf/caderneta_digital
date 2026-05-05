'use client'

import { useState, useRef, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { CreateTaskPayload } from '@/types/task'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateTaskPayload) => Promise<void | unknown>
}

export function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus the textarea programmatically when modal opens
  // (autoFocus alone doesn't trigger the mobile keyboard)
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow modal animation to finish
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    setIsLoading(true)
    try {
      await onSubmit({ description: description.trim() })
      setDescription('')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setDescription('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nova Tarefa">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            O que precisa ser feito?
          </label>
          <textarea
            ref={textareaRef}
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
            placeholder="Descreva a tarefa..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            inputMode="text"
            enterKeyHint="done"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter para criar • Shift+Enter para nova linha
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || !description.trim()}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold transition-colors"
          >
            {isLoading ? 'Criando...' : 'Criar Tarefa'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
