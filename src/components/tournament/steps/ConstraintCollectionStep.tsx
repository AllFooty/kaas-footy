"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { TournamentDuration } from './sections/TournamentDuration'
import { VenueConstraints } from './sections/VenueConstraints'
import DailySchedule from './sections/DailySchedule'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { TournamentConstraints } from '@/types/tournament'

interface ConstraintCollectionStepProps {
  data: TournamentConstraints
  onUpdate: (data: TournamentConstraints) => void
}

export function ConstraintCollectionStep({ 
  data, 
  onUpdate 
}: ConstraintCollectionStepProps): JSX.Element {
  const [errors, setErrors] = useState<string[]>([])
  const previousDataRef = useRef(data)

  const handleUpdate = useCallback((updates: Partial<TournamentConstraints>) => {
    const updatedData = {
      ...data,
      ...updates
    }

    // Prevent unnecessary updates by comparing with previous data
    if (JSON.stringify(updatedData) !== JSON.stringify(previousDataRef.current)) {
      previousDataRef.current = updatedData
      onUpdate(updatedData)
    }
  }, [data, onUpdate])

  // Validate constraints whenever data changes
  useEffect(() => {
    const newErrors: string[] = []
    // Add your validation logic here
    setErrors(newErrors)
  }, [data])

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <TournamentDuration
          data={data}
          onUpdate={handleUpdate}
        />
      </Card>

      <Card className="p-6">
        <VenueConstraints
          data={data}
          onUpdate={handleUpdate}
        />
      </Card>

      <Card className="p-6">
        <DailySchedule
          data={data}
          onUpdate={handleUpdate}
        />
      </Card>
    </div>
  )
} 