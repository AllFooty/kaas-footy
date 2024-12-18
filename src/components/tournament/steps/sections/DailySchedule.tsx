"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { RefreshCw, Plus, Minus, ChevronDown, ChevronUp, Clock, AlertCircle } from "lucide-react"
import { format, eachDayOfInterval, isAfter, isBefore, parse } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { TournamentConstraints, DailyAvailability, TimeSlot } from '@/types/tournament'

interface DailyScheduleProps {
  data: TournamentConstraints
  onUpdate: (data: TournamentConstraints) => void
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { start: "09:00", end: "17:00" }
]

export function DailySchedule({ data, onUpdate }: DailyScheduleProps): JSX.Element {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [timeErrors, setTimeErrors] = useState<Record<string, string>>({})

  // Effect to regenerate schedule when venues/fields change
  useEffect(() => {
    if (data.duration.startDate && data.duration.endDate) {
      regenerateSchedule()
    }
  }, [data.venues, data.duration.startDate, data.duration.endDate])

  const regenerateSchedule = (): void => {
    if (!data.duration.startDate || !data.duration.endDate) return

    const start = new Date(data.duration.startDate)
    const end = new Date(data.duration.endDate)
    
    // Generate dates between start and end
    const dates = eachDayOfInterval({ start, end })
    
    const newAvailability: DailyAvailability[] = []

    dates.forEach(date => {
      data.venues.forEach(venue => {
        venue.fields.forEach(field => {
          newAvailability.push({
            date: date.toISOString(),
            timeSlots: [...DEFAULT_TIME_SLOTS],
            venueId: venue.id,
            fieldId: field.id,
            isMatchDay: true
          })
        })
      })
    })

    onUpdate({
      ...data,
      availability: newAvailability
    })
  }

  const validateTimeSlots = (slots: TimeSlot[]): boolean => {
    for (let i = 0; i < slots.length; i++) {
      const current = slots[i]
      const next = slots[i + 1]
      
      const currentStart = parse(current.start, "HH:mm", new Date())
      const currentEnd = parse(current.end, "HH:mm", new Date())
      
      if (isAfter(currentStart, currentEnd)) {
        return false
      }
      
      if (next) {
        const nextStart = parse(next.start, "HH:mm", new Date())
        if (isAfter(currentEnd, nextStart)) {
          return false
        }
      }
    }
    return true
  }

  const addTimeSlot = (availabilityItem: DailyAvailability): void => {
    const lastSlot = availabilityItem.timeSlots[availabilityItem.timeSlots.length - 1]
    const lastEndTime = parse(lastSlot.end, "HH:mm", new Date())
    const newStartTime = format(lastEndTime, "HH:mm")
    
    const newSlot: TimeSlot = {
      start: newStartTime,
      end: "23:59"
    }

    const newTimeSlots = [...availabilityItem.timeSlots, newSlot]
    
    if (!validateTimeSlots(newTimeSlots)) {
      setTimeErrors({
        ...timeErrors,
        [`${availabilityItem.date}-${availabilityItem.fieldId}`]: "Invalid time slot sequence"
      })
      return
    }

    setTimeErrors({
      ...timeErrors,
      [`${availabilityItem.date}-${availabilityItem.fieldId}`]: ""
    })

    onUpdate({
      ...data,
      availability: data.availability.map(a =>
        a.date === availabilityItem.date &&
        a.venueId === availabilityItem.venueId &&
        a.fieldId === availabilityItem.fieldId
          ? { ...a, timeSlots: newTimeSlots }
          : a
      )
    })
  }

  const removeTimeSlot = (
    availabilityItem: DailyAvailability,
    slotIndex: number
  ): void => {
    onUpdate({
      ...data,
      availability: data.availability.map(a =>
        a.date === availabilityItem.date &&
        a.venueId === availabilityItem.venueId &&
        a.fieldId === availabilityItem.fieldId
          ? {
              ...a,
              timeSlots: a.timeSlots.filter((_, index) => index !== slotIndex)
            }
          : a
      )
    })
  }

  const toggleMatchDay = (availabilityItem: DailyAvailability): void => {
    onUpdate({
      ...data,
      availability: data.availability.map(a =>
        a.date === availabilityItem.date &&
        a.venueId === availabilityItem.venueId &&
        a.fieldId === availabilityItem.fieldId
          ? { ...a, isMatchDay: !a.isMatchDay }
          : a
      )
    })
  }

  const updateTimeSlot = (
    availabilityItem: DailyAvailability,
    slotIndex: number,
    isStart: boolean,
    value: string
  ): void => {
    const newTimeSlots = availabilityItem.timeSlots.map((slot, idx) =>
      idx === slotIndex
        ? { ...slot, [isStart ? "start" : "end"]: value }
        : slot
    )

    if (!validateTimeSlots(newTimeSlots)) {
      setTimeErrors({
        ...timeErrors,
        [`${availabilityItem.date}-${availabilityItem.fieldId}`]: "Time slots must not overlap and end time must be after start time"
      })
      return
    }

    setTimeErrors({
      ...timeErrors,
      [`${availabilityItem.date}-${availabilityItem.fieldId}`]: ""
    })

    onUpdate({
      ...data,
      availability: data.availability.map(a =>
        a.date === availabilityItem.date &&
        a.venueId === availabilityItem.venueId &&
        a.fieldId === availabilityItem.fieldId
          ? { ...a, timeSlots: newTimeSlots }
          : a
      )
    })
  }

  // Group availability by date
  const availabilityByDate = data.availability.reduce((acc, item) => {
    const date = item.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, DailyAvailability[]>)

  const toggleDayExpansion = (date: string): void => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDays(newExpanded)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">
            Daily Schedule
          </h2>
          <p className="text-sm text-[#424245] dark:text-[#86868B] mt-1">
            Configure available times for each field
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={regenerateSchedule}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Schedule
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset all time slots to default (9 AM - 5 PM)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-4">
        {Object.entries(availabilityByDate).map(([date, items]) => (
          <Card key={date} className="p-4">
            <button
              className="w-full text-left flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => toggleDayExpansion(date)}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#0066CC]" />
                <h3 className="font-medium">
                  {format(new Date(date), "EEEE, MMMM d")}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#424245] dark:text-[#86868B]">
                  {items.filter(i => i.isMatchDay).length} of {items.length} fields available
                </span>
                {expandedDays.has(date) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {expandedDays.has(date) && (
              <div className="space-y-4 mt-4">
                {items.map(item => {
                  const venue = data.venues.find(v => v.id === item.venueId)
                  const field = venue?.fields.find(f => f.id === item.fieldId)
                  if (!venue || !field) return null

                  const errorKey = `${item.date}-${item.fieldId}`
                  const hasError = timeErrors[errorKey]

                  return (
                    <div
                      key={`${item.venueId}-${item.fieldId}`}
                      className={`p-4 rounded-lg transition-colors ${
                        item.isMatchDay
                          ? "bg-green-50 dark:bg-green-950"
                          : "bg-gray-50 dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-base">{venue.name} - {field.name}</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Switch
                                checked={item.isMatchDay}
                                onCheckedChange={() => toggleMatchDay(item)}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Toggle match day availability</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {hasError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {hasError}
                          </AlertDescription>
                        </Alert>
                      )}

                      {item.isMatchDay && (
                        <div className="space-y-4">
                          {item.timeSlots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-4 p-2 rounded-lg bg-white dark:bg-gray-900">
                              <div className="grid grid-cols-2 gap-4 flex-1">
                                <div className="space-y-2">
                                  <Label>Start Time</Label>
                                  <Input
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) =>
                                      updateTimeSlot(item, index, true, e.target.value)
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>End Time</Label>
                                  <Input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) =>
                                      updateTimeSlot(item, index, false, e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-end gap-2">
                                <TooltipProvider>
                                  {index === item.timeSlots.length - 1 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => addTimeSlot(item)}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Add another time slot</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {item.timeSlots.length > 1 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => removeTimeSlot(item, index)}
                                        >
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Remove this time slot</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </TooltipProvider>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-[#424245] dark:text-[#86868B] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Match Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span>No Matches</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Click on a day to expand/collapse time slots</span>
        </div>
      </div>
    </div>
  )
} 