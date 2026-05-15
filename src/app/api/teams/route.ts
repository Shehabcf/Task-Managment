import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, getTokenFromHeaders } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const user = await db.user.findUnique({ where: { id: payload.userId } })
    if (!user?.teamId) {
      return NextResponse.json({ teams: [] })
    }

    const team = await db.team.findUnique({
      where: { id: user.teamId },
      include: {
        members: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json({ teams: team ? [team] : [] })
  } catch (error) {
    console.error('Teams GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
    }

    const team = await db.team.create({
      data: { name },
      include: {
        members: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    // Assign current user to this team
    await db.user.update({
      where: { id: payload.userId },
      data: { teamId: team.id }
    })

    return NextResponse.json({ team }, { status: 201 })
  } catch (error) {
    console.error('Teams POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
