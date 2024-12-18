'use client'

import { useQuery } from "@tanstack/react-query"
import { getTournament } from "@/lib/services/tournament"
import { TournamentDashboard } from "@/components/tournament/TournamentDashboard"

export default function DemoTournamentPage() {
  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', 'demo'],
    queryFn: () => getTournament('demo')
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <TournamentDashboard tournament={tournament} />
} 