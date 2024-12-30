"use client"

import { useMemo } from 'react'
import { Progress } from "@/components/ui/progress"
import type { Tournament, Match } from '@/types/tournament'
import { BarChart3 } from 'lucide-react'

interface MatchDistributionProps {
  tournament: Tournament
  matches: Record<string, Match[]>
}

export function MatchDistribution({ tournament, matches }: MatchDistributionProps) {
  const stats = useMemo(() => {
    const allMatches = Object.values(matches).flat()
    const matchesByDay = Object.entries(matches).map(([date, dayMatches]) => ({
      date,
      count: dayMatches.length
    }))
    
    const maxMatchesPerDay = matchesByDay.length > 0 
      ? Math.max(...matchesByDay.map(d => d.count))
      : 0
    const totalDays = matchesByDay.length || 1 // Prevent division by zero
    const averageMatchesPerDay = allMatches.length / totalDays

    return {
      matchesByDay,
      maxMatchesPerDay,
      averageMatchesPerDay: averageMatchesPerDay || 0 // Handle NaN
    }
  }, [matches])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Match Distribution</h3>
        {stats.matchesByDay.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground" />
            <div className="text-muted-foreground">
              Match distribution will be shown here after schedule generation
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.matchesByDay.map(({ date, count }) => (
              <div key={date} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{new Date(date).toLocaleDateString()}</span>
                  <span>{count} matches</span>
                </div>
                <Progress 
                  value={(count / stats.maxMatchesPerDay) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <div>Average: {stats.averageMatchesPerDay.toFixed(1)} matches/day</div>
        <div>Maximum: {stats.maxMatchesPerDay} matches/day</div>
      </div>
    </div>
  )
} 