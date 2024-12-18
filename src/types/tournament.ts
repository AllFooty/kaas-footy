export interface Tournament {
  id: string
  name: string
  status: 'DRAFT' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED'
  teams: Team[]
  matches: Match[]
}

export interface Team {
  id: string
  name: string
  color: string
  stats: {
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
    points: number
  }
}

export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  homeScore?: number
  awayScore?: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
  date: string
} 