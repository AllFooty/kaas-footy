import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  }
  format: 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT' | null
  onUpdate: (data: VisionCollectionStepProps['data']) => void
}

export function VisionCollectionStep({ data, format, onUpdate }: VisionCollectionStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1D1D1F] dark:text-white">
          Tournament Vision
        </h1>
        <p className="mt-2 text-[#424245] dark:text-[#86868B]">
          Define your ideal tournament setup and priorities.
        </p>
      </div>

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
                <Label>Match Duration (minutes)</Label>
                <Slider
                  value={[data.matchDuration]}
                  onValueChange={([value]) => onUpdate({ 
                    ...data, 
                    matchDuration: value 
                  })}
                  min={60}
                  max={120}
                  step={5}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-[#86868B]">
                  <span>60 min</span>
                  <span>{data.matchDuration} min</span>
                  <span>120 min</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Break Time Between Matches (minutes)</Label>
                <Slider
                  value={[data.breakTime]}
                  onValueChange={([value]) => onUpdate({ 
                    ...data, 
                    breakTime: value 
                  })}
                  min={5}
                  max={30}
                  step={5}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-[#86868B]">
                  <span>5 min</span>
                  <span>{data.breakTime} min</span>
                  <span>30 min</span>
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
                  <Label>Venue Usage Efficiency</Label>
                  <p className="text-sm text-[#86868B]">
                    Optimize field allocation and minimize venue rental costs
                  </p>
                </div>
                <Switch
                  checked={data.priorities.venueEfficiency}
                  onCheckedChange={(checked) => onUpdate({
                    ...data,
                    priorities: { ...data.priorities, venueEfficiency: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Home/Away Match Balance</Label>
                  <p className="text-sm text-[#86868B]">
                    Ensure fair distribution of home and away matches
                  </p>
                </div>
                <Switch
                  checked={data.priorities.matchBalance}
                  onCheckedChange={(checked) => onUpdate({
                    ...data,
                    priorities: { ...data.priorities, matchBalance: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maximize Rest Time</Label>
                  <p className="text-sm text-[#86868B]">
                    Prioritize adequate rest periods between matches
                  </p>
                </div>
                <Switch
                  checked={data.priorities.restTime}
                  onCheckedChange={(checked) => onUpdate({
                    ...data,
                    priorities: { ...data.priorities, restTime: checked }
                  })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 