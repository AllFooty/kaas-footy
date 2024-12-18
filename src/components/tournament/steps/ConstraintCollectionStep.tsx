"use client"

import { useState } from 'react'
import { TournamentDuration } from './sections/TournamentDuration'
import { VenueConstraints } from './sections/VenueConstraints'
import { DailySchedule } from './sections/DailySchedule'
import { Alert } from '@/components/ui/alert'
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

  const validateConstraints = (): boolean => {
    const newErrors: string[] = []
    
    if (!data.duration.startDate || !data.duration.endDate) {
      newErrors.push('Please select both start and end dates')
    }

    if (data.venues.length === 0) {
      newErrors.push('Please add at least one venue')
    }

    if (data.venues.some(venue => !venue.name.trim())) {
      newErrors.push('All venues must have names')
    }

    if (!data.availability.some(a => a.isMatchDay)) {
      newErrors.push('Please enable at least one match day')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleUpdate = (newData: TournamentConstraints): void => {
    onUpdate(newData)
    validateConstraints()
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <ul className="list-disc pl-4">
            {errors.map((error, index) => (
              <li key={`error-${index}`}>{error}</li>
            ))}
          </ul>
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