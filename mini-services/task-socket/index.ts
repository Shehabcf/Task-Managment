import { createServer, IncomingMessage, ServerResponse } from 'http'
import { Server, Socket } from 'socket.io'

const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', connections: io.engine.clientsCount }))
    return
  }
})

const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 30000,
  allowEIO3: true,
})

// Track which rooms each socket is in
const socketRooms = new Map<string, Set<string>>()

interface TaskData {
  id: string
  title: string
  description: string
  status: string
  projectId: string
  assignedTo: string | null
  assignee?: { id: string; name: string; email: string } | null
  createdAt: string
  updatedAt: string
}

interface ActivityData {
  id: string
  message: string
  projectId: string
  userId?: string
  user?: { id: string; name: string; email: string } | null
  createdAt: string
}

io.on('connection', (socket: Socket) => {
  console.log(`[Socket] User connected: ${socket.id}`)
  socketRooms.set(socket.id, new Set())

  // Join a project room
  socket.on('join:project', (projectId: string) => {
    const room = `project:${projectId}`
    socket.join(room)
    const rooms = socketRooms.get(socket.id)
    if (rooms) rooms.add(room)
    console.log(`[Socket] ${socket.id} joined room: ${room}`)
    socket.to(room).emit('user:joined', { socketId: socket.id })
  })

  // Leave a project room
  socket.on('leave:project', (projectId: string) => {
    const room = `project:${projectId}`
    socket.leave(room)
    const rooms = socketRooms.get(socket.id)
    if (rooms) rooms.delete(room)
    console.log(`[Socket] ${socket.id} left room: ${room}`)
  })

  // Task created event
  socket.on('task:create', (data: { task: TaskData; projectId: string }) => {
    const room = `project:${data.projectId}`
    socket.to(room).emit('task:create', data)
    console.log(`[Socket] Task created in ${room}: ${data.task.title}`)
  })

  // Task updated event
  socket.on('task:update', (data: { task: TaskData; projectId: string }) => {
    const room = `project:${data.projectId}`
    socket.to(room).emit('task:update', data)
    console.log(`[Socket] Task updated in ${room}: ${data.task.id}`)
  })

  // Task moved (status changed) event
  socket.on('task:move', (data: { task: TaskData; projectId: string; fromStatus: string; toStatus: string }) => {
    const room = `project:${data.projectId}`
    socket.to(room).emit('task:move', data)
    console.log(`[Socket] Task moved in ${room}: ${data.task.id} from ${data.fromStatus} to ${data.toStatus}`)
  })

  // New activity event
  socket.on('activity:new', (data: { activity: ActivityData; projectId: string }) => {
    const room = `project:${data.projectId}`
    io.to(room).emit('activity:new', data)
    console.log(`[Socket] New activity in ${room}: ${data.activity.message}`)
  })

  // Task deleted event
  socket.on('task:delete', (data: { taskId: string; projectId: string }) => {
    const room = `project:${data.projectId}`
    socket.to(room).emit('task:delete', data)
    console.log(`[Socket] Task deleted in ${room}: ${data.taskId}`)
  })

  // Disconnect
  socket.on('disconnect', (reason) => {
    const rooms = socketRooms.get(socket.id)
    if (rooms) {
      rooms.forEach(room => {
        socket.to(room).emit('user:left', { socketId: socket.id })
      })
    }
    socketRooms.delete(socket.id)
    console.log(`[Socket] User disconnected: ${socket.id} (${reason})`)
  })

  socket.on('error', (error: Error) => {
    console.error(`[Socket] Error (${socket.id}):`, error.message)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[TaskSocket] Socket.io server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[TaskSocket] Received SIGTERM, shutting down...')
  httpServer.close(() => {
    console.log('[TaskSocket] Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[TaskSocket] Received SIGINT, shutting down...')
  httpServer.close(() => {
    console.log('[TaskSocket] Server closed')
    process.exit(0)
  })
})
