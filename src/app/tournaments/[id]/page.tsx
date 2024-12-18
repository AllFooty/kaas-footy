'use client'

import { useQuery } from "@tanstack/react-query"
import { getTournament } from "@/lib/services/tournament"
import { TournamentDashboard } from "@/components/tournament/TournamentDashboard"

interface PageProps {
  params: {
    id: string
  }
}

export default function TournamentPage({ params }: PageProps) {
  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', params.id],
    queryFn: () => getTournament(params.id)
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <TournamentDashboard tournament={tournament} />
} 