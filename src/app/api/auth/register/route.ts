import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, teamName } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    // If teamName provided, create or join team
    let teamId: string | null = null
    if (teamName) {
      const team = await db.team.create({
        data: { name: teamName }
      })
      teamId = team.id
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        teamId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
      }
    })

    const token = signToken({ userId: user.id, email: user.email })

    return NextResponse.json({
      user,
      token,
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
