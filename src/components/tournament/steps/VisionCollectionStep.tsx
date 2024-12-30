import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { MapPin, Clock } from "lucide-react"

interface VisionCollectionStepProps {
  data: {
    targetTeamCount: number
    matchDuration: number
    breakTime: number
    totalDuration: number
    priorities: {
      venueEfficiency: boolean
      matchBalance: boolean
      restTime: boolean
    }
    preferences: {
      breakTime: number
    }
  }
  format: 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT' | null
  onUpdate: (data: VisionCollectionStepProps['data']) => void
}

export function VisionCollectionStep({ data, format, onUpdate }: VisionCollectionStepProps) {
  const hasErrors = data.targetTeamCount < 4 || data.matchDuration < 15

  return (
    <div className="space-y-6">
      {hasErrors && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            <ul className="list-disc pl-4">
              {data.targetTeamCount < 4 && <li>Minimum 4 teams required</li>}
              {data.matchDuration < 15 && <li>Minimum match duration is 15 minutes</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6 space-y-8">
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-[#1D1D1F] dark:text-white">
              Core Requirements
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="team-count">Target Number of Teams</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-[#86868B]" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Recommended: {format === 'KNOCKOUT' ? '8, 16, or 32' : '6, 8, 10, or 12'} teams</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="team-count"
                  type="number"
                  min={4}
                  max={32}
                  value={data.targetTeamCount}
                  onChange={(e) => onUpdate({ 
                    ...data, 
                    targetTeamCount: parseInt(e.target.value) 
                  })}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Match Duration</Label>
                  <span className="text-sm font-medium text-[#0066CC]">
                    {data.matchDuration} minutes
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {[15, 30, 45, 60, 75, 90].map((duration) => (
                    <Button
                      key={duration}
                      variant="outline"
                      onClick={() => onUpdate({ 
                        ...data, 
                        matchDuration: duration 
                      })}
                      className={cn(
                        "h-10 px-4",
                        data.matchDuration === duration 
                          ? "bg-[#0066CC] text-white border-[#0066CC] hover:bg-[#0066CC] hover:text-white"
                          : "border-[#E5E5EA] text-[#86868B] hover:bg-[#F5F5F5] hover:text-[#1D1D1F]"
                      )}
                    >
                      {duration}'
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Break Time Between Matches</Label>
                  <span className="text-sm font-medium text-[#0066CC]">
                    {data.breakTime} minutes
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {[5, 10, 15, 20, 25, 30].map((duration) => (
                    <Button
                      key={duration}
                      variant="outline"
                      onClick={() => onUpdate({
                        ...data,
                        breakTime: duration,
                        preferences: {
                          ...data.preferences,
                          breakTime: duration,
                        },
                      })}
                      className={cn(
                        "h-10 px-4",
                        data.breakTime === duration 
                          ? "bg-[#0066CC] text-white border-[#0066CC] hover:bg-[#0066CC] hover:text-white"
                          : "border-[#E5E5EA] text-[#86868B] hover:bg-[#F5F5F5] hover:text-[#1D1D1F]"
                      )}
                    >
                      {duration}'
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <h2 className="text-lg font-medium text-[#1D1D1F] dark:text-white">
              Optimization Priorities
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Schedule Priority</Label>
                  <p className="text-sm text-[#86868B]">
                    Choose between optimizing for venue efficiency or rest time
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className={cn(
                    "justify-between px-4 py-6",
                    data.priorities.venueEfficiency && "border-primary"
                  )}
                  onClick={() => onUpdate({
                    ...data,
                    priorities: {
                      ...data.priorities,
                      venueEfficiency: true,
                      restTime: false
                    }
                  })}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Venue Usage Efficiency</div>
                      <p className="text-sm text-muted-foreground">
                        Optimize field allocation and minimize venue rental costs
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "h-4 w-4 rounded-full border",
                    data.priorities.venueEfficiency && "bg-primary"
                  )} />
                </Button>

                <Button
                  variant="outline"
                  className={cn(
                    "justify-between px-4 py-6",
                    data.priorities.restTime && "border-primary"
                  )}
                  onClick={() => onUpdate({
                    ...data,
                    priorities: {
                      ...data.priorities,
                      venueEfficiency: false,
                      restTime: true
                    }
                  })}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Maximize Rest Time</div>
                      <p className="text-sm text-muted-foreground">
                        Prioritize adequate rest periods between matches
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "h-4 w-4 rounded-full border",
                    data.priorities.restTime && "bg-primary"
                  )} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 