import { useEffect } from 'react'

interface StepperProps {
  currentStep: number
  steps: Array<{
    name: string
    status: 'pending' | 'current' | 'completed'
  }>
}

export function TournamentCreationStepper({ currentStep, steps }: StepperProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Tournament Creation Progress:', {
        currentStep,
        totalSteps: steps.length,
        completedSteps: steps.filter(step => step.status === 'completed').length,
        stepsStatus: steps.map(step => ({
          name: step.name,
          status: step.status
        }))
      })
    }, 500)
    
    return () => clearTimeout(timer)
  }, [currentStep, steps])
  // ... rest of component
} 