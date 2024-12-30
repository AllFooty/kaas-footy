import type { Tournament } from '@/types/tournament'
import type { TournamentScenario } from './scenarioGenerator'
import { v4 as uuidv4 } from 'uuid'

export function applyScenario(tournament: Tournament, scenario: TournamentScenario): Tournament {
  console.log('Applying scenario:', scenario)
  
  const updatedTournament = { 
    ...tournament,
    teams: tournament.teams || [],
    settings: {
      ...tournament.settings,
      matchDuration: {
        ...tournament.settings?.matchDuration || {
          regularTime: 90,
          penalties: false,
          extraTime: undefined
        }
      }
    },
    vision: {
      ...tournament.vision || {},
      targetTeamCount: scenario.changes.teamCount || tournament.vision?.targetTeamCount || 0,
      priorities: {
        venueEfficiency: true,
        matchBalance: true,
        travelDistance: false,
        restTime: true
      },
      preferences: {
        preferredMatchDays: [],
        preferredMatchTimes: [],
        avoidBackToBack: true,
        breakTime: 15
      }
    }
  }

  // Always generate teams if teamCount is specified
  if (scenario.changes.teamCount && scenario.changes.teamCount > 0) {
    const teamNames = Array.from({ length: scenario.changes.teamCount }, 
      (_, i) => `Team ${i + 1}`
    )
    updatedTournament.teams = teamNames.map(name => ({
      id: uuidv4(),
      name,
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',
      status: 'CONFIRMED' as const
    }))
    console.log('Generated teams:', updatedTournament.teams)
  }

  if (scenario.changes.matchDuration) {
    // Update match duration settings
    updatedTournament.settings = {
      ...updatedTournament.settings,
      matchDuration: {
        ...updatedTournament.settings.matchDuration,
        regularTime: scenario.changes.matchDuration
      }
    }
  }

  if (scenario.changes.format) {
    // Update format and related settings
    updatedTournament.format = scenario.changes.format
    
    // Reset format-specific settings
    if (scenario.changes.format === 'LEAGUE') {
      updatedTournament.settings.league = {
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0,
        useHeadToHead: true,
        useGoalDifference: true,
        roundRobinType: 'DOUBLE'
      }
      updatedTournament.settings.knockout = undefined
      updatedTournament.settings.group = undefined
    } else if (scenario.changes.format === 'KNOCKOUT') {
      updatedTournament.settings.knockout = {
        thirdPlace: true,
        awayGoals: false,
        replays: false,
        legs: 'SINGLE'
      }
      updatedTournament.settings.league = undefined
      updatedTournament.settings.group = undefined
    }
  }

  if (scenario.changes.totalDuration) {
    // Update duration-related settings if needed
    const startDate = new Date(updatedTournament.constraints.duration.startDate)
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + scenario.changes.totalDuration)
    
    updatedTournament.constraints.duration = {
      ...updatedTournament.constraints.duration,
      endDate: endDate.toISOString()
    }
  }

  console.log('Final updated tournament:', updatedTournament)
  return updatedTournament
} 