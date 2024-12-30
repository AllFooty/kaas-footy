import { useEffect } from 'react'
import type { Venue } from '@/types/tournament'

interface VenueSettingsStepProps {
  venues: Venue[]
  onUpdate: (venues: Venue[]) => void
}

export function VenueSettingsStep({ venues, onUpdate }: VenueSettingsStepProps) {
  useEffect(() => {
    console.log('Venue Configuration:', {
      venues: venues.map(venue => ({
        id: venue.id,
        name: venue.name,
        fields: venue.fields.map(field => ({
          id: field.id,
          name: field.name
        }))
      }))
    })
  }, [venues])
  // ... rest of component
} 