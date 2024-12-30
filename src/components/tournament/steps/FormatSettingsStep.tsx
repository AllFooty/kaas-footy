import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface FormatSettingsStepProps {
  format: 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT' | null
  settings: {
    roundRobinType: 'SINGLE' | 'DOUBLE'
    groupCount: number
    teamsPerGroup: number
    qualifiersPerGroup: number
    hasThirdPlace: boolean
    hasExtraTime: boolean
    hasPenalties: boolean
    knockout?: {
      thirdPlace: boolean
      awayGoals: boolean
      replays: boolean
      legs: 'SINGLE' | 'DOUBLE'
    }
  }
  targetTeamCount: number
  onUpdate: (settings: FormatSettingsStepProps['settings']) => void
}

export function FormatSettingsStep({ format, settings, targetTeamCount, onUpdate }: FormatSettingsStepProps) {
  const hasErrors = format === 'GROUP_KNOCKOUT' && 
    (settings.groupCount * settings.teamsPerGroup < targetTeamCount)

  useEffect(() => {
    if (format) {
      console.log('Format Settings Configuration:', {
        format,
        roundRobinType: settings.roundRobinType,
        groupCount: settings.groupCount,
        teamsPerGroup: settings.teamsPerGroup,
        qualifiersPerGroup: settings.qualifiersPerGroup,
        hasThirdPlace: settings.hasThirdPlace,
        hasExtraTime: settings.hasExtraTime,
        hasPenalties: settings.hasPenalties
      })
    }
  }, [format, settings])

  if (!format) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#1D1D1F] dark:text-white">
            Format Settings
          </h1>
          <p className="mt-2 text-[#424245] dark:text-[#86868B]">
            Customize the settings for your tournament format.
          </p>
        </div>

        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            Please select a tournament format first
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleRoundRobinTypeChange = (value: 'SINGLE' | 'DOUBLE') => {
    console.log('Updating round robin type:', value)
    onUpdate({ 
      ...settings, 
      roundRobinType: value 
    })
  }

  return (
    <div className="space-y-8">
      {hasErrors && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            Group settings cannot accommodate target team count
          </AlertDescription>
        </Alert>
      )}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            {format === 'LEAGUE' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Round Robin Type</Label>
                  <Select
                    value={settings.roundRobinType}
                    onValueChange={(value: 'SINGLE' | 'DOUBLE') =>
                      onUpdate({ ...settings, roundRobinType: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select round robin type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Single Round Robin</SelectItem>
                      <SelectItem value="DOUBLE">Double Round Robin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {format === 'GROUP_KNOCKOUT' && (
              <>
                <div className="space-y-4">
                  <Label>Number of Groups</Label>
                  <Select
                    value={settings.groupCount.toString()}
                    onValueChange={(value) =>
                      onUpdate({ ...settings, groupCount: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select number of groups" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 4, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Groups
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Teams per Group</Label>
                  <Select
                    value={settings.teamsPerGroup.toString()}
                    onValueChange={(value) =>
                      onUpdate({ ...settings, teamsPerGroup: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select teams per group" />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Teams
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Qualifiers per Group</Label>
                  <Select
                    value={settings.qualifiersPerGroup.toString()}
                    onValueChange={(value) =>
                      onUpdate({ ...settings, qualifiersPerGroup: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select qualifiers per group" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Team' : 'Teams'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {format !== 'LEAGUE' && (
              <div className="space-y-4">
                <Label>Additional Settings</Label>
                <div className="space-y-4">
                  {(format === 'KNOCKOUT' || format === 'GROUP_KNOCKOUT') && (
                    <>
                      <div className="space-y-4">
                        <Label>Match Format</Label>
                        <Select
                          value={settings.knockout?.legs || 'SINGLE'}
                          onValueChange={(value: 'SINGLE' | 'DOUBLE') => 
                            onUpdate({ 
                              ...settings, 
                              knockout: {
                                ...settings.knockout,
                                legs: value
                              }
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select match format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SINGLE">Single Game</SelectItem>
                            <SelectItem value="DOUBLE">Two-Legged Ties</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="third-place" className="cursor-pointer">
                          Third Place Playoff
                        </Label>
                        <Switch
                          id="third-place"
                          checked={settings.hasThirdPlace}
                          onCheckedChange={(checked) =>
                            onUpdate({ ...settings, hasThirdPlace: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="extra-time" className="cursor-pointer">
                          Extra Time
                        </Label>
                        <Switch
                          id="extra-time"
                          checked={settings.hasExtraTime}
                          onCheckedChange={(checked) =>
                            onUpdate({ ...settings, hasExtraTime: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="penalties" className="cursor-pointer">
                          Penalty Shootout
                        </Label>
                        <Switch
                          id="penalties"
                          checked={settings.hasPenalties}
                          onCheckedChange={(checked) =>
                            onUpdate({ ...settings, hasPenalties: checked })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 