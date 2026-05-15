import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, getTokenFromHeaders } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromHeaders(request.headers)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { id } = await params
    const team = await db.team.findUnique({ where: { id } })

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Assign user to this team
    await db.user.update({
      where: { id: payload.userId },
      data: { teamId: id }
    })

    const updatedTeam = await db.team.findUnique({
      where: { id },
      include: {
        members: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json({ team: updatedTeam })
  } catch (error) {
    console.error('Team join error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
