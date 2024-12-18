export interface TournamentSettings {
  roundRobinType: 'SINGLE' | 'DOUBLE'
  groupCount: number
  teamsPerGroup: number
  qualifiersPerGroup: number
  hasThirdPlace: boolean
  hasExtraTime: boolean
  hasPenalties: boolean
}

export interface Tournament {
  id: string
  name: string
  description?: string
  status: 'DRAFT' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED'
  format: 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT'
  settings: TournamentSettings
  teams: Array<{
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
  }>
  matches: Array<{
    id: string
    homeTeam: {
      id: string
      name: string
      color: string
    }
    awayTeam: {
      id: string
      name: string
      color: string
    }
    homeScore?: number
    awayScore?: number
    date: string
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
  }>
  createdAt: string
  coverImage?: string
} 