import { NextResponse } from 'next/server'
import type { Tournament } from '@/types/tournament'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tournament: Tournament = await request.json()
    
    // In a real app, this would be a database call
    // For now, we'll just return the tournament as-is
    return NextResponse.json(tournament)
  } catch (error) {
    console.error('Failed to update tournament:', error)
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // In a real app, this would be a database call
    // For now, we'll return a 404 since we're using client-side storage
    return NextResponse.json(
      { error: 'Tournament not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Failed to fetch tournament:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    )
  }
} 