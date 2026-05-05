'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { ProjectAutocomplete } from '@/components/projects/ProjectAutocomplete'
import type { Task, UpdateTaskPayload, Project } from '@/types/task'
import { useProjects } from '@/hooks/useProjects'

interface EditTaskModalProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
  onSubmit: (id: number, payload: UpdateTaskPayload) => Promise<void>
  onDelegate: (id: number, delegatedTo: string) => Promise<any>
}

export function EditTaskModal({ isOpen, task, onClose, onSubmit, onDelegate }: EditTaskModalProps) {
  const { projects, createProject } = useProjects()
  const [form, setForm] = useState({
    description: '',
    who: '',
    start_date: '',
    end_date: '',
    delegated_to: '',
  })
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDelegating, setIsDelegating] = useState(false)
  const [delegateResult, setDelegateResult] = useState<{ share_url: string; whatsapp_url: string } | null>(null)

  useEffect(() => {
    if (task) {
      setForm({
        description: task.description,
        who: task.who ?? '',
        start_date: task.start_date ?? '',
        end_date: task.end_date ?? '',
        delegated_to: task.delegated_to ?? '',
      })
      setSelectedProject(task.project ?? null)
      setDelegateResult(null)
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return
    setIsLoading(true)
    try {
      await onSubmit(task.id, {
        description: form.description,
        who: form.who || undefined,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
        delegated_to: form.delegated_to || undefined,
        project_id: selectedProject?.id ?? null,
      })
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelegate = async () => {
    if (!task || !form.delegated_to.trim()) return
    setIsDelegating(true)
    try {
      const result = await onDelegate(task.id, form.delegated_to.trim())
      if (result) setDelegateResult(result)
    } finally {
      setIsDelegating(false)
    }
  }

  if (!task) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Tarefa" variant="yellow">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1.5">Descrição *</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Who */}
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1.5">Quem (responsável)</label>
          <input
            type="text"
            value={form.who}
            onChange={(e) => setForm({ ...form, who: e.target.value })}
            placeholder="Nome do responsável"
            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1.5">Data início</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full px-3 py-3 rounded-xl border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1.5">Data fim</label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="w-full px-3 py-3 rounded-xl border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Project */}
        <ProjectAutocomplete
          projects={projects}
          value={selectedProject}
          onChange={setSelectedProject}
          onCreateProject={(name) => createProject(name)}
        />

        {/* Delegate */}
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1.5">Delegar para</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.delegated_to}
              onChange={(e) => setForm({ ...form, delegated_to: e.target.value })}
              placeholder="Nome da pessoa"
              className="flex-1 px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {form.delegated_to && (
              <button
                type="button"
                onClick={handleDelegate}
                disabled={isDelegating}
                className="px-3 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center gap-1.5 text-sm font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
            )}
          </div>
        </div>

        {/* WhatsApp result */}
        {delegateResult && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-2">
            <p className="text-xs font-medium text-green-800">Tarefa delegada! Compartilhe:</p>
            <a
              href={delegateResult.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-green-600 hover:underline"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enviar via WhatsApp
            </a>
            <p className="text-xs text-gray-500 break-all">{delegateResult.share_url}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-amber-200 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:bg-amber-200 text-amber-900 text-sm font-semibold transition-colors"
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
