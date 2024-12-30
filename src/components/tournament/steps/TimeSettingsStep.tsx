import { useEffect } from 'react'

interface TimeSettingsStepProps {
  settings: {
    matchDuration: {
      regularTime: number
      extraTime?: number
      penalties: boolean
    }
    breakTime: number
    restTime: number
    startTime: string
    endTime: string
  }
  onUpdate: (settings: TimeSettingsStepProps['settings']) => void
}

export function TimeSettingsStep({ settings, onUpdate }: TimeSettingsStepProps) {
  useEffect(() => {
    console.log('Time Settings Configuration:', {
      matchDuration: {
        regularTime: settings.matchDuration.regularTime,
        extraTime: settings.matchDuration.extraTime,
        penalties: settings.matchDuration.penalties
      },
      breakTime: settings.breakTime,
      restTime: settings.restTime,
      startTime: settings.startTime,
      endTime: settings.endTime
    })
  }, [settings])
  // ... rest of component
} 