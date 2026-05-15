'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { FolderKanban, Plus, Users, X, UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Project {
  id: string
  name: string
  description: string
  teamId: string
  team: { id: string; name: string }
  _count: { tasks: number }
  createdAt: string
}

export function AppSidebar() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)
  const currentView = useUIStore((s) => s.currentView)
  const selectedProjectId = useUIStore((s) => s.selectedProjectId)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const navigateToProject = useUIStore((s) => s.navigateToProject)
  const navigateToDashboard = useUIStore((s) => s.navigateToDashboard)
  const setUser = useAuthStore((s) => s.setUser)

  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [teamOpen, setTeamOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [teamName, setTeamName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (token) {
      api.setToken(token)
    }
  }, [token])

  useEffect(() => {
    loadProjects()
    loadUserProfile()
  }, [token])

  const loadProjects = async () => {
    if (!token) return
    try {
      const data = await api.getProjects()
      setProjects(data.projects || [])
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProfile = async () => {
    if (!token) return
    try {
      const data = await api.getMe()
      if (data.user) {
        setUser(data.user)
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }

  const handleCreateProject = async () => {
    if (!newName.trim()) return
    setIsCreating(true)
    try {
      const data = await api.createProject(newName.trim(), newDesc.trim())
      setProjects((prev) => [data.project, ...prev])
      setNewName('')
      setNewDesc('')
      setCreateOpen(false)
    } catch (err: any) {
      console.error('Failed to create project:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !token) return
    setIsCreating(true)
    try {
      const data = await api.createTeam(teamName.trim())
      // Refresh user profile
      const profile = await api.getMe()
      if (profile.user) {
        setUser(profile.user)
      }
      setTeamName('')
      setTeamOpen(false)
    } catch (err: any) {
      console.error('Failed to create team:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const teamMembers = user?.team?.members || []

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-background border-r flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Team section */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-sm">{user?.team?.name || 'No Team'}</span>
            </div>
            <div className="flex items-center gap-1">
              {!user?.teamId && (
                <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Create Team">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Team</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Team Name</Label>
                        <Input
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="Engineering Team"
                        />
                      </div>
                      <Button
                        onClick={handleCreateTeam}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                        disabled={!teamName.trim() || isCreating}
                      >
                        {isCreating ? 'Creating...' : 'Create Team'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-7 w-7"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {teamMembers.length > 0 && (
            <div className="flex -space-x-2">
              {teamMembers.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="w-7 h-7 rounded-full border-2 border-background bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-medium"
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {teamMembers.length > 5 && (
                <div className="w-7 h-7 rounded-full border-2 border-background bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs">
                  +{teamMembers.length - 5}
                </div>
              )}
            </div>
          )}
          {!user?.teamId && (
            <p className="text-xs text-muted-foreground mt-1">Create a team to start collaborating</p>
          )}
        </div>

        {/* Dashboard link */}
        <div className="p-2">
          <Button
            variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2"
            onClick={navigateToDashboard}
          >
            <FolderKanban className="h-4 w-4" />
            All Projects
          </Button>
        </div>

        <Separator />

        {/* Projects list */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</span>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="My Awesome Project"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="What's this project about?"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleCreateProject}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                    disabled={!newName.trim() || isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Project'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="flex-1 px-2">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No projects yet. Create one!
              </div>
            ) : (
              <div className="space-y-1 pb-4">
                {projects.map((project) => (
                  <Button
                    key={project.id}
                    variant={selectedProjectId === project.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2 text-left h-auto py-2"
                    onClick={() => navigateToProject(project.id)}
                  >
                    <FolderKanban className="h-4 w-4 shrink-0 text-emerald-500" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{project.name}</div>
                      <div className="text-xs text-muted-foreground">{project._count.tasks} tasks</div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* User info */}
        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
