'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Trophy, Calendar, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { getTournaments } from "@/lib/services/tournament"
import { cn } from "@/lib/utils"
import { TournamentPreviewCard } from "@/components/tournament/TournamentPreviewCard"

export function TournamentHub() {
  const router = useRouter()
  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: getTournaments
  })

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FBFBFD] dark:bg-black px-8 py-8">
      <div className="max-w-[1120px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-medium text-[#1D1D1F] dark:text-white">
              Your Tournaments
            </h1>
            <p className="mt-2 text-[#424245] dark:text-[#86868B] text-lg">
              Create and manage your football tournaments
            </p>
          </div>
          <Button 
            onClick={() => router.push('/tournaments/create')}
            className="bg-[#0066CC] hover:bg-[#0077ED] text-white rounded-full px-8 h-12 text-base transition-all duration-200"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Tournament
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments?.map((tournament) => (
            <TournamentPreviewCard 
              key={tournament.id}
              tournament={tournament}
            />
          ))}
        </div>

        {tournaments?.length === 0 && (
          <Card className="rounded-2xl border-0 bg-white dark:bg-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
            <CardContent className="p-16 text-center">
              <Trophy className="h-16 w-16 text-[#0066CC] mx-auto mb-6" />
              <h3 className="text-2xl font-medium text-[#1D1D1F] dark:text-white mb-3">
                No Tournaments Yet
              </h3>
              <p className="text-lg text-[#424245] dark:text-[#86868B] mb-8 max-w-md mx-auto">
                Create your first tournament and start managing your competitions
              </p>
              <Button 
                onClick={() => router.push('/tournaments/create')}
                className="bg-[#0066CC] hover:bg-[#0077ED] text-white rounded-full px-8 h-12 text-base transition-all duration-200"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Tournament
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 