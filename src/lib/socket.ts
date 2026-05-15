'use client'

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket | null {
  return socket
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket

  // Destroy any stale socket instance first
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }

  socket = io('/?XTransformPort=3003', {
    path: '/',          // Must match server's path: '/'
    transports: ['polling', 'websocket'],  // Try polling first (more reliable through proxies)
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    upgrade: true,
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id)
    // Join any pending rooms
    if (pendingRooms.length > 0) {
      pendingRooms.forEach(roomId => {
        socket?.emit('join:project', roomId)
      })
      pendingRooms = []
    }
  })

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected')
  })

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message)
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Track pending rooms to join once connected
let pendingRooms: string[] = []

export function joinProjectRoom(projectId: string) {
  if (socket?.connected) {
    socket.emit('join:project', projectId)
  } else {
    // Queue the join for when connection is established
    pendingRooms.push(projectId)
  }
}

export function leaveProjectRoom(projectId: string) {
  pendingRooms = pendingRooms.filter(id => id !== projectId)
  if (socket?.connected) {
    socket.emit('leave:project', projectId)
  }
}

export function emitTaskCreate(task: any, projectId: string) {
  if (socket?.connected) {
    socket.emit('task:create', { task, projectId })
  }
}

export function emitTaskUpdate(task: any, projectId: string) {
  if (socket?.connected) {
    socket.emit('task:update', { task, projectId })
  }
}

export function emitTaskMove(task: any, projectId: string, fromStatus: string, toStatus: string) {
  if (socket?.connected) {
    socket.emit('task:move', { task, projectId, fromStatus, toStatus })
  }
}

export function emitTaskDelete(taskId: string, projectId: string) {
  if (socket?.connected) {
    socket.emit('task:delete', { taskId, projectId })
  }
}

export function emitActivityNew(activity: any, projectId: string) {
  if (socket?.connected) {
    socket.emit('activity:new', { activity, projectId })
  }
}
