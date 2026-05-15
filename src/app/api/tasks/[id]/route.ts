import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, getTokenFromHeaders } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromHeaders(request.headers)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { title, description, status, assignedTo } = body

    const existingTask = await db.task.findUnique({ where: { id } })
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null

    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } }
      }
    })

    // Create activity for status change or assignment
    const user = await db.user.findUnique({ where: { id: payload.userId } })
    const userName = user?.name || 'Someone'

    if (status !== undefined && status !== existingTask.status) {
      const statusLabel = status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)
      await db.activity.create({
        data: {
          message: `${userName} moved task "${existingTask.title}" to ${statusLabel}`,
          projectId: existingTask.projectId,
          userId: payload.userId,
        }
      })
    } else if (assignedTo !== undefined && assignedTo !== existingTask.assignedTo) {
      const assignee = assignedTo ? await db.user.findUnique({ where: { id: assignedTo } }) : null
      await db.activity.create({
        data: {
          message: assignee
            ? `${userName} assigned task "${existingTask.title}" to ${assignee.name}`
            : `${userName} unassigned task "${existingTask.title}"`,
          projectId: existingTask.projectId,
          userId: payload.userId,
        }
      })
    } else if (title !== undefined && title !== existingTask.title) {
      await db.activity.create({
        data: {
          message: `${userName} renamed task to "${title}"`,
          projectId: existingTask.projectId,
          userId: payload.userId,
        }
      })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Task PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromHeaders(request.headers)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { id } = await params
    const task = await db.task.findUnique({ where: { id } })
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Create activity before deleting
    const user = await db.user.findUnique({ where: { id: payload.userId } })
    await db.activity.create({
      data: {
        message: `${user?.name || 'Someone'} deleted task "${task.title}"`,
        projectId: task.projectId,
        userId: payload.userId,
      }
    })

    await db.task.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Task DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
