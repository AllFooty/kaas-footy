import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Settings2 } from 'lucide-react'

interface TournamentHeaderProps {
  name: string
  description?: string
  status: 'DRAFT' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED'
}

export function TournamentHeader({ name, description, status }: TournamentHeaderProps) {
  return (
    <div className="space-y-3 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{name}</h1>
          <Badge variant="secondary">{status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View as Spectator
          </Button>
          <Button variant="outline" size="sm">
            <Settings2 className="mr-2 h-4 w-4" />
            Actions
          </Button>
        </div>
      </div>
      {description && (
        <p className="text-muted-foreground text-sm max-w-2xl">
          {description}
        </p>
      )}
    </div>
  )
} 