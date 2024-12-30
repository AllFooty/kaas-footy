import type { Tournament, TournamentFormat } from '@/types/tournament'
import { parse } from 'date-fns'

export interface TournamentScenario {
  id: string
  label: string
  isRecommended: boolean
  changes: {
    teamCount?: number
    matchDuration?: number
    format?: TournamentFormat
    totalDuration?: number
    additionalRequirements?: string[]
    teams?: string[]
  }
  impact: {
    venueUtilization: number
    averageRestTime: number
    feasible: boolean
    infeasibilityReason?: string
  }
}

export class ScenarioGenerator {
  private tournament: Tournament
  private MAX_VENUE_UTILIZATION = 95 // We’ll cap at 95% as a more realistic upper bound

  constructor(tournament: Tournament) {
    this.tournament = tournament
  }

  private getPriorityWeights() {
    const defaultPriorities = { venueEfficiency: false, restTime: false }
    const userPriorities = this.tournament.vision?.priorities || defaultPriorities

    // Only one priority should be true at a time
    return {
      venueEfficiency: userPriorities.venueEfficiency ? 1.4 : 0.8,
      restTime: userPriorities.restTime ? 1.4 : 0.8,
    }
  }

  private getMinimumRestTime(): number {
    const userPreferred = this.tournament.vision?.preferences?.breakTime ?? 15
    console.log('User preferred rest time:', userPreferred)
    return Math.max(5, userPreferred)
  }

  public generateScenarios(): { 
    scenarios: TournamentScenario[], 
    feasibilityCheck: ReturnType<typeof this.checkTournamentFeasibility> 
  } {
    const feasibilityCheck = this.checkTournamentFeasibility()
    const scenarios: TournamentScenario[] = []
    
    // Even if not fully feasible, try to generate constrained scenarios
    if (!feasibilityCheck.feasible) {
      const totalAvailableMinutes = this.getTotalAvailableMinutes()
      const availableFields = this.tournament.constraints.venues.reduce(
        (sum, venue) => sum + venue.fields.length, 
        0
      ) || 1 // Fallback to 1 if no fields specified
      
      // Calculate maximum possible teams and match duration that would fit
      const currentTeamCount = this.tournament.vision?.targetTeamCount || 16
      const desiredMatchDuration = this.tournament.settings?.matchDuration?.regularTime || 75
      
      // Calculate constraints
      const maxPossibleTeams = this.calculateMaxPossibleTeams(totalAvailableMinutes, availableFields)
      const maxPossibleDuration = this.calculateMaxPossibleDuration(totalAvailableMinutes, currentTeamCount)
      
      // Generate constrained scenarios
      const constrainedScenarios = [
        // Scenario 1: Reduce teams, keep duration
        {
          id: 'constrained-1',
          label: 'Reduced Teams',
          isRecommended: true,
          changes: {
            teamCount: maxPossibleTeams,
            matchDuration: desiredMatchDuration,
            teams: this.generateTeams(maxPossibleTeams)
          },
          impact: {
            venueUtilization: 85,
            averageRestTime: 15,
            feasible: true
          }
        },
        
        // Scenario 2: Reduce duration, keep teams
        {
          id: 'constrained-2',
          label: 'Shorter Matches',
          isRecommended: false,
          changes: {
            teamCount: currentTeamCount,
            matchDuration: maxPossibleDuration,
            teams: this.generateTeams(currentTeamCount)
          },
          impact: {
            venueUtilization: 90,
            averageRestTime: 10,
            feasible: true
          }
        },
        
        // Scenario 3: Balance both
        {
          id: 'constrained-3',
          label: 'Balanced Adjustment',
          isRecommended: false,
          changes: {
            teamCount: Math.floor((currentTeamCount + maxPossibleTeams) / 2),
            matchDuration: Math.floor((desiredMatchDuration + maxPossibleDuration) / 2),
            teams: this.generateTeams(Math.floor((currentTeamCount + maxPossibleTeams) / 2))
          },
          impact: {
            venueUtilization: 80,
            averageRestTime: 20,
            feasible: true
          }
        }
      ]

      // Simulate actual impact values for each scenario
      constrainedScenarios.forEach(scenario => {
        scenario.impact.venueUtilization = this.simulateVenueUsage(scenario)
        scenario.impact.averageRestTime = this.simulateRestTime(scenario)
      })

      // Only include scenarios that pass validation
      scenarios.push(...constrainedScenarios.filter(s => this.validateScenario(s)))
    } else {
      // Original scenario generation for feasible tournaments
      scenarios.push(this.generateRecommendedScenario())
      scenarios.push(...this.generateAlternativeScenarios())
    }

    return { 
      scenarios, 
      feasibilityCheck 
    }
  }

  private generateRecommendedScenario(): TournamentScenario {
    const existingFormat = this.tournament.format
    const teamCount = this.tournament.vision?.targetTeamCount || 16
    const { venueEfficiency, restTime } = this.getPriorityWeights()

    // Cap match duration at 90 minutes and round to nearest 5
    const recommendedMatchDuration = Math.min(
      Math.round(Math.round(75 * restTime) / 5) * 5,
      90
    )
    const recommendedTotalDuration = Math.round(4320 * venueEfficiency)

    return {
      id: 'recommended',
      label: 'Recommended Scenario',
      isRecommended: true,
      changes: {
        teamCount,
        matchDuration: recommendedMatchDuration,
        format: existingFormat,
        totalDuration: recommendedTotalDuration,
        teams: this.generateTeams(teamCount)
      },
      impact: {
        venueUtilization: Math.round(79 * venueEfficiency),
        averageRestTime: 120,
        feasible: true,
      }
    }
  }

  private generateAlternativeScenarios(): TournamentScenario[] {
    console.log('Generating alternative scenarios with tournament:', {
      vision: this.tournament.vision,
      constraints: this.tournament.constraints,
      format: this.tournament.format
    })

    const scenarios: TournamentScenario[] = []
    const { venueEfficiency, restTime } = this.getPriorityWeights()
    const currentTeamCount = this.tournament.vision?.targetTeamCount || 16
    const totalAvailableMinutes = this.getTotalAvailableMinutes()
    const availableFields = this.tournament.constraints.venues.reduce(
      (sum, venue) => sum + venue.fields.length, 
      0
    )

    // Create potential scenarios
    const potentialScenarios: TournamentScenario[] = []

    // Standard durations in minutes
    const matchDurations = [15, 20, 25, 30, 35, 40, 45, 60, 75, 90]
    const baseMatchDuration = 75 // Standard match duration
    const baseRestTime = 5 // Use hard minimum instead of preference
    const maxTeamsPerField = 10 // Increased from 8 to allow more flexibility

    // Helper function to get nearest valid duration
    const getNearestDuration = (target: number): number => {
      const validDuration = matchDurations.reduce((prev, curr) => 
        Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
      )
      return Math.min(validDuration, 90) // Never exceed 90 minutes
    }

    // Calculate optimal values
    const maxConcurrentMatches = availableFields
    const maxTeams = Math.min(32, maxTeamsPerField * availableFields)
    const minTeams = Math.max(4, Math.ceil(currentTeamCount * 0.5)) // More flexible team reduction

    // Scenario 1: Balanced Approach (Always include this)
    potentialScenarios.push({
      id: 'alternative-1',
      label: 'Balanced Schedule',
      isRecommended: true,
      changes: {
        teamCount: currentTeamCount,
        matchDuration: baseMatchDuration,
        totalDuration: totalAvailableMinutes,
        teams: this.generateTeams(currentTeamCount)
      },
      impact: {
        venueUtilization: 75,
        averageRestTime: baseRestTime * 2,
        feasible: true
      }
    })

    // If venue efficiency is prioritized
    if (this.tournament.vision?.priorities?.venueEfficiency) {
      // Scenario 2: Maximum Efficiency
      potentialScenarios.push({
        id: 'alternative-2',
        label: 'Maximum Venue Efficiency',
        isRecommended: false,
        changes: {
          teamCount: currentTeamCount,
          matchDuration: getNearestDuration(baseMatchDuration * 0.7),
          totalDuration: Math.floor(totalAvailableMinutes * 0.95),
          teams: this.generateTeams(currentTeamCount)
        },
        impact: {
          venueUtilization: 90,
          averageRestTime: baseRestTime * 1.2,
          feasible: true
        }
      })

      // Scenario 3: Compact Schedule
      potentialScenarios.push({
        id: 'alternative-3',
        label: 'Compact Schedule',
        isRecommended: false,
        changes: {
          teamCount: Math.max(minTeams, currentTeamCount - 4),
          matchDuration: getNearestDuration(baseMatchDuration * 0.8),
          totalDuration: Math.floor(totalAvailableMinutes * 0.8),
          teams: this.generateTeams(Math.max(minTeams, currentTeamCount - 4))
        },
        impact: {
          venueUtilization: 85,
          averageRestTime: baseRestTime * 1.5,
          feasible: true
        }
      })
    }

    // If rest time is prioritized
    if (this.tournament.vision?.priorities?.restTime) {
      // Scenario 4: Maximum Rest Time
      potentialScenarios.push({
        id: 'alternative-4',
        label: 'Maximum Rest Periods',
        isRecommended: false,
        changes: {
          teamCount: Math.max(minTeams, currentTeamCount - 4),
          matchDuration: getNearestDuration(baseMatchDuration * 0.9),
          totalDuration: totalAvailableMinutes,
          teams: this.generateTeams(Math.max(minTeams, currentTeamCount - 4))
        },
        impact: {
          venueUtilization: 50,
          averageRestTime: baseRestTime * 3,
          feasible: true
        }
      })
    }

    // Add a minimal viable scenario that should almost always pass validation
    potentialScenarios.push({
      id: 'alternative-5',
      label: 'Minimal Schedule',
      isRecommended: false,
      changes: {
        teamCount: Math.max(4, Math.floor(currentTeamCount * 0.5)),
        matchDuration: 15, // Minimum allowed duration
        totalDuration: Math.floor(totalAvailableMinutes * 0.5),
        teams: this.generateTeams(Math.max(4, Math.floor(currentTeamCount * 0.5)))
      },
      impact: {
        venueUtilization: 30,
        averageRestTime: baseRestTime * 4,
        feasible: true
      }
    })

    console.log('Generated potential scenarios:', potentialScenarios)
    
    // Only add scenarios that pass validation
    potentialScenarios.forEach(scenario => {
      console.log('Processing potential scenario:', scenario.label)
      const actualRestTime = this.simulateRestTime(scenario)
      const actualVenueUsage = this.simulateVenueUsage(scenario)
      
      scenario.impact.averageRestTime = actualRestTime
      scenario.impact.venueUtilization = actualVenueUsage

      if (this.validateScenario(scenario)) {
        scenarios.push(scenario)
      }
    })

    console.log('Final alternative scenarios:', scenarios)
    return scenarios
  }

  private generateTeams(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `Team ${i + 1}`)
  }

  private simulateVenueUsage(scenario: TournamentScenario): number {
    const totalAvailableVenueMinutes = this.getTotalAvailableMinutes()
    const scenarioNeededMinutes = this.calculateScenarioMinutesNeeded(scenario)

    const rawUtil = (scenarioNeededMinutes / totalAvailableVenueMinutes) * 100
    return Math.round(rawUtil)
  }

  private simulateRestTime(scenario: TournamentScenario): number {
    const totalTeams = scenario.changes.teams?.length || 1
    const totalMatches = this.estimateNumberOfMatches(scenario)
    const matchDuration = scenario.changes.matchDuration || 75
    
    // Get actual available minutes
    const totalAvailableMinutes = this.getTotalAvailableMinutes()
    
    // Calculate how many matches can run in parallel based on available fields
    const availableFields = this.tournament.constraints.venues.reduce(
      (sum, venue) => sum + venue.fields.length, 
      0
    )
    const concurrentMatches = Math.min(
      availableFields,
      Math.floor(totalTeams / 2)
    )
    
    // Calculate total tournament time needed
    const totalMatchTime = totalMatches * matchDuration
    const timeSlots = Math.ceil(totalMatches / concurrentMatches)
    const actualTournamentTime = timeSlots * matchDuration
    
    // Calculate rest time considering parallel matches
    const totalRestTime = totalAvailableMinutes - actualTournamentTime
    const matchesPerTeam = this.getMatchesPerTeam(scenario)
    
    // Each team's rest time between consecutive matches
    const averageRestTime = Math.floor(
      (totalRestTime * concurrentMatches) / 
      (totalTeams * matchesPerTeam)
    )
    
    return averageRestTime
  }

  private getMatchesPerTeam(scenario: TournamentScenario): number {
    const teams = scenario.changes.teams?.length || 16
    
    // Calculate based on tournament format
    switch (this.tournament.format) {
      case 'LEAGUE':
        // In a league, each team plays against every other team
        return teams - 1
      case 'KNOCKOUT':
        // In knockout, half the teams play each round until final
        return Math.ceil(Math.log2(teams))
      case 'GROUP_KNOCKOUT':
        // Group stage matches + potential knockout matches
        const groupSize = 4 // typical group size
        const groupMatches = groupSize - 1
        const knockoutMatches = Math.ceil(Math.log2(teams / 2)) // assuming half teams qualify
        return groupMatches + knockoutMatches
      default:
        return Math.floor(teams / 2) // fallback calculation
    }
  }

  private getTotalAvailableMinutes(): number {
    // Calculate actual available minutes from tournament constraints
    return this.tournament.constraints.availability.reduce((total, day) => {
      if (!day.isMatchDay) return total
      
      return total + day.timeSlots.reduce((dayTotal, slot) => {
        const start = parse(slot.start, 'HH:mm', new Date())
        const end = parse(slot.end, 'HH:mm', new Date())
        const slotMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
        return dayTotal + slotMinutes
      }, 0)
    }, 0)
  }

  private calculateScenarioMinutesNeeded(scenario: TournamentScenario): number {
    const matchDuration = scenario.changes.matchDuration || 75
    const totalMatches = this.estimateNumberOfMatches({
      changes: {
        teamCount: scenario.changes.teamCount,
        matchDuration
      }
    })
    return totalMatches * matchDuration
  }

  private estimateNumberOfMatches(params: { changes: Partial<TournamentScenario['changes']> }): number {
    const teams = params.changes.teamCount || 16
    
    switch (this.tournament.format) {
      case 'LEAGUE':
        return Math.floor((teams * (teams - 1)) / 2)
      case 'KNOCKOUT':
        return teams - 1
      case 'GROUP_KNOCKOUT':
        const groupCount = Math.ceil(teams / 4)
        const groupMatches = groupCount * 6
        const knockoutTeams = Math.min(teams / 2, 8)
        const knockoutMatches = knockoutTeams - 1
        return groupMatches + knockoutMatches
      default:
        return Math.floor(teams * 1.5)
    }
  }

  private validateScenario(scenario: TournamentScenario): boolean {
    const restTime = this.simulateRestTime(scenario)
    const venueUsage = this.simulateVenueUsage(scenario)
    const minimumRestTime = 5 // Hard minimum, regardless of preferences
    const availableFields = this.tournament.constraints.venues.reduce(
      (sum, venue) => sum + venue.fields.length, 
      0
    )

    // Add debug logging
    console.log('Validating scenario:', {
      id: scenario.id,
      label: scenario.label,
      validation: {
        restTime,
        minimumRestTime,
        venueUsage,
        matchDuration: scenario.changes.matchDuration,
        teamCount: scenario.changes.teamCount,
        availableFields,
        fieldsNeeded: Math.ceil(scenario.changes.teamCount / 2)
      }
    })

    // Relaxed validation rules
    const isValid = (
      restTime >= minimumRestTime && // Use hard minimum instead of user preference
      venueUsage <= 100 &&
      venueUsage >= 20 && // Lower minimum venue usage threshold
      (scenario.changes.matchDuration ?? 75) >= 15 && // More flexible match duration
      (scenario.changes.teamCount ?? 16) >= 4 &&
      (scenario.changes.teamCount ?? 16) <= 32 &&
      Math.ceil((scenario.changes.teamCount ?? 16) / 2) <= availableFields * 6 // More flexible field utilization
    )

    if (!isValid) {
      console.log('Scenario validation failed:', {
        id: scenario.id,
        reasons: {
          restTime: restTime < minimumRestTime ? 'Rest time below absolute minimum (5 min)' : null,
          venueUsageHigh: venueUsage > 100 ? 'Venue usage exceeds capacity' : null,
          venueUsageLow: venueUsage < 20 ? 'Venue usage too low' : null,
          matchDuration: (scenario.changes.matchDuration ?? 75) < 15 ? 'Match duration too short' : null,
          teamCountLow: (scenario.changes.teamCount ?? 16) < 4 ? 'Too few teams' : null,
          teamCountHigh: (scenario.changes.teamCount ?? 16) > 32 ? 'Too many teams' : null,
          fields: Math.ceil((scenario.changes.teamCount ?? 16) / 2) > availableFields * 6 ? 'Not enough fields' : null
        }
      })
    }

    return isValid
  }

  private checkTournamentFeasibility(): { 
    feasible: boolean, 
    issues: Array<{
      type: 'ERROR' | 'WARNING',
      message: string,
      suggestion: string
    }> 
  } {
    const totalAvailableMinutes = this.getTotalAvailableMinutes()
    const teamCount = this.tournament.vision?.targetTeamCount || 16
    const matchDuration = this.tournament.settings?.matchDuration?.regularTime || 75
    const totalMatches = this.estimateNumberOfMatches({
      changes: { 
        teamCount,
        matchDuration
      }
    })
    const availableFields = this.tournament.constraints.venues.reduce(
      (sum, venue) => sum + venue.fields.length, 
      0
    )

    const issues = []
    const minimumTimeNeeded = totalMatches * matchDuration
    const concurrentMatches = Math.min(
      availableFields,
      Math.floor(teamCount / 2)
    )
    const minimumTimeWithRest = minimumTimeNeeded * 1.2 // Adding 20% for minimum rest

    // Check if tournament dates are set
    if (!this.tournament.constraints.duration.startDate || 
        !this.tournament.constraints.duration.endDate) {
      issues.push({
        type: 'ERROR',
        message: 'Tournament dates have not been set.',
        suggestion: 'Please set the start and end dates for your tournament.'
      })
    }

    // Check if venues exist
    if (this.tournament.constraints.venues.length === 0) {
      issues.push({
        type: 'ERROR',
        message: 'No venues have been added.',
        suggestion: 'Add at least one venue with fields to host matches.'
      })
    }

    // Check if time slots exist
    if (totalAvailableMinutes === 0) {
      issues.push({
        type: 'ERROR',
        message: 'No venue time slots have been added.',
        suggestion: 'Add available time slots for your venues. Consider typical match times like 9 AM to 5 PM.'
      })
    }

    // Check if there's enough time for all matches
    if (minimumTimeNeeded > totalAvailableMinutes) {
      const hoursNeeded = Math.ceil(minimumTimeNeeded / 60)
      const hoursAvailable = Math.floor(totalAvailableMinutes / 60)
      const suggestedDuration = Math.max(15, Math.floor(matchDuration * (totalAvailableMinutes / minimumTimeNeeded)))
      
      issues.push({
        type: 'ERROR',
        message: `Not enough time available. Need ${hoursNeeded} hours but only have ${hoursAvailable} hours.`,
        suggestion: `Consider one or more of these options:\n` +
          `1. Add more time slots or days\n` +
          `2. Reduce match duration (suggested: ${suggestedDuration} minutes)\n` +
          `3. Reduce number of teams (current: ${teamCount})\n` +
          `4. Add more venues/fields (current: ${availableFields})`
      })
    }

    // Check if rest time might be insufficient
    if (minimumTimeWithRest > totalAvailableMinutes) {
      const suggestedTeams = Math.floor(teamCount * 0.8)
      issues.push({
        type: 'WARNING',
        message: 'Teams might not get enough rest between matches.',
        suggestion: `Consider:\n` +
          `1. Adding more time slots\n` +
          `2. Reducing to ${suggestedTeams} teams\n` +
          `3. Adding more venues to allow concurrent matches`
      })
    }

    // Check if there are enough fields
    if (availableFields === 0) {
      issues.push({
        type: 'ERROR',
        message: 'No fields available.',
        suggestion: 'Add at least one venue with fields. For ' + 
          `${teamCount} teams, we recommend at least ${Math.ceil(teamCount/4)} fields.`
      })
    } else if (availableFields < Math.ceil(teamCount/6)) {
      issues.push({
        type: 'WARNING',
        message: 'Limited field availability might cause scheduling constraints.',
        suggestion: `Consider adding more fields. For ${teamCount} teams, ` +
          `${Math.ceil(teamCount/4)} fields would be ideal. Currently have ${availableFields}.`
      })
    }

    return {
      feasible: issues.filter(i => i.type === 'ERROR').length === 0,
      issues
    }
  }

  private calculateMaxPossibleTeams(totalMinutes: number, fields: number): number {
    const minMatchDuration = 15 // Minimum allowed match duration
    const minRestTime = 5 // Minimum rest time between matches
    
    // Calculate based on available time and fields
    const timePerMatch = minMatchDuration + minRestTime
    const possibleMatchSlots = Math.floor(totalMinutes / timePerMatch)
    const maxTeams = Math.min(
      Math.floor(Math.sqrt(possibleMatchSlots * 2)) * fields,
      32 // Hard maximum team limit
    )
    
    return Math.max(4, maxTeams) // Minimum 4 teams
  }

  private calculateMaxPossibleDuration(totalMinutes: number, teams: number): number {
    const minRestTime = 5
    const totalMatches = this.estimateNumberOfMatches({
      changes: { 
        teamCount: teams,
        matchDuration: 15 // Use minimum duration for calculation
      }
    })
    
    const maxDuration = Math.floor(
      (totalMinutes - (totalMatches * minRestTime)) / totalMatches
    )
    
    return Math.max(15, Math.min(90, maxDuration))
  }
} 