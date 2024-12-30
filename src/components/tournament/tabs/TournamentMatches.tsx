'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import type { Match } from '@/types/tournament'

interface TournamentMatchesProps {
  matches: Match[]
  onMatchUpdate: (updatedMatch: Match) => void
}

export function TournamentMatches({ matches, onMatchUpdate }: TournamentMatchesProps) {
  const handleMatchUpdate = (match: Match) => {
    onMatchUpdate(match)
  }

  return (
    <div className="p-6 space-y-4">
      {matches.map((match) => (
        <Card key={match.id} className="p-4 border-0 bg-white dark:bg-[#1D1D1F] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{match.homeTeam}</span>
                </div>
                <span className="text-2xl font-semibold px-4">
                  {match.homeScore ?? '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{match.awayTeam}</span>
                </div>
                <span className="text-2xl font-semibold px-4">
                  {match.awayScore ?? '-'}
                </span>
              </div>
            </div>
            <div className="ml-8 flex flex-col items-end gap-2">
              <Badge 
                variant="secondary"
                className="rounded-full"
              >
                {match.status}
              </Badge>
              <span className="text-sm text-[#424245] dark:text-[#86868B]">
                {format(new Date(match.date), 'MMM d, HH:mm')}
              </span>
            </div>
          </div>
        </Card>
      ))}

      {matches.length === 0 && (
        <div className="text-center py-12 text-[#424245] dark:text-[#86868B]">
          No matches scheduled yet
        </div>
      )}
    </div>
  )
} 