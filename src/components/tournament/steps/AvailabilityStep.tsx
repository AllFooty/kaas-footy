import { useEffect } from 'react'
import type { DailyAvailability } from '@/types/tournament'
import { getDurationInMinutes } from '@/lib/utils'

interface AvailabilityStepProps {
  availability: DailyAvailability[]
  onUpdate: (availability: DailyAvailability[]) => void
}

export function AvailabilityStep({ availability, onUpdate }: AvailabilityStepProps) {
  useEffect(() => {
    console.log('Availability Configuration:', {
      days: availability.map(day => ({
        date: day.date,
        isMatchDay: day.isMatchDay,
        timeSlots: day.timeSlots.map(slot => ({
          start: slot.start,
          end: slot.end,
          duration: `${getDurationInMinutes(slot.start, slot.end)} minutes`
        }))
      }))
    })
  }, [availability])
  // ... rest of component
} 