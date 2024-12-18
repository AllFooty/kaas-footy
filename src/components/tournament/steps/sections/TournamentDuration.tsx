"use client"

import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { TournamentConstraints } from '@/types/tournament'

interface TournamentDurationProps {
  data: TournamentConstraints
  onUpdate: (data: TournamentConstraints) => void
}

export function TournamentDuration({ data, onUpdate }: TournamentDurationProps) {
  const handleDateChange = (date: Date | null, isStart: boolean) => {
    if (!date) return

    const formattedDate = date.toISOString()
    if (isStart) {
      onUpdate({
        ...data,
        duration: {
          ...data.duration,
          startDate: formattedDate,
          endDate: data.duration.isSingleDay ? formattedDate : data.duration.endDate
        }
      })
    } else {
      onUpdate({
        ...data,
        duration: {
          ...data.duration,
          endDate: formattedDate
        }
      })
    }
  }

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
          onCheckedChange={(checked) => {
            onUpdate({
              ...data,
              duration: {
                ...data.duration,
                isSingleDay: checked,
                endDate: checked ? data.duration.startDate : data.duration.endDate
              }
            })
          }}
        />
        <Label>Single day tournament</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.duration.startDate ? (
                  format(new Date(data.duration.startDate), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.duration.startDate ? new Date(data.duration.startDate) : undefined}
                onSelect={(date) => handleDateChange(date, true)}
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
                {data.duration.endDate ? (
                  format(new Date(data.duration.endDate), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            {!data.duration.isSingleDay && (
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.duration.endDate ? new Date(data.duration.endDate) : undefined}
                  onSelect={(date) => handleDateChange(date, false)}
                  disabled={(date) => {
                    const startDate = data.duration.startDate ? new Date(data.duration.startDate) : null
                    return !startDate || date < startDate
                  }}
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