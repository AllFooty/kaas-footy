import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { Tournament } from "@/types"

interface TournamentPreviewCardProps {
  tournament: Pick<Tournament, 'id' | 'name' | 'description' | 'status' | 'format' | 'teams' | 'matches' | 'createdAt'>
}

export function TournamentPreviewCard({ tournament }: TournamentPreviewCardProps) {
  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'ACTIVE':
        return "bg-[#E8F5E9] text-[#1B5E20] dark:bg-[#1B5E20]/20 dark:text-[#4CAF50]"
      case 'IN_PROGRESS':
        return "bg-[#E3F2FD] text-[#0D47A1] dark:bg-[#0D47A1]/20 dark:text-[#2196F3]"
      case 'COMPLETED':
        return "bg-[#EFEBE9] text-[#3E2723] dark:bg-[#3E2723]/20 dark:text-[#8D6E63]"
      default:
        return "bg-[#FFF3E0] text-[#E65100] dark:bg-[#E65100]/20 dark:text-[#FFB74D]"
    }
  }

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <Card className={cn(
        "group relative overflow-hidden border-0",
        "bg-white/80 dark:bg-[#1D1D1F]/80",
        "backdrop-blur-[2px]",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.02] hover:-translate-y-0.5",
        "hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)]",
        "dark:hover:shadow-[0_8px_24px_-8px_rgba(255,255,255,0.1)]"
      )}>
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-[#0066CC] to-[#0099FF] opacity-0 transition-opacity group-hover:opacity-100" />
        
        <CardHeader className="flex flex-row items-start justify-between p-6 pb-4">
          <div className="space-y-3">
            <h3 className="font-medium text-xl text-[#1D1D1F] dark:text-white">
              {tournament.name}
            </h3>
            <Badge 
              variant="secondary"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                getStatusColor(tournament.status)
              )}
            >
              {tournament.status}
            </Badge>
          </div>
          <ChevronRight className="h-5 w-5 text-[#86868B] transition-transform group-hover:translate-x-1" />
        </CardHeader>

        <CardContent className="p-6 pt-2">
          <p className="text-sm text-[#424245] dark:text-[#86868B] mb-6 line-clamp-2">
            {tournament.description}
          </p>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-[#424245] dark:text-[#86868B]">
              <Trophy className="h-4 w-4 text-[#0066CC]" />
              <span>{tournament.format}</span>
            </div>
            <div className="flex items-center gap-2 text-[#424245] dark:text-[#86868B]">
              <Users className="h-4 w-4 text-[#0066CC]" />
              <span>{tournament.teams?.length || 0} Teams</span>
            </div>
            <div className="flex items-center gap-2 text-[#424245] dark:text-[#86868B]">
              <Calendar className="h-4 w-4 text-[#0066CC]" />
              <span>{format(new Date(tournament.createdAt), 'MMM d')}</span>
            </div>
          </div>

          {tournament.status === 'IN_PROGRESS' && (
            <div className="mt-6 pt-4 border-t border-[#F5F5F7] dark:border-[#2D2D2D]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#424245] dark:text-[#86868B]">Progress</span>
                <span className="text-[#1D1D1F] dark:text-white font-medium">
                  {Math.round((tournament.matches?.filter(m => m.status === 'COMPLETED').length || 0) / 
                    (tournament.matches?.length || 1) * 100)}%
                </span>
              </div>
              <div className="h-1 bg-[#F5F5F7] dark:bg-[#2D2D2D] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0066CC] transition-all duration-500 ease-out rounded-full"
                  style={{ 
                    width: `${(tournament.matches?.filter(m => m.status === 'COMPLETED').length || 0) / 
                      (tournament.matches?.length || 1) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
} 