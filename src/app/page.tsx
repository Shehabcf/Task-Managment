'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { api } from '@/lib/api'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { DashboardView } from '@/components/projects/dashboard'
import { KanbanBoard } from '@/components/tasks/kanban-board'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { isAuthenticated, isLoading, token, setAuth, logout, setLoading } = useAuthStore()
  const currentView = useUIStore((s) => s.currentView)

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      if (savedToken && savedUser) {
        try {
          api.setToken(savedToken)
          // Verify token is still valid
          const data = await api.getMe()
          if (data.user) {
            setAuth(data.user, savedToken)
            return
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      logout()
    }

    checkAuth()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading TaskFlow...</p>
        </div>
      </div>
    )
  }

  // Auth views
  if (!isAuthenticated) {
    if (currentView === 'register') {
      return <RegisterForm />
    }
    return <LoginForm />
  }

  // Main app layout
  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <AppHeader />
      <div className="flex-1 flex overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'project' && <KanbanBoard />}
        </main>
      </div>
    </div>
  )
}
