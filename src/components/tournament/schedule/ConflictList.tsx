"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight } from "lucide-react"
import type { ConflictReport } from '@/lib/services/scheduleGenerator'

interface ConflictListProps {
  conflicts: ConflictReport[]
  onResolve: (conflictId: string) => void
}

export function ConflictList({ conflicts, onResolve }: ConflictListProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium mb-4">Schedule Conflicts</h3>
      
      {conflicts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No conflicts detected in the current schedule
        </div>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conflict, index) => (
            <Alert 
              key={index}
              variant="destructive" 
              className="flex items-start justify-between"
            >
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 mt-1" />
                <div>
                  <AlertDescription className="font-medium">
                    {conflict.description}
                  </AlertDescription>
                  <div className="mt-2 text-sm space-y-1">
                    {conflict.matches.map(match => (
                      <div key={match.id}>
                        {match.homeTeam} vs {match.awayTeam} ({new Date(match.date).toLocaleDateString()})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onResolve(conflict.matches[0].id)}
                className="ml-4"
              >
                Resolve
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Alert>
          ))}
        </div>
      )}
    </div>
  )
} 