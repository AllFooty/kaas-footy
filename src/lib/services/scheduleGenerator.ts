import { v4 as uuidv4 } from 'uuid'
import { addMinutes, parse, format, parseISO } from 'date-fns'
import type { 
  Tournament, 
  Match, 
  TimeSlot, 
  DailyAvailability,
  TournamentFormat,
  Team,
  Venue,
  Field
} from '@/types/tournament'

interface ScheduleSlot {
  date: string
  timeSlot: TimeSlot
  venueId: string
  fieldId: string
}

export interface ConflictReport {
  type: 'VENUE_OVERLAP' | 'TEAM_OVERLAP' | 'REST_TIME' | 'PREFERRED_TIME'
  description: string
  matches: Match[]
}

export class ScheduleGenerator {
  private tournament: Tournament
  private availableSlots: ScheduleSlot[] = []
  private matches: Record<string, Match[]> = {}
  private conflicts: ConflictReport[] = []
  private logger = {
    info: (message: string, data?: any) => {
      console.log(`[Schedule Generator] ${message}`, data)
    },
    warn: (message: string, data?: any) => {
      console.warn(`[Schedule Generator] ${message}`, data)
    },
    error: (message: string, data?: any) => {
      console.error(`[Schedule Generator] ${message}`, data)
    }
  }

  constructor(tournament: Tournament) {
    this.tournament = tournament
    
    // Log tournament basic details
    console.log('Tournament Configuration:', {
      name: tournament.name,
      description: tournament.description,
      ageGroup: tournament.basicInfo.ageGroup,
      competitionLevel: tournament.basicInfo.competitionLevel,
      format: tournament.format,
      formatSettings: {
        roundRobinType: tournament.settings.league?.roundRobinType,
      }
    })

    // Log teams and timing settings
    console.log('Tournament Settings:', {
      teamCount: tournament.teams.length,
      teams: tournament.teams.map(t => t.name),
      matchDuration: tournament.settings.matchDuration.regularTime,
      breakTime: tournament.vision.preferences.breakTime,
      priorities: tournament.vision.priorities
    })

    // Log venue and availability details
    console.log('Venue Configuration:', {
      venues: tournament.constraints.venues.map(venue => ({
        name: venue.name,
        fieldCount: venue.fields.length,
        fields: venue.fields.map(f => f.name)
      }))
    })

    console.log('Availability Configuration:', {
      dates: tournament.constraints.availability.map(day => ({
        date: day.date,
        isMatchDay: day.isMatchDay,
        timeSlots: day.timeSlots.map(slot => ({
          start: slot.start,
          end: slot.end,
          duration: this.calculateSlotDuration(slot)
        }))
      }))
    })

    this.initializeAvailableSlots()
  }

  private calculateSlotDuration(slot: TimeSlot): number {
    const start = parse(slot.start, 'HH:mm', new Date())
    const end = parse(slot.end, 'HH:mm', new Date())
    return (end.getTime() - start.getTime()) / (1000 * 60)
  }

  private initializeAvailableSlots(): void {
    if (!this.tournament.constraints?.availability?.length) {
      console.error('No availability data found')
      return
    }

    this.availableSlots = []
    const matchDuration = this.tournament.settings.matchDuration.regularTime
    const breakTime = this.tournament.vision.preferences.breakTime ?? 10

    console.log('Initializing slots with:', {
      matchDuration,
      breakTime,
      totalDuration: matchDuration + breakTime
    })

    // Process each day's availability
    this.tournament.constraints.availability.forEach(day => {
      if (!day.isMatchDay) {
        console.log(`Skipping non-match day: ${day.date}`)
        return
      }

      day.timeSlots.forEach(timeSlot => {
        const slotStart = parse(timeSlot.start, 'HH:mm', new Date())
        const slotEnd = parse(timeSlot.end, 'HH:mm', new Date())
        const totalMinutes = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60)
        const matchesPerSlot = Math.floor(totalMinutes / (matchDuration + breakTime))

        console.log(`Processing time slot for ${day.date}:`, {
          start: timeSlot.start,
          end: timeSlot.end,
          totalMinutes,
          possibleMatches: matchesPerSlot
        })

        // Create multiple slots for each possible match time
        for (let i = 0; i < matchesPerSlot; i++) {
          const matchStartTime = addMinutes(slotStart, i * (matchDuration + breakTime))
          const matchEndTime = addMinutes(matchStartTime, matchDuration)

          if (matchEndTime <= slotEnd) {
            this.availableSlots.push({
              date: day.date,
              timeSlot: {
                start: format(matchStartTime, 'HH:mm'),
                end: format(matchEndTime, 'HH:mm')
              },
              venueId: day.venueId,
              fieldId: day.fieldId
            })
          }
        }
      })
    })

    console.log('Available slots summary:', {
      totalSlots: this.availableSlots.length,
      daysWithSlots: new Set(this.availableSlots.map(slot => slot.date)).size,
      slotsPerDay: Object.groupBy(this.availableSlots, slot => slot.date)
    })
  }

  private generateTeamPairings(): [Team, Team][] {
    if (!this.tournament.teams || this.tournament.teams.length < 2) {
      console.error('Not enough teams to generate pairings')
      return []
    }

    const teams = this.tournament.teams
    let pairings: [Team, Team][] = []
    
    switch(this.tournament.format) {
      case 'LEAGUE':
        console.log('League settings:', {
          settings: this.tournament.settings,
          roundRobinType: this.tournament.settings.league?.roundRobinType,
          isDoubleRoundRobin: this.tournament.settings.league?.roundRobinType === 'DOUBLE'
        })
        
        const isDoubleRoundRobin = this.tournament.settings.league?.roundRobinType === 'DOUBLE'
        
        // Generate single round-robin pairings
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            pairings.push([teams[i], teams[j]])
          }
        }
        
        // For double round-robin, add reverse fixtures
        if (isDoubleRoundRobin) {
          const reverseFixtures = pairings.map(([home, away]) => [away, home] as [Team, Team])
          pairings = [...pairings, ...reverseFixtures]
        }
        break
        
      case 'KNOCKOUT':
        // Generate base pairings
        for (let i = 0; i < teams.length; i += 2) {
          if (i + 1 < teams.length) {
            pairings.push([teams[i], teams[i + 1]])
          }
        }
        
        // For two-legged ties, add reverse fixtures
        if (this.tournament.settings.knockout?.legs === 'DOUBLE') {
          const reverseFixtures = pairings.map(([home, away]) => [away, home] as [Team, Team])
          pairings = [...pairings, ...reverseFixtures]
        }
        break
        
      // Add other format cases here
      default:
        console.error('Unsupported tournament format:', this.tournament.format)
    }
    
    return pairings
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private findAvailableSlot(homeTeam: Team, awayTeam: Team): ScheduleSlot | null {
    // First try to find a slot that maintains optimal rest time
    const minRestTime = this.tournament.vision.preferences.breakTime ?? 15 // minutes
    const matchDuration = this.tournament.settings.matchDuration.regularTime

    // Sort slots chronologically
    const sortedSlots = [...this.availableSlots].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.timeSlot.start}`)
      const dateB = new Date(`${b.date}T${b.timeSlot.start}`)
      return dateA.getTime() - dateB.getTime()
    })

    // Try to find a slot that respects rest time
    return sortedSlots.find(slot => {
      // Check if teams have any matches on this day
      const matchesOnDay = this.matches[slot.date] || []
      const teamMatches = matchesOnDay.filter(m => 
        m.homeTeam.id === homeTeam.id || 
        m.homeTeam.id === awayTeam.id ||
        m.awayTeam.id === homeTeam.id || 
        m.awayTeam.id === awayTeam.id
      )

      // If teams already have a match on this day, skip this slot
      if (teamMatches.length > 0) {
        return false
      }

      // Check if venue is available
      const venueConflict = matchesOnDay.some(m => 
        m.venueId === slot.venueId && 
        m.fieldId === slot.fieldId &&
        this.timesOverlap(m.startTime, `${slot.date}T${slot.timeSlot.start}`, matchDuration)
      )

      return !venueConflict
    }) || null
  }

  private validateSchedule(): void {
    this.conflicts = []
    const matchList = Object.values(this.matches).flat()
    
    // Check for venue overlaps
    matchList.forEach(match => {
      const overlappingMatches = matchList.filter(m => 
        m.id !== match.id &&
        m.date === match.date &&
        m.venueId === match.venueId &&
        m.fieldId === match.fieldId &&
        this.timesOverlap(m.startTime, match.startTime)
      )
      
      if (overlappingMatches.length > 0) {
        this.conflicts.push({
          type: 'VENUE_OVERLAP',
          description: `Multiple matches scheduled at the same venue and time`,
          matches: [match, ...overlappingMatches]
        })
      }
    })
    
    // Add more validation as needed
  }

  private timesOverlap(time1: string | Date, time2: string | Date, duration?: number): boolean {
    const t1 = time1 instanceof Date ? time1 : parse(time1, 'HH:mm', new Date())
    const t2 = time2 instanceof Date ? time2 : parse(time2, 'HH:mm', new Date())
    const matchDuration = duration ?? this.tournament.settings.matchDuration.regularTime
    
    const t1End = addMinutes(t1, matchDuration)
    const t2End = addMinutes(t2, matchDuration)
    
    return (t1 <= t2 && t1End > t2) || (t2 <= t1 && t2End > t1)
  }

  private calculateTimeSlotUtilization(): number {
    const totalAvailableMinutes = this.tournament.constraints.availability.reduce((total, day) => {
      if (!day.isMatchDay) return total
      
      const dayMinutes = day.timeSlots.reduce((dayTotal, slot) => {
        const start = parse(slot.start, 'HH:mm', new Date())
        const end = parse(slot.end, 'HH:mm', new Date())
        const slotMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
        return dayTotal + slotMinutes
      }, 0)

      console.log(`Available minutes for ${day.date}:`, dayMinutes)
      return total + dayMinutes
    }, 0)

    const matchDuration = this.tournament.settings.matchDuration.regularTime
    const breakTime = this.tournament.vision.preferences.breakTime ?? 10
    const totalUsedMinutes = Object.values(this.matches)
      .flat()
      .length * (matchDuration + breakTime)

    const utilization = Math.round((totalUsedMinutes / totalAvailableMinutes) * 1000) / 10

    console.log('Utilization calculation:', {
      totalAvailableMinutes,
      totalUsedMinutes,
      matchCount: Object.values(this.matches).flat().length,
      minutesPerMatch: matchDuration + breakTime,
      utilization: `${utilization}%`,
      matchesPerDay: Object.entries(this.matches).map(([date, matches]) => ({
        date,
        matches: matches.length
      }))
    })

    return utilization
  }

  private calculateDailyUtilization(): Record<string, number> {
    const dailyUtilization: Record<string, number> = {}
    
    this.tournament.constraints.availability.forEach(day => {
      if (!day.isMatchDay) return
      
      // Calculate available minutes for this day
      const availableMinutes = day.timeSlots.reduce((total, slot) => {
        const start = parse(slot.start, 'HH:mm', new Date())
        const end = parse(slot.end, 'HH:mm', new Date())
        return total + (end.getTime() - start.getTime()) / (1000 * 60)
      }, 0)
      
      // Calculate used minutes for this day
      const matchesOnDay = this.matches[day.date] || []
      const usedMinutes = matchesOnDay.length * 
        (this.tournament.settings.matchDuration.regularTime + 
         (this.tournament.vision.preferences.breakTime ?? 10))
      
      // Calculate and round utilization to 1 decimal place
      dailyUtilization[day.date] = Math.round((usedMinutes / availableMinutes) * 1000) / 10
    })
    
    return dailyUtilization
  }

  public generateSchedule(): {
    matches: Record<string, Match[]>
    conflicts: ConflictReport[]
    utilization: number
  } {
    this.matches = {}
    this.conflicts = []

    if (!this.tournament.teams?.length) {
      console.error('No teams available for scheduling')
      return { matches: {}, conflicts: [], utilization: 0 }
    }

    if (this.availableSlots.length === 0) {
      console.error('No available slots for scheduling')
      return { matches: {}, conflicts: [], utilization: 0 }
    }

    const pairings = this.generateTeamPairings()
    
    pairings.forEach(([homeTeam, awayTeam]) => {
      const slot = this.findAvailableSlot(homeTeam, awayTeam)
      if (!slot) {
        this.conflicts.push({
          type: 'PREFERRED_TIME',
          description: `Could not find suitable slot for ${homeTeam.name} vs ${awayTeam.name}`,
          matches: []
        })
        return
      }
      
      const venue = this.tournament.constraints.venues
        .find(v => v.id === slot.venueId)
      
      if (!venue) {
        console.error(`Venue not found for id: ${slot.venueId}`)
        return
      }
      
      const field = venue.fields.find(f => f.id === slot.fieldId)
      if (!field) {
        console.error(`Field not found for id: ${slot.fieldId}`)
        return
      }
      
      const match = this.generateMatch([homeTeam, awayTeam], slot.date, slot.timeSlot)
      
      if (!this.matches[slot.date]) {
        this.matches[slot.date] = []
      }
      this.matches[slot.date].push(match)
      
      // Remove used slot
      this.availableSlots = this.availableSlots.filter(s => 
        s.date !== slot.date || 
        s.timeSlot.start !== slot.timeSlot.start || 
        s.venueId !== slot.venueId || 
        s.fieldId !== slot.fieldId
      )
    })
    
    this.validateSchedule()
    
    const utilization = this.calculateTimeSlotUtilization()
    
    console.log('Generated matches:', this.matches)
    
    this.logger.info('Schedule generation complete', {
      totalMatches: Object.values(this.matches).flat().length,
      distribution: Object.entries(this.matches).map(([date, matches]) => ({
        date,
        matches: matches.length
      })),
      conflicts: this.conflicts
    })

    // Format dates consistently
    const formattedMatches = Object.entries(this.matches).reduce((acc, [date, matchList]) => {
      // Ensure consistent date format (yyyy-MM-dd)
      const parsedDate = parseISO(date)
      const formattedDate = format(parsedDate, 'yyyy-MM-dd')
      
      acc[formattedDate] = matchList.map(match => ({
        ...match,
        date: formattedDate,
        startTime: `${formattedDate}T${match.startTime.split('T')[1]}`
      }))
      return acc
    }, {} as Record<string, Match[]>)

    console.log('Formatted matches:', formattedMatches)

    return {
      matches: formattedMatches,
      conflicts: this.conflicts,
      utilization: this.calculateTimeSlotUtilization()
    }
  }

  generateMatch(teams: [Team, Team], date: string, slot: TimeSlot): Match {
    try {
      // Ensure date is in correct format
      const formattedDate = format(new Date(date), 'yyyy-MM-dd')
      const startTime = `${formattedDate}T${slot.start}`

      // Use first available venue and field
      const venue = this.tournament.constraints.venues[0]
      const field = venue.fields[0]

      // For knockout tournaments, check if this is a second leg
      const isSecondLeg = this.tournament.settings.knockout?.legs === 'DOUBLE' &&
        this.matches[formattedDate]?.some(m => 
          m.homeTeam.id === teams[1].id && 
          m.awayTeam.id === teams[0].id
        )

      return {
        id: crypto.randomUUID(),
        homeTeam: teams[0],
        awayTeam: teams[1],
        startTime,
        date: formattedDate,
        venue: venue.name,
        venueId: venue.id,
        fieldId: field.id,
        round: 1,
        status: 'SCHEDULED',
        leg: this.tournament.settings.knockout?.legs === 'DOUBLE' 
          ? (isSecondLeg ? 2 : 1)
          : undefined,
      }
    } catch (error) {
      console.error('Error generating match:', error)
      throw error
    }
  }
} 