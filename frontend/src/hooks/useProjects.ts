'use client'

import { useState, useCallback, useEffect } from 'react'
import { projectService } from '@/services/projectService'
import type { Project } from '@/types/task'
import toast from 'react-hot-toast'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchProjects = useCallback(async (search?: string) => {
    setIsLoading(true)
    try {
      const data = await projectService.list(search)
      setProjects(data)
    } catch {
      // silent - not critical
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const createProject = useCallback(async (name: string, color?: string) => {
    try {
      const project = await projectService.create({ name, color })
      setProjects((prev) => [...prev, project].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('Projeto criado!')
      return project
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao criar projeto.')
      throw err
    }
  }, [])

  return { projects, isLoading, fetchProjects, createProject }
}
