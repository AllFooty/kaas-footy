"use client"

import { useState, useMemo, useEffect } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { MatchList } from '@/components/match/MatchList'
import { 
  format, 
  parse, 
  isEqual, 
  isSameMonth, 
  startOfToday,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addDays
} from 'date-fns'
import type { Tournament, Match } from '@/types/tournament'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ScheduleCalendarProps {
  tournament: Tournament
  matches: Record<string, Match[]>
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  view?: 'month' | 'week' | 'day'
}

export function ScheduleCalendar({
  tournament,
  matches,
  selectedDate,
  onDateSelect,
  view = 'month'
}: ScheduleCalendarProps) {
  const [selected, setSelected] = useState<Date | undefined>(selectedDate)
  const [displayDate, setDisplayDate] = useState(selectedDate || startOfToday())
  const today = startOfToday()

  // Convert string dates to Date objects for the calendar
  const matchDays = useMemo(() => {
    return Object.keys(matches).map(dateStr => 
      parse(dateStr, 'yyyy-MM-dd', new Date())
    )
  }, [matches])

  // Get dates to display based on view
  const displayDates = useMemo(() => {
    switch (view) {
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(displayDate),
          end: endOfWeek(displayDate)
        })
      case 'day':
        return [displayDate]
      default:
        return [] // Month view uses the Calendar component
    }
  }, [displayDate, view])

  // Navigation handlers
  const handlePrevious = () => {
    switch (view) {
      case 'week':
        setDisplayDate(prev => addDays(prev, -7))
        break
      case 'day':
        setDisplayDate(prev => addDays(prev, -1))
        break
      default:
        setDisplayDate(prev => addDays(prev, -30))
    }
  }

  const handleNext = () => {
    switch (view) {
      case 'week':
        setDisplayDate(prev => addDays(prev, 7))
        break
      case 'day':
        setDisplayDate(prev => addDays(prev, 1))
        break
      default:
        setDisplayDate(prev => addDays(prev, 30))
    }
  }

  // Get match count for a specific date
  const getMatchCount = (dateStr: string): number => {
    return matches[dateStr]?.length || 0
  }

  // Keep selected date in sync with prop
  useEffect(() => {
    setSelected(selectedDate)
  }, [selectedDate])

  const handleSelect = (date: Date | undefined) => {
    setSelected(date)
    if (date && onDateSelect) {
      onDateSelect(date)
    }
  }

  const getMatchesForDate = (date: Date): Match[] => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return matches[dateStr] || []
  }

  // Render different view modes
  const renderViewContent = () => {
    switch (view) {
      case 'week':
      case 'day':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-medium">
                {view === 'week' 
                  ? `Week of ${format(displayDate, 'MMMM d, yyyy')}`
                  : format(displayDate, 'MMMM d, yyyy')
                }
              </h3>
            </div>

            <div className="grid gap-4">
              {displayDates.map(date => (
                <Card key={date.toISOString()} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">
                      {format(date, 'EEEE, MMMM d')}
                    </h4>
                    <Badge variant="outline">
                      {getMatchesForDate(date).length} matches
                    </Badge>
                  </div>
                  <MatchList 
                    matches={getMatchesForDate(date)}
                    tournament={tournament}
                    compact={view === 'week'}
                  />
                </Card>
              ))}
            </div>
          </div>
        )

      default: // Month view
        return (
          <>
            <Card className="p-4">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={handleSelect}
                modifiers={{ hasMatch: matchDays }}
                modifiersClassNames={{
                  hasMatch: "has-matches"
                }}
                disabled={(date) => !matchDays.some(d => isEqual(d, date))}
                components={{
                  DayContent: (props) => {
                    const dateStr = format(props.date, 'yyyy-MM-dd')
                    const matchCount = getMatchCount(dateStr)
                    const isSelected = selected && isEqual(selected, props.date)
                    const isCurrentMonth = isSameMonth(props.date, props.displayMonth)
                    
                    return (
                      <div className={cn(
                        "relative w-full h-full p-2",
                        isSelected && "text-primary-foreground",
                        !isCurrentMonth && "text-muted-foreground opacity-50"
                      )}>
                        <time dateTime={dateStr} className="absolute top-1 left-1">
                          {props.date.getDate()}
                        </time>
                        {matchCount > 0 && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "absolute bottom-1 right-1 text-[10px] h-4 min-w-4 px-1",
                              isSelected && "bg-primary-foreground text-primary"
                            )}
                          >
                            {matchCount}
                          </Badge>
                        )}
                      </div>
                    )
                  }
                }}
              />
            </Card>

            {selected && (
              <Card className="p-4 mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">
                      Matches on {format(selected, 'MMMM d, yyyy')}
                    </h3>
                    <Badge variant="outline">
                      {getMatchesForDate(selected).length} matches
                    </Badge>
                  </div>
                  <MatchList 
                    matches={getMatchesForDate(selected)}
                    tournament={tournament}
                  />
                </ScrollArea>
              </Card>
            )}
          </>
        )
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      {renderViewContent()}
    </div>
  )
} 