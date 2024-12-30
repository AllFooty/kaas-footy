import { useEffect } from 'react'
import type { Team } from '@/types/tournament'

interface TeamsStepProps {
  teams: Team[]
  onUpdate: (teams: Team[]) => void
}

export function TeamsStep({ teams, onUpdate }: TeamsStepProps) {
  useEffect(() => {
    console.log('Teams Configuration:', {
      totalTeams: teams.length,
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        abbreviation: team.abbreviation,
        primaryColor: team.primaryColor,
        secondaryColor: team.secondaryColor
      }))
    })
  }, [teams])
  // ... rest of component
} 