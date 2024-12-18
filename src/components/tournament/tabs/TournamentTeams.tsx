'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Users } from "lucide-react"
import type { Tournament } from "@/types"

interface TournamentTeamsProps {
  tournament: Tournament
}

export function TournamentTeams({ tournament }: TournamentTeamsProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-[#1D1D1F] dark:text-white">
          Participating Teams
        </h2>
        <Button 
          className="bg-[#0066CC] hover:bg-[#0077ED] text-white rounded-full px-6 h-10 text-sm"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Team
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tournament.teams.map((team) => (
          <Card key={team.id} className="p-4 border-0 bg-white dark:bg-[#1D1D1F] shadow-sm">
            <div className="flex items-center gap-4">
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: team.color }}
              >
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-[#1D1D1F] dark:text-white">
                  {team.name}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-[#424245] dark:text-[#86868B]">
                  <span>P: {team.stats.played}</span>
                  <span>W: {team.stats.won}</span>
                  <span>D: {team.stats.drawn}</span>
                  <span>L: {team.stats.lost}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {tournament.teams.length === 0 && (
        <div className="text-center py-12 text-[#424245] dark:text-[#86868B]">
          No teams added yet
        </div>
      )}
    </div>
  )
} 