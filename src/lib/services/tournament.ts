import { Tournament } from "@/types"

type TournamentPreview = Pick<Tournament, 'id' | 'name' | 'description' | 'status' | 'format' | 'teams' | 'matches' | 'createdAt'>

export async function getTournament(id: string): Promise<Tournament> {
  // This is demo data - replace with actual API call later
  return {
    id,
    name: "Demo Tournament",
    description: "A demo tournament for testing purposes",
    status: "DRAFT" as const,
    format: "LEAGUE" as const,
    settings: {
      roundRobinType: "SINGLE",
      groupCount: 1,
      teamsPerGroup: 4,
      qualifiersPerGroup: 2,
      hasThirdPlace: true,
      hasExtraTime: true,
      hasPenalties: true
    },
    teams: [
      {
        id: "1",
        name: "Barcelona",
        color: "#A50044",
        stats: {
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0
        }
      },
      {
        id: "2",
        name: "Real Madrid",
        color: "#FFFFFF",
        stats: {
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0
        }
      }
    ],
    matches: [],
    createdAt: new Date().toISOString()
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
    }
  ]
} 