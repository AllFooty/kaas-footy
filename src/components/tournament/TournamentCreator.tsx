'use client'

import { useState, useMemo, useEffect, useCallback } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Save, Check, ChevronRight } from "lucide-react"
import { BasicInfoStep } from "./steps/BasicInfoStep"
import { FormatSelectionStep } from "./steps/FormatSelectionStep"
import { FormatSettingsStep } from "./steps/FormatSettingsStep"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle } from "lucide-react"
import { VisionCollectionStep } from "./steps/VisionCollectionStep"
import { ConstraintCollectionStep } from "./steps/ConstraintCollectionStep"
import { AnalysisStep } from "./steps/AnalysisStep"
import { InteractivePlanningStep } from "./steps/InteractivePlanningStep"
import { PlanConfirmationStep } from "./steps/PlanConfirmationStep"
import { TeamRegistrationStep } from "./steps/TeamRegistrationStep"
import { ScheduleFinalizationStep } from "./steps/ScheduleFinalizationStep"
import type { Tournament, Match, Step as TournamentStep, Team, TournamentConstraints } from '@/types/tournament'
import type { ConflictReport } from '@/lib/services/scheduleGenerator'
import { ScheduleGenerator } from '@/lib/services/scheduleGenerator'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { TournamentJourneyHeader } from "./TournamentJourneyHeader"
import { TournamentDuration } from "./steps/sections/TournamentDuration"
import { isBefore } from "date-fns"
import type { TournamentScenario } from '@/lib/services/scenarioGenerator'

type CreatorStep = 'basic-info' | 'format-selection' | 'format-settings' | 'vision-collection' | 
           'constraint-collection' | 'analysis' | 'interactive-planning' | 'plan-confirmation' |
           'team-registration' | 'schedule-finalization'

interface TournamentFormData {
  id?: string
  basicInfo: {
    name: string
    description: string
    coverImage?: string
    ageGroup?: string
    competitionLevel: 'RECREATIONAL' | 'COMPETITIVE' | 'PROFESSIONAL'
  }
  format: 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT' | null
  settings: {
    roundRobinType: 'SINGLE' | 'DOUBLE'
    groupCount: number
    teamsPerGroup: number
    qualifiersPerGroup: number
    hasThirdPlace: boolean
    hasExtraTime: boolean
    hasPenalties: boolean
    knockoutLegs: 'SINGLE' | 'DOUBLE'
  }
  vision: {
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
  constraints: TournamentConstraints
  teams: Team[]
  matches?: Match[]
}

interface ScheduleResult {
  matches: Record<string, Match[]>
  conflicts: ConflictReport[]
}

const getStepDependencies = (step: CreatorStep) => {
  switch (step) {
    case 'format-settings':
      return {
        requires: ['format-selection'],
        message: 'Please select a tournament format first'
      }
    case 'interactive-planning':
      return {
        requires: ['team-registration', 'constraint-collection'],
        message: 'Teams and scheduling constraints are required before generating a schedule'
      }
    case 'schedule-finalization':
      return {
        requires: ['interactive-planning'],
        message: 'Please complete schedule planning first'
      }
    case 'vision-collection':
      return {
        requires: ['format-settings'],
        message: 'Please complete format settings first'
      }
    default:
      return { requires: [], message: '' }
  }
}

export function TournamentCreator() {
  const [currentStep, setCurrentStep] = useState<CreatorStep>('basic-info')
  const [formData, setFormData] = useState<TournamentFormData>({
    basicInfo: {
      name: '',
      description: '',
      coverImage: undefined,
      ageGroup: undefined,
      competitionLevel: 'RECREATIONAL'
    },
    format: null,
    settings: {
      roundRobinType: 'SINGLE',
      groupCount: 2,
      teamsPerGroup: 4,
      qualifiersPerGroup: 2,
      hasThirdPlace: true,
      hasExtraTime: true,
      hasPenalties: true,
      knockoutLegs: 'SINGLE'
    },
    vision: {
      targetTeamCount: 16,
      matchDuration: 30,
      breakTime: 10,
      totalDuration: 14,
      priorities: {
        venueEfficiency: true,
        matchBalance: true,
        restTime: true
      },
      preferences: {
        breakTime: 10
      }
    },
    constraints: {
      duration: {
        startDate: '',
        endDate: '',
        isSingleDay: false
      },
      venues: [],
      availability: []
    },
    teams: []
  })

  const [stepErrors, setStepErrors] = useState<string[]>([])
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const steps: CreatorStep[] = [
    'basic-info',
    'format-selection', 
    'format-settings',
    'vision-collection',
    'constraint-collection',
    'analysis',
    'interactive-planning',
    'plan-confirmation',
    'team-registration',
    'schedule-finalization'
  ]

  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const [stepStatus, setStepStatus] = useState<Record<CreatorStep, 'pending' | 'in-progress' | 'completed'>>({
    'basic-info': 'in-progress',
    'format-selection': 'pending',
    'format-settings': 'pending',
    'vision-collection': 'pending',
    'constraint-collection': 'pending',
    'analysis': 'pending',
    'interactive-planning': 'pending',
    'plan-confirmation': 'pending',
    'team-registration': 'pending',
    'schedule-finalization': 'pending'
  })

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date)
    // If end date exists and is before new start date, clear it
    if (endDate && date && isBefore(endDate, date)) {
      setEndDate(null)
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date)
  }

  const getCurrentStepConfig = () => {
    switch (currentStep) {
      case 'basic-info':
        return {
          title: 'Tournament Details',
          description: 'Start by providing basic information about your tournament'
        }
      case 'format-selection':
        return {
          title: 'Choose Tournament Format',
          description: 'Select the competition format that best suits your needs'
        }
      case 'format-settings':
        return {
          title: 'Format Configuration',
          description: `Configure settings for your ${formData.format?.toLowerCase() || ''} tournament`
        }
      case 'vision-collection':
        return {
          title: 'Tournament Vision',
          description: 'Define your goals and priorities for the tournament'
        }
      case 'constraint-collection':
        return {
          title: 'Schedule Constraints',
          description: 'Set up venues, dates, and time slots for matches'
        }
      case 'analysis':
        return {
          title: 'Tournament Analysis',
          description: 'Review and optimize your tournament setup'
        }
      case 'interactive-planning':
        return {
          title: 'Schedule Planning',
          description: 'Generate and fine-tune your tournament schedule'
        }
      case 'plan-confirmation':
        return {
          title: 'Review Plan',
          description: 'Confirm your tournament structure and settings'
        }
      case 'team-registration':
        return {
          title: 'Team Registration',
          description: 'Add and manage participating teams'
        }
      case 'schedule-finalization':
        return {
          title: 'Final Review',
          description: 'Review and publish your tournament schedule'
        }
      default:
        return {
          title: '',
          description: ''
        }
    }
  }

  const config = getCurrentStepConfig()

  const validateStep = useCallback((step: CreatorStep): boolean => {
    const errors: string[] = []
    const dependencies = getStepDependencies(step)
    
    if (dependencies.requires.length > 0) {
      const missingDeps = dependencies.requires.filter(
        dep => stepStatus[dep] !== 'completed'
      )
      if (missingDeps.length > 0) {
        errors.push(dependencies.message)
      }
    }

    let isValid = true
    switch (step) {
      case 'basic-info':
        isValid = !!formData.basicInfo.name.trim()
        if (!isValid) {
          if (!formData.basicInfo.name.trim()) errors.push('Tournament name is required')
        }
        break

      case 'format-selection':
        isValid = !!formData.format
        if (!isValid) {
          errors.push('Please select a tournament format')
        }
        break

      case 'format-settings':
        if (formData.format === 'GROUP_KNOCKOUT') {
          if (formData.settings.groupCount * formData.settings.teamsPerGroup < formData.vision.targetTeamCount) {
            errors.push('Group settings cannot accommodate target team count')
          }
        }
        break

      case 'vision-collection':
        if (formData.vision.targetTeamCount < 4) {
          errors.push('Minimum 4 teams required')
        }
        if (formData.vision.matchDuration < 15) {
          errors.push('Minimum match duration is 15 minutes')
        }
        break

      case 'constraint-collection':
        if (!formData.constraints.duration.startDate || !formData.constraints.duration.endDate) {
          errors.push('Tournament dates are required')
        }
        if (formData.constraints.venues.length === 0) {
          errors.push('At least one venue is required')
        }
        break

      case 'team-registration':
        isValid = formData.teams.length === formData.vision.targetTeamCount
        if (!isValid) {
          errors.push(`Please register ${formData.vision.targetTeamCount} teams`)
        }
        break
    }
    
    setStepErrors(errors)
    
    return isValid
  }, [formData, stepStatus])

  const validateStepMemoized = useCallback((step: CreatorStep) => { 
    return validateStep(step); 
  }, [validateStep]);

  const isStepValid = useMemo(() => validateStepMemoized(currentStep), [
    currentStep,
    validateStepMemoized
  ])

  const updateStepStatus = (step: CreatorStep, status: 'pending' | 'in-progress' | 'completed') => {
    setStepStatus(prev => ({
      ...prev,
      [step]: status
    }))
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      updateStepStatus(currentStep, 'completed')
      const nextStep = steps[currentStepIndex + 1]
      if (nextStep) {
        setCurrentStep(nextStep)
        updateStepStatus(nextStep, 'in-progress')
      }
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  const handleSaveDraft = async () => {
    // TODO: Implement save draft functionality
    console.log('Saving draft:', formData)
  }

  const generateSchedule = async (tournamentData: Tournament) => {
    try {
      const generator = new ScheduleGenerator(tournamentData)
      const result = generator.generateSchedule()
      setScheduleResult(result)
      console.log('Generated schedule:', result)
    } catch (error) {
      console.error('Error generating schedule:', error)
      // Optionally handle error state
    }
  }

  const handleTournamentUpdate = (updatedTournament: Tournament) => {
    setTournament(updatedTournament)
    generateSchedule(updatedTournament)
  }

  const createTournamentFromFormData = (formData: TournamentFormData): Tournament => {
    console.log('Creating tournament from form data:', formData)
    
    return {
      id: formData.id || 'draft',
      name: formData.basicInfo.name,
      description: formData.basicInfo.description,
      format: formData.format!,
      status: 'DRAFT',
      basicInfo: formData.basicInfo,
      settings: {
        league: formData.format === 'LEAGUE' ? {
          pointsForWin: 3,
          pointsForDraw: 1,
          pointsForLoss: 0,
          useHeadToHead: true,
          useGoalDifference: true,
          roundRobinType: formData.settings.roundRobinType
        } : undefined,
        knockout: formData.format === 'KNOCKOUT' ? {
          thirdPlace: formData.settings.hasThirdPlace,
          awayGoals: false,
          replays: false,
          legs: formData.settings.knockoutLegs
        } : undefined,
        group: formData.format === 'GROUP_KNOCKOUT' ? {
          numberOfGroups: formData.settings.groupCount,
          teamsPerGroup: formData.settings.teamsPerGroup,
          qualifiersPerGroup: formData.settings.qualifiersPerGroup,
        } : undefined,
        matchDuration: {
          regularTime: formData.vision.matchDuration,
          extraTime: formData.settings.hasExtraTime ? 30 : undefined,
          penalties: formData.settings.hasPenalties,
        },
      },
      vision: {
        targetTeamCount: formData.vision.targetTeamCount,
        priorities: {
          venueEfficiency: formData.vision.priorities.venueEfficiency,
          matchBalance: formData.vision.priorities.matchBalance,
          restTime: true,
        },
        preferences: {
          preferredMatchDays: [],
          preferredMatchTimes: [],
          avoidBackToBack: true,
        },
      },
      constraints: formData.constraints,
      teams: formData.teams || [],
      matches: formData.matches || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  const handlePublishSchedule = async () => {
    if (!tournament || !scheduleResult) return

    try {
      // Update tournament status and add matches
      const updatedTournament = {
        ...tournament,
        status: 'ACTIVE' as const,
        matches: Object.values(scheduleResult.matches).flat()
      }

      // Save to database
      const response = await fetch(`/api/tournaments/${tournament.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTournament),
      })

      if (!response.ok) throw new Error('Failed to publish schedule')

      toast({
        title: "Schedule Published",
        description: "Tournament schedule has been published successfully.",
        duration: 3000,
      })

      // Redirect to dashboard with refreshed data
      router.push(`/tournaments/${tournament.id}`)
      router.refresh() // Force Next.js to revalidate the data
    } catch (error) {
      console.error('Failed to publish schedule:', error)
      toast({
        title: "Error",
        description: "Failed to publish schedule. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handleBasicInfoUpdate = (basicInfo: TournamentFormData['basicInfo']) => {
    setFormData(prev => ({
      ...prev,
      basicInfo
    }))

    // Only update step status if it's not already completed
    if (basicInfo.name && basicInfo.description && stepStatus['basic-info'] !== 'completed') {
      updateStepStatus('basic-info', 'completed')
    }
  }

  const convertTournamentToFormData = (tournament: Tournament): Partial<TournamentFormData> => {
    // Calculate total duration in days from constraints
    const startDate = new Date(tournament.constraints.duration.startDate)
    const endDate = new Date(tournament.constraints.duration.endDate)
    const totalDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    return {
      basicInfo: tournament.basicInfo,
      format: tournament.format,
      settings: {
        roundRobinType: tournament.settings.league?.roundRobinType || 'SINGLE',
        groupCount: tournament.settings.group?.numberOfGroups || 2,
        teamsPerGroup: tournament.settings.group?.teamsPerGroup || 4,
        qualifiersPerGroup: tournament.settings.group?.qualifiersPerGroup || 2,
        hasThirdPlace: tournament.settings.knockout?.thirdPlace || false,
        hasExtraTime: tournament.settings.matchDuration.extraTime !== undefined,
        hasPenalties: tournament.settings.matchDuration.penalties || false,
        knockoutLegs: tournament.settings.knockout?.legs || 'SINGLE'
      },
      vision: {
        targetTeamCount: tournament.vision.targetTeamCount,
        matchDuration: tournament.settings.matchDuration.regularTime,
        breakTime: tournament.vision.preferences?.breakTime || 10,
        totalDuration: totalDuration,
        priorities: {
          venueEfficiency: tournament.vision.priorities.venueEfficiency,
          matchBalance: tournament.vision.priorities.matchBalance,
          restTime: tournament.vision.priorities.restTime
        },
        preferences: {
          breakTime: tournament.vision.preferences?.breakTime || 10
        }
      },
      constraints: tournament.constraints
    }
  }

  const tournamentData = createTournamentFromFormData(formData)
  console.log('Tournament data before InteractivePlanningStep:', {
    teams: tournamentData.teams,
    constraints: tournamentData.constraints
  })

  // Add this effect to debug form data changes
  useEffect(() => {
    console.log('Form data updated:', {
      teams: formData.teams,
      format: formData.format,
      settings: formData.settings
    });
  }, [formData]);

  // Update the handleStepUpdate function
  const handleStepUpdate = useCallback((stepData: Partial<TournamentFormData>) => {
    setFormData(prev => {
      // Deep compare objects to prevent unnecessary updates
      const updated = {
        ...prev,
        ...stepData,
        teams: stepData.teams || prev.teams,
        constraints: stepData.constraints || prev.constraints, // Ensure constraints are preserved
      };
      
      // Log the update
      console.log('Form data update:', {
        prevTeams: prev.teams?.length,
        newTeams: updated.teams?.length,
        prevConstraints: !!prev.constraints,
        newConstraints: !!updated.constraints
      });
      
      // Only update if there are actual changes
      if (JSON.stringify(prev) === JSON.stringify(updated)) {
        return prev;
      }
      
      return updated;
    });
  }, []); // Empty dependency array since we're using the function form of setState

  // Remove or modify the validateStep useEffect that's causing extra renders
  useEffect(() => {
    // Only validate when step changes, not on every form data update
    validateStep(currentStep)
  }, [currentStep, validateStep]) // Remove formData dependency

  const handleConstraintsUpdate = useCallback((updatedConstraints: TournamentConstraints) => {
    setFormData(prev => {
      // Only update if there are actual changes
      if (JSON.stringify(prev.constraints) === JSON.stringify(updatedConstraints)) {
        return prev;
      }
      
      return {
        ...prev,
        constraints: updatedConstraints,
      };
    });
  }, []);

  const [selectedScenario, setSelectedScenario] = useState<TournamentScenario | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <div className="container-modern py-8 max-w-3xl mx-auto">
        <TournamentJourneyHeader
          currentStep={currentStep}
          progress={progress}
          stepStatus={stepStatus}
        />

        <div className="mt-8">
          {/* Step Content */}
          <div className="relative glass p-6 rounded-2xl">
            {currentStep === 'basic-info' && (
              <BasicInfoStep
                data={formData.basicInfo}
                onUpdate={handleBasicInfoUpdate}
              />
            )}
            {currentStep === 'format-selection' && (
              <FormatSelectionStep
                selectedFormat={formData.format}
                onSelect={(format) => {
                  setFormData(prev => ({
                    ...prev,
                    format
                  }))
                  updateStepStatus('format-selection', 'completed')
                }}
              />
            )}
            {currentStep === 'format-settings' && (
              <FormatSettingsStep
                format={formData.format}
                settings={formData.settings}
                targetTeamCount={formData.vision.targetTeamCount}
                onUpdate={(newSettings) => {
                  setFormData(prev => ({
                    ...prev,
                    settings: {
                      ...newSettings,
                      knockoutLegs: prev.settings.knockoutLegs
                    }
                  }))
                  updateStepStatus('format-settings', 'completed')
                }}
              />
            )}
            {currentStep === 'vision-collection' && (
              <VisionCollectionStep
                format={formData.format}
                data={formData.vision}
                onUpdate={(newVision) => {
                  setFormData(prev => ({
                    ...prev,
                    vision: newVision
                  }))
                  updateStepStatus('vision-collection', 'completed')
                }}
              />
            )}
            {currentStep === 'constraint-collection' && (
              <ConstraintCollectionStep
                data={formData.constraints}
                onUpdate={(newConstraints) => {
                  setFormData(prev => ({
                    ...prev,
                    constraints: newConstraints
                  }))
                }}
              />
            )}
            {currentStep === 'analysis' && (
              <AnalysisStep
                tournament={createTournamentFromFormData(formData)}
                onUpdate={(updatedTournament, scenario) => {
                  console.log('Analysis step update:', updatedTournament);
                  setSelectedScenario(scenario)
                  handleStepUpdate({
                    teams: updatedTournament.teams,
                    format: updatedTournament.format,
                    settings: {
                      ...formData.settings,
                      ...updatedTournament.settings
                    }
                  });
                }}
              />
            )}
            {currentStep === 'interactive-planning' && (
              <InteractivePlanningStep
                tournament={tournamentData}
                selectedScenario={selectedScenario}
                onUpdate={(updatedTournament) => {
                  console.log('Updating tournament:', updatedTournament)
                  setFormData(prev => ({
                    ...prev,
                    ...convertTournamentToFormData(updatedTournament)
                  }))
                }}
              />
            )}
            {currentStep === 'plan-confirmation' && (
              <PlanConfirmationStep
                tournament={createTournamentFromFormData(formData)}
                matches={scheduleResult?.matches || {}}
                conflicts={scheduleResult?.conflicts || []}
                selectedScenario={selectedScenario}
                onModify={(section) => {
                  const stepMap = {
                    basic: 'basic-info',
                    format: 'format-selection',
                    vision: 'vision-collection',
                    constraints: 'constraint-collection'
                  } as const
                  setCurrentStep(stepMap[section])
                }}
              />
            )}
            {currentStep === 'team-registration' && (
              <TeamRegistrationStep
                tournament={createTournamentFromFormData(formData)}
                onUpdate={(updatedTournament) => {
                  setFormData(prev => ({
                    ...prev,
                    teams: updatedTournament.teams
                  }))
                }}
              />
            )}
            {currentStep === 'schedule-finalization' && (
              <ScheduleFinalizationStep
                tournament={createTournamentFromFormData(formData)}
                matches={scheduleResult?.matches || {}}
                onRegenerateSchedule={() => generateSchedule(createTournamentFromFormData(formData))}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between px-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="rounded-full"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={currentStep === 'schedule-finalization' ? handlePublishSchedule : handleNext}
              disabled={!isStepValid || (currentStep === 'plan-confirmation' && scheduleResult?.conflicts.length > 0)}
              className="rounded-full bg-[#0066CC] hover:bg-[#0077ED]"
            >
              {currentStep === 'schedule-finalization' ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Publish Schedule
                </>
              ) : currentStep === 'plan-confirmation' ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Plan
                </>
              ) : (
                <>
                  Next Step
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}