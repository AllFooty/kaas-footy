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
    excludedDates?: string[]
    timeSlots?: TimeSlot[]
    isSingleDay?: boolean
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
  targetTeamCount: number
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
    breakTime?: number
  }
}

export interface TournamentFormatSettings {
  league?: {
    pointsForWin: number
    pointsForDraw: number
    pointsForLoss: number
    useHeadToHead: boolean
    useGoalDifference: boolean
    roundRobinType: 'SINGLE' | 'DOUBLE'
  }
  knockout?: {
    thirdPlace: boolean
    awayGoals: boolean
    replays: boolean
    legs: 'SINGLE' | 'DOUBLE'
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

export interface Team {
  id: string
  name: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  website?: string
  status: 'CONFIRMED' | 'PENDING' | 'WITHDRAWN'
}

export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  startTime: string
  date: string
  venue: string
  venueId: string
  fieldId: string
  round: number
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  leg?: 1 | 2
}

export interface Tournament {
  id: string
  name: string
  description: string
  coverImage?: string
  format: TournamentFormat
  settings: TournamentFormatSettings
  teams: Team[]
  matches: Match[]
  status: 'DRAFT' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED'
  createdAt: string
  updatedAt: string
  basicInfo: TournamentBasicInfo
  vision: TournamentVision
  constraints: TournamentConstraints
}

export type Step = 
  | 'basic-info' 
  | 'format-selection' 
  | 'format-settings' 
  | 'vision-collection'
  | 'constraint-collection' 
  | 'analysis' 
  | 'interactive-planning' 
  | 'plan-confirmation'
  | 'team-registration' 
  | 'schedule-finalization' 

export interface DurationConfig {
  startDate: string
  endDate: string
  isSingleDay: boolean
  excludedDates?: string[]
  timeSlots?: TimeSlot[]
}