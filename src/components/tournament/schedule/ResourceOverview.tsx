"use client"

import { useMemo } from 'react'
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MapPin, Calendar, Clock, AlertTriangle } from "lucide-react"
import type { Tournament, Match } from '@/types/tournament'
import { parse } from 'date-fns'
import { getDurationInMinutes } from '@/lib/utils'

interface ResourceOverviewProps {
  tournament: Tournament
  matches: Record<string, Match[]>
}

export function ResourceOverview({ tournament, matches }: ResourceOverviewProps) {
  const stats = useMemo(() => {
    if (!tournament || !matches || Object.keys(matches).length === 0) {
      return {
        venueUsage: {},
        fieldUsage: {},
        timeSlotUtilization: 0,
        totalMatches: 0,
        matchDays: 0
      }
    }

    console.log('Resource Overview Analysis:', {
      tournament: {
        name: tournament.name,
        format: tournament.format,
        teams: tournament.teams.length,
        matchDuration: tournament.settings.matchDuration.regularTime,
        breakTime: tournament.vision.preferences.breakTime
      },
      availability: tournament.constraints.availability.map(day => ({
        date: day.date,
        totalMinutes: day.timeSlots.reduce((total, slot) => {
          const minutes = getDurationInMinutes(slot.start, slot.end)
          return total + minutes
        }, 0)
      })),
      matches: Object.entries(matches).map(([date, dayMatches]) => ({
        date,
        count: dayMatches.length,
        distribution: dayMatches.map(m => ({
          time: m.startTime,
          teams: `${m.homeTeam} vs ${m.awayTeam}`
        }))
      }))
    })
    
    const allMatches = Object.values(matches).flat()
    if (allMatches.length === 0) {
      return {
        venueUsage: {},
        fieldUsage: {},
        timeSlotUtilization: 0,
        totalMatches: 0,
        matchDays: 0
      }
    }
    
    const venueUsage: Record<string, number> = {}
    const fieldUsage: Record<string, number> = {}

    // Log comprehensive tournament configuration
    console.log('Tournament Configuration:', {
      // Basic Info
      name: tournament.name,
      description: tournament.description,
      ageGroup: tournament.basicInfo.ageGroup,
      competitionLevel: tournament.basicInfo.competitionLevel,
      format: tournament.format,
      status: tournament.status,
      
      // Teams
      teamCount: tournament.teams.length,
      teams: tournament.teams.map(t => ({
        name: t.name,
        id: t.id
      })),
      
      // Time Settings
      matchDuration: tournament.settings.matchDuration.regularTime,
      breakTime: tournament.vision.preferences.breakTime,
      
      // Priorities
      priorities: tournament.vision.priorities,
      
      // Venues & Availability
      venues: tournament.constraints.venues.map(v => ({
        name: v.name,
        fields: v.fields.map(f => f.name)
      })),
      availability: tournament.constraints.availability.map(day => ({
        date: day.date,
        isMatchDay: day.isMatchDay,
        timeSlots: day.timeSlots.map(slot => `${slot.start}-${slot.end}`)
      }))
    })

    // Calculate venue and field usage
    tournament.constraints.venues.forEach(venue => {
      venueUsage[venue.id] = 0
      venue.fields.forEach(field => {
        fieldUsage[field.id] = 0
      })
    })

    allMatches.forEach(match => {
      venueUsage[match.venueId]++
      fieldUsage[match.fieldId]++
    })

    // Calculate time slot utilization using minutes instead of slot count
    let totalAvailableMinutes = 0
    
    // Log each day's availability
    tournament.constraints.availability.forEach(day => {
      if (!day.isMatchDay) {
        console.log(`Skipping non-match day: ${day.date}`)
        return
      }
      
      let dayMinutes = 0
      day.timeSlots.forEach(slot => {
        const baseDate = new Date()
        const start = parse(slot.start, 'HH:mm', baseDate)
        const end = parse(slot.end, 'HH:mm', baseDate)
        const slotMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
        dayMinutes += slotMinutes
        
        console.log(`Slot ${slot.start}-${slot.end}:`, {
          start: start.toLocaleTimeString(),
          end: end.toLocaleTimeString(),
          minutes: slotMinutes
        })
      })
      
      console.log(`Day ${day.date} total minutes:`, dayMinutes)
      totalAvailableMinutes += dayMinutes
    })

    const matchDuration = tournament.settings.matchDuration.regularTime
    const breakTime = tournament.vision.preferences.breakTime ?? 10
    const totalUsedMinutes = allMatches.length * (matchDuration + breakTime)
    
    // Log detailed calculation steps
    console.log('Time utilization calculation:', {
      totalAvailableMinutes,
      matchCount: allMatches.length,
      minutesPerMatch: matchDuration + breakTime,
      totalUsedMinutes,
      rawUtilization: (totalUsedMinutes / totalAvailableMinutes) * 100
    })

    const utilization = Math.round((totalUsedMinutes / totalAvailableMinutes) * 1000) / 10

    // Enhanced match distribution logging
    console.log('Match Distribution:', Object.entries(matches).map(([date, dayMatches]) => ({
      date,
      matchCount: dayMatches.length,
      matches: dayMatches.map(m => ({
        time: m.startTime,
        home: m.homeTeam,
        away: m.awayTeam,
        venue: m.venueId,
        field: m.fieldId
      }))
    })))

    // Log final results with match distribution
    console.log('Final calculation:', {
      utilization: `${utilization}%`,
      matchesPerDay: Object.entries(matches).map(([date, dayMatches]) => ({
        date,
        matches: dayMatches.length,
        totalMinutes: dayMatches.length * (matchDuration + breakTime)
      })),
      availabilityBreakdown: tournament.constraints.availability
        .filter(day => day.isMatchDay)
        .map(day => ({
          date: day.date,
          slots: day.timeSlots.map(slot => `${slot.start}-${slot.end}`),
          totalHours: day.timeSlots.reduce((total, slot) => {
            const start = parse(slot.start, 'HH:mm', new Date())
            const end = parse(slot.end, 'HH:mm', new Date())
            return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          }, 0)
        }))
    })

    return {
      venueUsage,
      fieldUsage,
      timeSlotUtilization: utilization,
      totalMatches: allMatches.length,
      matchDays: Object.keys(matches).length,
    }
  }, [tournament, matches])

  return (
    <div className="space-y-6">
      {Object.keys(matches).length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <MapPin className="h-8 w-8 mx-auto text-muted-foreground" />
          <div className="text-muted-foreground">
            Resource overview will appear here after generating the schedule
          </div>
        </div>
      ) : (
        <>
          {/* Venue Usage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#0066CC]" />
              <h3 className="font-medium">Venue Usage</h3>
            </div>
            {tournament.constraints.venues.map(venue => (
              <TooltipProvider key={venue.id}>
                <Tooltip>
                  <TooltipTrigger className="w-full">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{venue.name}</span>
                        <span>{stats.venueUsage[venue.id]} matches</span>
                      </div>
                      <Progress 
                        value={stats.venueUsage[venue.id] / stats.totalMatches * 100} 
                        className="h-2"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{((stats.venueUsage[venue.id] / stats.totalMatches) * 100).toFixed(1)}% of total matches</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Time Distribution */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#0066CC]" />
              <h3 className="font-medium">Time Slot Utilization</h3>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Available Slots Used</span>
                      <span>{stats.timeSlotUtilization.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.timeSlotUtilization} className="h-2" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{stats.totalMatches} matches across {stats.matchDays} days</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Warnings */}
          {stats.timeSlotUtilization > 90 && (
            <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="h-4 w-4" />
              <span>High time slot utilization may reduce flexibility</span>
            </div>
          )}
        </>
      )}
    </div>
  )
} 