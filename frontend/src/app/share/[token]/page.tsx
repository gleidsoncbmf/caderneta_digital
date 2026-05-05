'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { taskService } from '@/services/taskService'
import type { Task } from '@/types/task'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    taskService.getByShareToken(token)
      .then(setTask)
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false))
  }, [token])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !task) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-500 text-lg font-medium">Tarefa não encontrada.</p>
        <Link href="/login" className="mt-4 text-red-500 hover:underline text-sm">
          Voltar ao início
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500 rounded-xl mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Tarefa compartilhada via</p>
          <h1 className="text-lg font-bold text-gray-900">Caderneta Digital</h1>
        </div>

        {/* Task card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          {task.delegated_to && (
            <p className="text-xs font-medium text-purple-600 mb-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Delegada para {task.delegated_to}
            </p>
          )}

          <h2 className="text-base font-semibold text-gray-900 leading-snug">{task.description}</h2>

          <div className="mt-3 space-y-1.5 text-sm text-gray-500">
            {task.project && (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: task.project.color }} />
                <span>{task.project.name}</span>
              </div>
            )}
            {task.start_date && (
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Início: {format(parseISO(task.start_date), "dd 'de' MMMM", { locale: ptBR })}</span>
              </div>
            )}
            {task.end_date && (
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Prazo: {format(parseISO(task.end_date), "dd 'de' MMMM", { locale: ptBR })}</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA - needs account */}
        <div className="bg-red-50 rounded-2xl p-5 text-center">
          <p className="text-sm text-gray-700 font-medium mb-1">
            Para ver os detalhes completos e gerenciar esta tarefa:
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Crie sua conta grátis. A tarefa será vinculada automaticamente.
          </p>
          <Link
            href={`/register?token=${token}&name=${encodeURIComponent(task.delegated_to ?? '')}`}
            className="block w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="block mt-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Já tenho conta — Entrar
          </Link>
        </div>
      </div>
    </div>
  )
}
