import { Tournament } from "@/types"

type TournamentPreview = Pick<Tournament, 
  'id' | 
  'name' | 
  'description' | 
  'status' | 
  'format' | 
  'teams' | 
  'matches' | 
  'createdAt' | 
  'basicInfo'
>

export async function getTournament(id: string): Promise<Tournament> {
  // This is demo data - replace with actual API call later
  return {
    id,
    name: "Demo Tournament",
    description: "A demo tournament for testing purposes",
    status: "DRAFT" as const,
    format: "LEAGUE" as const,
    settings: {
      league: {
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0,
        useHeadToHead: true,
        useGoalDifference: true,
        roundRobinType: "SINGLE"
      },
      matchDuration: {
        regularTime: 90,
        penalties: false
      }
    },
    teams: [
      {
        id: "1",
        name: "Barcelona",
        status: "CONFIRMED" as const,
        primaryColor: "#A50044",
      },
      {
        id: "2",
        name: "Real Madrid",
        status: "CONFIRMED" as const,
        primaryColor: "#FFFFFF",
      }
    ],
    matches: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    basicInfo: {
      name: "Demo Tournament",
      description: "A demo tournament for testing purposes",
      competitionLevel: "RECREATIONAL" as const
    },
    vision: {
      targetTeamCount: 16,
      priorities: {
        venueEfficiency: true,
        matchBalance: true,
        restTime: true
      },
      preferences: {
        preferredMatchDays: [],
        preferredMatchTimes: [],
        avoidBackToBack: true
      }
    },
    constraints: {
      duration: {
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        isSingleDay: false
      },
      venues: [],
      availability: []
    }
  }
}

export async function updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament> {
  // TODO: Implement actual API call
  return {} as Tournament
}

export async function getTournaments(): Promise<TournamentPreview[]> {
  // TODO: Replace with actual API call
  return [
    {
      id: '1',
      name: 'Summer League 2024',
      description: 'Annual summer football tournament featuring teams from across the region.',
      status: 'ACTIVE' as const,
      format: 'LEAGUE' as const,
      teams: [],
      matches: [],
      createdAt: new Date().toISOString(),
      basicInfo: {
        name: 'Summer League 2024',
        description: 'Annual summer football tournament featuring teams from across the region.',
        competitionLevel: 'RECREATIONAL' as const
      }
    },
    {
      id: '2',
      name: 'Winter Cup',
      description: 'Knockout tournament with exciting matches and high stakes competition.',
      status: 'DRAFT' as const,
      format: 'KNOCKOUT' as const,
      teams: [],
      matches: [],
      createdAt: new Date().toISOString(),
      basicInfo: {
        name: 'Winter Cup',
        description: 'Knockout tournament with exciting matches and high stakes competition.',
        competitionLevel: 'COMPETITIVE' as const
      }
    }
  ]
} 