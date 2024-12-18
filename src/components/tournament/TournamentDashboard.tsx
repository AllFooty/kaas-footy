'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Settings2, Trophy, Users, Calendar, Image as ImageIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { TournamentStandings } from "./tabs/TournamentStandings"
import { TournamentMatches } from "./tabs/TournamentMatches"
import { TournamentTeams } from "./tabs/TournamentTeams"
import type { Tournament } from "@/types"
import { useState } from 'react'
import { TournamentSettingsDialog } from "./TournamentSettingsDialog"
import { useToast } from "@/components/ui/use-toast"

interface TournamentDashboardProps {
  tournament: Tournament
}

export function TournamentDashboard({ tournament: initialTournament }: TournamentDashboardProps) {
  const [tournament, setTournament] = useState(initialTournament)
  const [showSettings, setShowSettings] = useState(false)
  const { toast } = useToast()
  
  const progress = tournament?.matches?.length ? 
    (tournament.matches.filter(m => m.status === 'COMPLETED').length / tournament.matches.length) * 100 
    : 0

  const handleSettingsUpdate = (updatedTournament: Tournament) => {
    setTournament(updatedTournament)
    setShowSettings(false)
    toast({
      title: "Settings updated",
      description: "Tournament settings have been saved successfully.",
      duration: 3000,
    })
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FBFBFD] dark:bg-black">
      {/* Cover Image Section */}
      <div className="relative h-[240px] bg-gradient-to-r from-[#1D1D1F] to-[#2D2D2D]">
        {tournament.coverImage ? (
          <img
            src={tournament.coverImage}
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/60">
              <ImageIcon className="h-8 w-8 mx-auto mb-2" />
              <span className="text-sm">No cover image</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/60 to-transparent" />
      </div>

      <div className="px-8 py-8 max-w-[1120px] mx-auto -mt-20 relative z-10 space-y-6">
        {/* Tournament Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-medium text-white">
              {tournament?.name}
            </h1>
            <div className={cn(
              "inline-flex px-3 py-1 rounded-full text-xs font-medium",
              tournament?.status === 'ACTIVE' 
                ? "bg-[#E8F5E9] text-[#1B5E20]" 
                : "bg-[#FFF3E0] text-[#E65100]"
            )}>
              {tournament?.status}
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              className="bg-white/90 hover:bg-white text-[#1D1D1F] rounded-full px-8 h-12 text-base transition-all duration-200"
            >
              <Eye className="mr-2 h-5 w-5" />
              View as Spectator
            </Button>
            <Button 
              variant="outline" 
              className="border-white/20 hover:border-white/40 text-white rounded-full px-8 h-12 text-base transition-all duration-200 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings2 className="mr-2 h-5 w-5" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden border-0 bg-white dark:bg-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
              <CardTitle className="text-base font-medium text-[#424245] dark:text-[#86868B]">Total Teams</CardTitle>
              <Users className="h-5 w-5 text-[#0066CC]" />
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="text-2xl font-medium text-[#1D1D1F] dark:text-white">
                {tournament?.teams.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 bg-white dark:bg-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
              <CardTitle className="text-base font-medium text-[#424245] dark:text-[#86868B]">Matches Played</CardTitle>
              <Calendar className="h-5 w-5 text-[#0066CC]" />
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="text-2xl font-medium text-[#1D1D1F] dark:text-white">
                {tournament?.matches.filter(m => m.status === 'COMPLETED').length || 0} / {tournament?.matches.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 bg-white dark:bg-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
              <CardTitle className="text-base font-medium text-[#424245] dark:text-[#86868B]">Tournament Progress</CardTitle>
              <Trophy className="h-5 w-5 text-[#0066CC]" />
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="text-2xl font-medium text-[#1D1D1F] dark:text-white mb-2">
                {Math.round(progress)}%
              </div>
              <Progress value={progress} className="h-2 bg-[#F5F5F7] dark:bg-[#2D2D2D]">
                <div className="h-full bg-[#0066CC] transition-all" style={{ width: `${progress}%` }} />
              </Progress>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="overflow-hidden border-0 bg-white dark:bg-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-2xl">
          <Tabs defaultValue="standings" className="w-full">
            <div className="border-b border-[#F5F5F7] dark:border-[#2D2D2D] px-6">
              <TabsList className="h-16">
                <TabsTrigger value="standings" className="text-base">Standings</TabsTrigger>
                <TabsTrigger value="matches" className="text-base">Matches</TabsTrigger>
                <TabsTrigger value="teams" className="text-base">Teams</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="standings">
              <TournamentStandings tournament={tournament} />
            </TabsContent>
            
            <TabsContent value="matches">
              <TournamentMatches tournament={tournament} />
            </TabsContent>
            
            <TabsContent value="teams">
              <TournamentTeams tournament={tournament} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <TournamentSettingsDialog 
        tournament={tournament}
        open={showSettings}
        onOpenChange={setShowSettings}
        onUpdate={handleSettingsUpdate}
      />
    </div>
  )
} 