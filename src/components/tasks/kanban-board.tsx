'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  ListTodo,
  Clock,
  CheckCircle2,
  GripVertical,
  User,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  connectSocket,
  joinProjectRoom,
  leaveProjectRoom,
  emitTaskCreate,
  emitTaskUpdate,
  emitTaskMove,
  emitTaskDelete,
  emitActivityNew,
  getSocket,
} from '@/lib/socket'
import { ActivityFeed } from '@/components/activity/activity-feed'

interface Task {
  id: string
  title: string
  description: string
  status: string
  projectId: string
  assignedTo: string | null
  assignee: { id: string; name: string; email: string } | null
  createdAt: string
  updatedAt: string
}

interface ProjectData {
  id: string
  name: string
  description: string
  team: {
    id: string
    name: string
    members: { id: string; name: string; email: string }[]
  }
  tasks: Task[]
}

const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: ListTodo, color: 'bg-slate-500', bgColor: 'bg-muted/50', count: 0 },
  { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'bg-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-950', count: 0 },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'bg-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-950', count: 0 },
]

function TaskCard({ task, onDelete }: { task: Task; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="shadow-sm hover:shadow-md transition-all group cursor-grab active:cursor-grabbing">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600" {...listeners} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => onDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {task.assignee && (
                  <Badge variant="secondary" className="text-xs gap-1 h-5">
                    <User className="h-3 w-3" />
                    {task.assignee.name.split(' ')[0]}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TaskColumn({
  column,
  tasks,
  onAddTask,
  onDeleteTask,
}: {
  column: typeof COLUMNS[0]
  tasks: Task[]
  onAddTask: (status: string) => void
  onDeleteTask: (id: string) => void
}) {
  const Icon = column.icon

  return (
    <div className="flex flex-col min-w-0">
      <div className={`rounded-t-xl ${column.bgColor} p-3 border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${column.color}`} />
            <h3 className="font-semibold text-sm">{column.title}</h3>
            <Badge variant="secondary" className="h-5 text-xs px-1.5">
              {tasks.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onAddTask(column.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-muted/50 rounded-b-xl p-2 min-h-[200px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
            ))}
          </div>
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Icon className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No tasks</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function KanbanBoard() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const selectedProjectId = useUIStore((s) => s.selectedProjectId)

  const [project, setProject] = useState<ProjectData | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState('todo')
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('none')
  const [isCreating, setIsCreating] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [activityKey, setActivityKey] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const loadProject = useCallback(async () => {
    if (!token || !selectedProjectId) return
    setIsLoading(true)
    try {
      api.setToken(token)
      const data = await api.getProject(selectedProjectId)
      setProject(data.project)
      setTasks(data.project?.tasks || [])
    } catch (err) {
      console.error('Failed to load project:', err)
    } finally {
      setIsLoading(false)
    }
  }, [token, selectedProjectId])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  // Socket.io integration
  useEffect(() => {
    if (!selectedProjectId) return

    const socket = connectSocket()

    const onConnect = () => {
      joinProjectRoom(selectedProjectId)
    }

    if (socket.connected) {
      joinProjectRoom(selectedProjectId)
    }

    socket.on('connect', onConnect)

    // Real-time event handlers
    const onTaskCreate = (data: { task: Task }) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === data.task.id)) return prev
        return [data.task, ...prev]
      })
      setActivityKey((k) => k + 1)
    }

    const onTaskUpdate = (data: { task: Task }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === data.task.id ? data.task : t))
      )
      setActivityKey((k) => k + 1)
    }

    const onTaskMove = (data: { task: Task; fromStatus: string; toStatus: string }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === data.task.id ? data.task : t))
      )
      setActivityKey((k) => k + 1)
    }

    const onTaskDelete = (data: { taskId: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== data.taskId))
      setActivityKey((k) => k + 1)
    }

    const onActivityNew = () => {
      setActivityKey((k) => k + 1)
    }

    socket.on('task:create', onTaskCreate)
    socket.on('task:update', onTaskUpdate)
    socket.on('task:move', onTaskMove)
    socket.on('task:delete', onTaskDelete)
    socket.on('activity:new', onActivityNew)

    return () => {
      leaveProjectRoom(selectedProjectId)
      socket.off('connect', onConnect)
      socket.off('task:create', onTaskCreate)
      socket.off('task:update', onTaskUpdate)
      socket.off('task:move', onTaskMove)
      socket.off('task:delete', onTaskDelete)
      socket.off('activity:new', onActivityNew)
    }
  }, [selectedProjectId])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || !selectedProjectId) return

    const taskId = active.id as string
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Determine target column
    let targetStatus = task.status
    // Check if dropped on a column (column IDs are status values)
    const overTask = tasks.find((t) => t.id === over.id)
    if (overTask) {
      targetStatus = overTask.status
    } else {
      // Dropped on column directly
      if (['todo', 'in_progress', 'done'].includes(over.id as string)) {
        targetStatus = over.id as string
      }
    }

    if (targetStatus === task.status) return

    const fromStatus = task.status

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    )

    try {
      const data = await api.updateTask(taskId, { status: targetStatus })
      const updatedTask = data.task

      // Emit socket event
      emitTaskMove(updatedTask, selectedProjectId, fromStatus, targetStatus)

      // Emit activity
      const statusLabel = targetStatus === 'in_progress' ? 'In Progress' : targetStatus.charAt(0).toUpperCase() + targetStatus.slice(1)
      emitActivityNew(
        {
          id: Date.now().toString(),
          message: `${user?.name || 'Someone'} moved task "${task.title}" to ${statusLabel}`,
          projectId: selectedProjectId,
          userId: user?.id,
          createdAt: new Date().toISOString(),
        },
        selectedProjectId
      )

      setActivityKey((k) => k + 1)
    } catch (err) {
      console.error('Failed to move task:', err)
      // Revert optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: fromStatus } : t))
      )
    }
  }

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !selectedProjectId) return
    setIsCreating(true)
    try {
      const data = await api.createTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        status: newTaskStatus,
        projectId: selectedProjectId,
        assignedTo: newTaskAssignee === 'none' ? undefined : newTaskAssignee,
      })

      const task = data.task
      setTasks((prev) => [task, ...prev])

      // Emit socket event
      emitTaskCreate(task, selectedProjectId)

      // Emit activity
      emitActivityNew(
        {
          id: Date.now().toString(),
          message: `${user?.name || 'Someone'} created task "${task.title}"`,
          projectId: selectedProjectId,
          userId: user?.id,
          createdAt: new Date().toISOString(),
        },
        selectedProjectId
      )

      setNewTaskTitle('')
      setNewTaskDesc('')
      setNewTaskStatus('todo')
      setNewTaskAssignee('none')
      setCreateOpen(false)
      setActivityKey((k) => k + 1)
    } catch (err) {
      console.error('Failed to create task:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedProjectId) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    setTasks((prev) => prev.filter((t) => t.id !== taskId))

    try {
      await api.deleteTask(taskId)
      emitTaskDelete(taskId, selectedProjectId)
      emitActivityNew(
        {
          id: Date.now().toString(),
          message: `${user?.name || 'Someone'} deleted task "${task.title}"`,
          projectId: selectedProjectId,
          userId: user?.id,
          createdAt: new Date().toISOString(),
        },
        selectedProjectId
      )
      setActivityKey((k) => k + 1)
    } catch (err) {
      console.error('Failed to delete task:', err)
      setTasks((prev) => [...prev, task])
    }
  }

  const openCreateDialog = (status: string) => {
    setNewTaskStatus(status)
    setCreateOpen(true)
  }

  const getColumnTasks = (status: string) => tasks.filter((t) => t.status === status)

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  const members = project?.team?.members || []

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-10 rounded-t-xl" />
              <Skeleton className="h-32 rounded-b-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Project not found
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Project header */}
      <div className="p-4 md:p-6 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{project.name}</h2>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActivity(!showActivity)}
            >
              Activity
            </Button>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Task title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Task description (optional)"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={newTaskStatus} onValueChange={setNewTaskStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {members.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateTask}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                    disabled={!newTaskTitle.trim() || isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              {COLUMNS.map((column) => (
                <TaskColumn
                  key={column.id}
                  column={column}
                  tasks={getColumnTasks(column.id)}
                  onAddTask={openCreateDialog}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <Card className="shadow-xl w-64">
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm">{activeTask.title}</h4>
                    {activeTask.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {activeTask.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Activity sidebar */}
        {showActivity && selectedProjectId && (
          <div className="w-80 border-l bg-background overflow-hidden flex flex-col">
            <ActivityFeed key={activityKey} projectId={selectedProjectId} />
          </div>
        )}
      </div>
    </div>
  )
}
