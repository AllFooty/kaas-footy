export interface TimeSlot {
  start: string
  end: string
}

export interface Field {
  id: string
  name: string
}

export interface Venue {
  id: string
  name: string
  fields: Field[]
}

export interface DailyAvailability {
  date: string
  timeSlots: TimeSlot[]
  venueId: string
  fieldId: string
  isMatchDay: boolean
}

export interface TournamentConstraints {
  duration: {
    startDate: string
    endDate: string
    isSingleDay: boolean
  }
  venues: Venue[]
  availability: DailyAvailability[]
}

export interface TournamentBasicInfo {
  name: string
  description: string
  coverImage?: string
  ageGroup?: string
  competitionLevel: 'RECREATIONAL' | 'COMPETITIVE' | 'PROFESSIONAL'
}

export interface TournamentVision {
  priorities: {
    venueEfficiency: boolean
    matchBalance: boolean
    travelDistance?: boolean
    restTime?: boolean
  }
  preferences: {
    preferredMatchDays: string[]
    preferredMatchTimes: TimeSlot[]
    avoidBackToBack: boolean
  }
}

export interface TournamentFormatSettings {
  league?: {
    pointsForWin: number
    pointsForDraw: number
    pointsForLoss: number
    useHeadToHead: boolean
    useGoalDifference: boolean
  }
  knockout?: {
    thirdPlace: boolean
    awayGoals: boolean
    replays: boolean
  }
  group?: {
    numberOfGroups: number
    teamsPerGroup: number
    qualifiersPerGroup: number
  }
  matchDuration: {
    regularTime: number
    extraTime?: number
    penalties: boolean
  }
}

export type TournamentFormat = 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT'

export interface Tournament {
  id: string
  basicInfo: TournamentBasicInfo
  format: TournamentFormat
  settings: TournamentFormatSettings
  vision: TournamentVision
  constraints: TournamentConstraints
  status: 'DRAFT' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED'
  createdAt: string
  updatedAt: string
} 