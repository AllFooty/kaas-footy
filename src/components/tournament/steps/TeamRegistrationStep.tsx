"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { ColorPicker } from "@/components/ui/color-picker"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import type { Tournament, Team } from '@/types/tournament'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TeamRegistrationStepProps {
  tournament: Tournament
  onUpdate: (tournament: Tournament) => void
}

type TeamFormData = Partial<Pick<Team, 'name' | 'logo' | 'primaryColor' | 'secondaryColor' | 'website'>>

export function TeamRegistrationStep({
  tournament,
  onUpdate,
}: TeamRegistrationStepProps) {
  const [teams, setTeams] = useState<Team[]>(tournament.teams)
  const [currentTeam, setCurrentTeam] = useState<TeamFormData>({})
  const [isClient, setIsClient] = useState(false)
  
  const handleAddTeam = () => {
    if (!currentTeam.name) return
    
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: currentTeam.name,
      logo: currentTeam.logo,
      primaryColor: currentTeam.primaryColor || '#000000',
      secondaryColor: currentTeam.secondaryColor || '#FFFFFF',
      website: currentTeam.website,
      status: 'CONFIRMED'
    }
    
    const updatedTeams = [...teams, newTeam]
    setTeams(updatedTeams)
    setCurrentTeam({})
    
    onUpdate({
      ...tournament,
      teams: updatedTeams
    })
  }

  const handleRemoveTeam = (teamId: string) => {
    const updatedTeams = teams.filter(team => team.id !== teamId)
    setTeams(updatedTeams)
    onUpdate({
      ...tournament,
      teams: updatedTeams
    })
  }

  const hasErrors = tournament.teams.length !== tournament.vision.targetTeamCount
  
  return (
    <div className="space-y-6">
      {hasErrors && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            Please register {tournament.vision.targetTeamCount} teams
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-8 max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Add New Team</h3>
              <div className="space-y-4">
                <div>
                  <Label>Team Name</Label>
                  <Input
                    value={currentTeam.name || ''}
                    onChange={e => setCurrentTeam({ ...currentTeam, name: e.target.value })}
                    placeholder="Enter team name"
                  />
                </div>
                
                <div>
                  <Label>Team Logo</Label>
                  <ImageUpload
                    value={currentTeam.logo}
                    onChange={url => setCurrentTeam({ ...currentTeam, logo: url })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Color</Label>
                    <ColorPicker
                      value={currentTeam.primaryColor || '#000000'}
                      onChange={color => setCurrentTeam({ ...currentTeam, primaryColor: color })}
                    />
                  </div>
                  <div>
                    <Label>Secondary Color</Label>
                    <ColorPicker
                      value={currentTeam.secondaryColor || '#FFFFFF'}
                      onChange={color => setCurrentTeam({ ...currentTeam, secondaryColor: color })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Website (Optional)</Label>
                  <Input
                    value={currentTeam.website || ''}
                    onChange={e => setCurrentTeam({ ...currentTeam, website: e.target.value })}
                    placeholder="https://"
                  />
                </div>
                
                <Button
                  onClick={handleAddTeam}
                  disabled={!currentTeam.name}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Registered Teams ({teams.length}/{tournament.vision.targetTeamCount})</h3>
              <div className="space-y-3">
                {teams.map(team => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {team.logo && (
                        <Image 
                          src={team.logo} 
                          alt={team.name} 
                          width={32} 
                          height={32} 
                          className="rounded-full" 
                        />
                      )}
                      <span>{team.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTeam(team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 