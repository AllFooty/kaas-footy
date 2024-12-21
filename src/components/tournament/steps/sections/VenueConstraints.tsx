"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, MapPin, Gamepad2, Info } from "lucide-react"
import { v4 as uuidv4 } from 'uuid'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import type { TournamentConstraints, Venue, Field } from '@/types/tournament'

interface VenueConstraintsProps {
  data: TournamentConstraints
  onUpdate: (data: TournamentConstraints) => void
}

export function VenueConstraints({ data, onUpdate }: VenueConstraintsProps): JSX.Element {
  const handleAddVenue = (): void => {
    const newVenue: Venue = {
      id: uuidv4(),
      name: '',
      fields: [{
        id: uuidv4(),
        name: 'Field 1'
      }]
    }

    const updatedData = {
      ...data,
      venues: [...data.venues, newVenue]
    }
    
    if (data.duration.startDate && data.duration.endDate) {
      const start = new Date(data.duration.startDate)
      const end = new Date(data.duration.endDate)
      
      for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
        newVenue.fields.forEach(field => {
          updatedData.availability.push({
            date: date.toISOString(),
            timeSlots: [{ start: &quot;09:00&quot;, end: "17:00" }],
            venueId: newVenue.id,
            fieldId: field.id,
            isMatchDay: true
          })
        })
      }
    }

    onUpdate(updatedData)
  }

  const handleAddField = (venueId: string): void => {
    const venue = data.venues.find(v => v.id === venueId)
    if (!venue) return

    const newField: Field = {
      id: uuidv4(),
      name: `Field ${venue.fields.length + 1}`
    }

    const updatedData = {
      ...data,
      venues: data.venues.map(v => 
        v.id === venueId 
          ? { ...v, fields: [...v.fields, newField] }
          : v
      )
    }

    if (data.duration.startDate && data.duration.endDate) {
      const start = new Date(data.duration.startDate)
      const end = new Date(data.duration.endDate)
      
      for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
        updatedData.availability.push({
          date: date.toISOString(),
          timeSlots: [{ start: &quot;09:00&quot;, end: "17:00" }],
          venueId: venueId,
          fieldId: newField.id,
          isMatchDay: true
        })
      }
    }

    onUpdate(updatedData)
  }

  const handleRemoveField = (venueId: string, fieldId: string): void => {
    const venue = data.venues.find(v => v.id === venueId)
    if (!venue || venue.fields.length <= 1) return

    onUpdate({
      ...data,
      venues: data.venues.map(v => 
        v.id === venueId 
          ? { ...v, fields: v.fields.filter(f => f.id !== fieldId) }
          : v
      ),
      availability: data.availability.filter(a => a.fieldId !== fieldId)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">
            Venue Constraints
          </h2>
          <p className='text-sm text-[#424245] dark:text-[#86868B] mt-1'>
            Configure where matches will be played
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handleAddVenue}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Add New Venue
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a new location where matches will be played</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-6">
        {data.venues.map((venue, venueIndex) => (
          <Card key={venue.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-[#0066CC]" />
                Venue {venueIndex + 1}
              </CardTitle>
              <CardDescription>
                Each venue represents a distinct location where matches can be played
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`venue-${venue.id}`}>Venue Name</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-[#424245] dark:text-[#86868B]" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter a unique name for this venue (e.g., "Main Stadium", "Training Ground")</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id={`venue-${venue.id}`}
                  placeholder="Enter venue name"
                  value={venue.name}
                  onChange={(e) => {
                    onUpdate({
                      ...data,
                      venues: data.venues.map(v =>
                        v.id === venue.id
                          ? { ...v, name: e.target.value }
                          : v
                      )
                    })
                  }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-[#0066CC]" />
                    <Label className="text-base font-medium">Playing Fields</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-[#424245] dark:text-[#86868B]" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add multiple fields if this venue has more than one playing area</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddField(venue.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Field
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add another playing field to this venue</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="grid gap-3 pl-4 border-l-2 border-[#F5F5F7] dark:border-[#2D2D2D]">
                  {venue.fields.map((field) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`field-${field.id}`}>Field Name</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-[#424245] dark:text-[#86868B]" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Give this field a distinct name (e.g., "Main Pitch", "Field 2")</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id={`field-${field.id}`}
                          value={field.name}
                          onChange={(e) => {
                            onUpdate({
                              ...data,
                              venues: data.venues.map(v =>
                                v.id === venue.id
                                  ? {
                                      ...v,
                                      fields: v.fields.map(f =>
                                        f.id === field.id
                                          ? { ...f, name: e.target.value }
                                          : f
                                      )
                                    }
                                  : v
                              )
                            })
                          }}
                        />
                      </div>
                      {venue.fields.length > 1 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleRemoveField(venue.id, field.id)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remove this field</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 