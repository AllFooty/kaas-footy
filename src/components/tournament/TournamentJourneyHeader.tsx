import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Info, 
  Trophy, 
  Settings, 
  Target, 
  Calendar, 
  BarChart, 
  Wand2, 
  CheckCircle, 
  Users, 
  Flag,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Step } from "@/types/tournament"

interface TournamentJourneyHeaderProps {
  currentStep: string
  progress: number
  stepStatus: Record<Step, 'pending' | 'in-progress' | 'completed'>
}

const STEP_CONFIG = {
  'basic-info': {
    icon: Info,
    title: 'Basic Information',
    description: 'Set up your tournament fundamentals'
  },
  'format-selection': {
    icon: Trophy,
    title: 'Tournament Format',
    description: 'Choose how teams will compete'
  },
  'format-settings': {
    icon: Settings,
    title: 'Format Settings',
    description: 'Configure your chosen format'
  },
  'vision-collection': {
    icon: Target,
    title: 'Tournament Vision',
    description: 'Define your tournament goals'
  },
  'constraint-collection': {
    icon: Calendar,
    title: 'Scheduling Constraints',
    description: 'Set venue and time restrictions'
  },
  'analysis': {
    icon: BarChart,
    title: 'Tournament Analysis',
    description: 'Review feasibility and requirements'
  },
  'interactive-planning': {
    icon: Wand2,
    title: 'Schedule Planning',
    description: 'Generate and adjust schedule'
  },
  'plan-confirmation': {
    icon: CheckCircle,
    title: 'Plan Review',
    description: 'Confirm tournament structure'
  },
  'team-registration': {
    icon: Users,
    title: 'Team Setup',
    description: 'Register participating teams'
  },
  'schedule-finalization': {
    icon: Flag,
    title: 'Final Review',
    description: 'Review and publish schedule'
  }
} as const

export function TournamentJourneyHeader({ 
  currentStep, 
  progress,
  stepStatus 
}: TournamentJourneyHeaderProps) {
  const currentConfig = STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG]
  const Icon = currentConfig.icon
  const currentIndex = Object.keys(STEP_CONFIG).indexOf(currentStep)
  const nextStep = Object.values(STEP_CONFIG)[currentIndex + 1]

  return (
    <div className="space-y-6 mb-8">
      {/* Progress Bar */}
      <div className="px-1">
        <div className="flex justify-between text-sm text-[#86868B] mb-2">
          <span>Step {currentIndex + 1} of {Object.keys(STEP_CONFIG).length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress 
          value={progress} 
          className="h-1 bg-[#F5F5F7] dark:bg-[#2D2D2D]"
        >
          <div 
            className="h-full bg-[#0066CC] transition-all" 
            style={{ width: `${progress}%` }} 
          />
        </Progress>
      </div>

      {/* Current Step Card */}
      <Card className="overflow-hidden border-0 bg-white dark:bg-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-2xl">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#0066CC]/10 rounded-lg shrink-0">
              <Icon className="h-6 w-6 text-[#0066CC]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-medium text-[#1D1D1F] dark:text-white">
                {currentConfig.title}
              </h1>
              <p className="mt-1 text-[#424245] dark:text-[#86868B] text-sm">
                {currentConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* Next Step Preview */}
        {nextStep && (
          <>
            <div className="h-px bg-[#F5F5F7] dark:bg-[#2D2D2D]" />
            <div className="px-6 py-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#F5F5F7] dark:bg-[#2D2D2D] rounded-md">
                    <nextStep.icon className="h-4 w-4 text-[#86868B]" />
                  </div>
                  <span className="text-[#424245] dark:text-[#86868B]">
                    Next: {nextStep.title}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#86868B]" />
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
} 