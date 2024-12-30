import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

export default function CreateTournamentLoading() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80">
        <nav className="flex items-center justify-between h-14 px-8 max-w-[1120px] mx-auto">
          <div className="flex items-center space-x-3 text-sm">
            <Skeleton className="h-9 w-20" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
        </nav>
        <div className="px-8 py-4 max-w-[1120px] mx-auto">
          <Progress value={10} className="h-2" />
        </div>
      </div>

      <div className="px-8 py-12 max-w-[1120px] mx-auto">
        <div className="space-y-8 max-w-3xl">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
} 