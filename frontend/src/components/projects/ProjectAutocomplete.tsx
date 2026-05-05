'use client'

import { useState, useRef, useEffect } from 'react'
import type { Project } from '@/types/task'

interface ProjectAutocompleteProps {
  projects: Project[]
  value: Project | null
  onChange: (project: Project | null) => void
  onCreateProject: (name: string) => Promise<Project>
}

export function ProjectAutocomplete({ projects, value, onChange, onCreateProject }: ProjectAutocompleteProps) {
  const [query, setQuery] = useState(value?.name ?? '')
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value?.name ?? '')
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
        if (!value) setQuery('')
        else setQuery(value.name)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [value])

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  const showCreate = query.trim().length > 0 && !projects.some(
    (p) => p.name.toLowerCase() === query.toLowerCase()
  )

  const handleSelect = (project: Project) => {
    onChange(project)
    setQuery(project.name)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setQuery('')
    setIsOpen(false)
  }

  const handleCreate = async () => {
    if (!query.trim() || isCreating) return
    setIsCreating(true)
    try {
      const project = await onCreateProject(query.trim())
      handleSelect(project)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Projeto</label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar ou criar projeto..."
          className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Color indicator */}
      {value && (
        <div className="flex items-center gap-2 mt-1.5">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: value.color }}
          />
          <span className="text-xs text-gray-500">{value.name}</span>
        </div>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto">
          {filtered.length === 0 && !showCreate && (
            <p className="px-4 py-3 text-sm text-gray-400">Nenhum projeto encontrado.</p>
          )}

          {filtered.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => handleSelect(project)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-sm text-gray-700">{project.name}</span>
            </button>
          ))}

          {showCreate && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
            >
              <div className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm text-red-500 font-medium">
                {isCreating ? 'Criando...' : `Criar "${query}"`}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
