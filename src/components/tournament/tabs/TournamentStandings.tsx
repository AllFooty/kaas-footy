'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Team, Match, TournamentFormat, TournamentFormatSettings } from '@/types/tournament'

interface TournamentStandingsProps {
  teams: Team[]
  matches: Match[]
  format: TournamentFormat
  settings: TournamentFormatSettings
}

export function TournamentStandings({ teams, matches, format, settings }: TournamentStandingsProps) {
  const sortedTeams = [...teams].sort((a, b) => b.stats.points - a.stats.points)

  return (
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow className="border-[#F5F5F7] dark:border-[#2D2D2D]">
            <TableHead className="w-[100px] text-[#424245] dark:text-[#86868B]">Pos</TableHead>
            <TableHead className="text-[#424245] dark:text-[#86868B]">Team</TableHead>
            <TableHead className="text-center text-[#424245] dark:text-[#86868B]">P</TableHead>
            <TableHead className="text-center text-[#424245] dark:text-[#86868B]">W</TableHead>
            <TableHead className="text-center text-[#424245] dark:text-[#86868B]">D</TableHead>
            <TableHead className="text-center text-[#424245] dark:text-[#86868B]">L</TableHead>
            <TableHead className="text-center text-[#424245] dark:text-[#86868B]">GF</TableHead>
            <TableHead className="text-center text-[#424245] dark:text-[#86868B]">GA</TableHead>
            <TableHead className="text-center text-[#424245] dark:text-[#86868B]">GD</TableHead>
            <TableHead className="text-center text-[#424245] dark:text-[#86868B]">Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTeams.map((team, index) => (
            <TableRow key={team.id} className="border-[#F5F5F7] dark:border-[#2D2D2D]">
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: team.color }}
                  />
                  {team.name}
                </div>
              </TableCell>
              <TableCell className="text-center">{team.stats.played}</TableCell>
              <TableCell className="text-center">{team.stats.won}</TableCell>
              <TableCell className="text-center">{team.stats.drawn}</TableCell>
              <TableCell className="text-center">{team.stats.lost}</TableCell>
              <TableCell className="text-center">{team.stats.goalsFor}</TableCell>
              <TableCell className="text-center">{team.stats.goalsAgainst}</TableCell>
              <TableCell className="text-center">{team.stats.goalDifference}</TableCell>
              <TableCell className="text-center font-medium">{team.stats.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 