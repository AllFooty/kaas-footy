"use client"

import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useCallback, useRef } from 'react'
import type { TournamentConstraints } from '@/types/tournament'

interface TournamentDurationProps {
  data: TournamentConstraints
  onUpdate: (updates: Partial<TournamentConstraints>) => void
}

export function TournamentDuration({ data, onUpdate }: TournamentDurationProps) {
  const previousValueRef = useRef(data.duration)

  const formatDate = useCallback((date: string | undefined) => {
    if (!date) return ''
    return format(new Date(date), "PPP")
  }, [])

  const handleStartDateSelect = useCallback((date: Date | null) => {
    if (!date) return

    const startDate = new Date(date)
    startDate.setHours(12, 0, 0, 0)
    
    const updates = {
      duration: {
        ...data.duration,
        startDate: startDate.toISOString(),
        endDate: data.duration.isSingleDay ? startDate.toISOString() : data.duration.endDate
      }
    }

    // Only update if values actually changed
    if (JSON.stringify(updates.duration) !== JSON.stringify(previousValueRef.current)) {
      previousValueRef.current = updates.duration
      onUpdate(updates)
    }
  }, [data.duration, onUpdate])

  const handleEndDateSelect = useCallback((date: Date | null) => {
    if (!date) return
    
    const endDate = new Date(date)
    endDate.setHours(12, 0, 0, 0)

    const updates = {
      duration: {
        ...data.duration,
        endDate: endDate.toISOString()
      }
    }

    if (JSON.stringify(updates.duration) !== JSON.stringify(previousValueRef.current)) {
      previousValueRef.current = updates.duration
      onUpdate(updates)
    }
  }, [data.duration, onUpdate])

  const handleSingleDayToggle = useCallback((checked: boolean) => {
    const updates = {
      duration: {
        ...data.duration,
        isSingleDay: checked,
        endDate: checked ? data.duration.startDate : data.duration.endDate
      }
    }

    if (JSON.stringify(updates.duration) !== JSON.stringify(previousValueRef.current)) {
      previousValueRef.current = updates.duration
      onUpdate(updates)
    }
  }, [data.duration, onUpdate])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-white">
          Tournament Duration
        </h2>
        <p className="text-sm text-[#424245] dark:text-[#86868B] mt-1">
          When will your tournament take place?
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={data.duration.isSingleDay}
          onCheckedChange={handleSingleDayToggle}
        />
        <Label>Single day tournament</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.duration.startDate ? formatDate(data.duration.startDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.duration.startDate ? new Date(data.duration.startDate) : undefined}
                onSelect={handleStartDateSelect}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  data.duration.isSingleDay ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={data.duration.isSingleDay}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.duration.endDate ? formatDate(data.duration.endDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            {!data.duration.isSingleDay && (
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.duration.endDate ? new Date(data.duration.endDate) : undefined}
                  onSelect={handleEndDateSelect}
                  disabled={(date) => !data.duration.startDate || date < new Date(data.duration.startDate)}
                  initialFocus
                />
              </PopoverContent>
            )}
          </Popover>
        </div>
      </div>
    </div>
  )
} 