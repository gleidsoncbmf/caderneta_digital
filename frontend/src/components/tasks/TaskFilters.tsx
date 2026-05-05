'use client'

import { useState } from 'react'
import type { FilterType, TaskFilters } from '@/types/task'

interface TaskFiltersProps {
  filters: TaskFilters
  onChange: (filters: TaskFilters) => void
}

const FILTER_TABS: { key: FilterType | 'all'; label: string }[] = [
  { key: 'all',       label: 'Todas' },
  { key: 'today',     label: 'Hoje' },
  { key: 'overdue',   label: 'Atrasadas' },
  { key: 'delegated', label: 'Delegadas' },
  { key: 'finalized', label: 'Finalizadas' },
]

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null)
  const active = filters.filter ?? 'all'

  const setFilter = (key: FilterType | 'all') => {
    onChange({ ...filters, filter: key === 'all' ? undefined : (key as FilterType) })
  }

  const setDate = (field: 'start_date' | 'end_date', value: string) => {
    onChange({ ...filters, [field]: value || undefined })
    setShowDatePicker(null)
  }

  return (
    <div className="bg-white border-b border-gray-100">
      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide gap-1 px-4 py-2">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              active === key
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}

        {/* Date start */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowDatePicker(showDatePicker === 'start' ? null : 'start')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
              filters.start_date
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {filters.start_date ? filters.start_date : 'Início'}
          </button>
          {showDatePicker === 'start' && (
            <div className="absolute top-8 left-0 z-30 bg-white rounded-xl shadow-lg border border-gray-100 p-2">
              <input
                type="date"
                defaultValue={filters.start_date}
                onChange={(e) => setDate('start_date', e.target.value)}
                className="text-sm p-1 border rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400"
              />
              {filters.start_date && (
                <button
                  onClick={() => { onChange({ ...filters, start_date: undefined }); setShowDatePicker(null) }}
                  className="block w-full text-xs text-red-400 hover:text-red-600 mt-1"
                >
                  Limpar
                </button>
              )}
            </div>
          )}
        </div>

        {/* Date end */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowDatePicker(showDatePicker === 'end' ? null : 'end')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
              filters.end_date
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {filters.end_date ? filters.end_date : 'Fim'}
          </button>
          {showDatePicker === 'end' && (
            <div className="absolute top-8 left-0 z-30 bg-white rounded-xl shadow-lg border border-gray-100 p-2">
              <input
                type="date"
                defaultValue={filters.end_date}
                onChange={(e) => setDate('end_date', e.target.value)}
                className="text-sm p-1 border rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400"
              />
              {filters.end_date && (
                <button
                  onClick={() => { onChange({ ...filters, end_date: undefined }); setShowDatePicker(null) }}
                  className="block w-full text-xs text-red-400 hover:text-red-600 mt-1"
                >
                  Limpar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
