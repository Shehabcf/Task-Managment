import { create } from 'zustand'

export type ViewType = 'dashboard' | 'project' | 'loading' | 'login' | 'register'

interface UIState {
  currentView: ViewType
  selectedProjectId: string | null
  sidebarOpen: boolean
  setCurrentView: (view: ViewType) => void
  setSelectedProjectId: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
  navigateToProject: (projectId: string) => void
  navigateToDashboard: () => void
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'dashboard',
  selectedProjectId: null,
  sidebarOpen: true,
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  navigateToProject: (projectId) => set({ currentView: 'project', selectedProjectId: projectId }),
  navigateToDashboard: () => set({ currentView: 'dashboard', selectedProjectId: null }),
}))
