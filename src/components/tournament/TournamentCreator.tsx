'use client'

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Save } from "lucide-react"
import { BasicInfoStep } from "./steps/BasicInfoStep"
import { FormatSelectionStep } from "./steps/FormatSelectionStep"
import { FormatSettingsStep } from "./steps/FormatSettingsStep"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Step = 'basic-info' | 'format-selection' | 'format-settings'

export function TournamentCreator() {
  const [currentStep, setCurrentStep] = useState<Step>('basic-info')
  const [formData, setFormData] = useState({
    basicInfo: {
      name: '',
      description: ''
    },
    format: null as 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT' | null,
    settings: {
      roundRobinType: 'SINGLE' as 'SINGLE' | 'DOUBLE',
      groupCount: 2,
      teamsPerGroup: 4,
      qualifiersPerGroup: 2,
      hasThirdPlace: true,
      hasExtraTime: true,
      hasPenalties: true
    }
  })

  const steps: Step[] = ['basic-info', 'format-selection', 'format-settings']
  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
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

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80">
        <nav className="flex items-center justify-between h-14 px-8 max-w-[1120px] mx-auto">
          <div className="flex items-center space-x-3 text-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="text-[#424245] dark:text-[#86868B] hover:text-[#0066CC] dark:hover:text-[#0A84FF]"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveDraft}
              className="border-[#D2D2D7] hover:border-[#86868B] text-[#1D1D1F]"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button 
              size="sm"
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="bg-[#0066CC] hover:bg-[#0077ED] text-white"
            >
              Next Step
            </Button>
          </div>
        </nav>
        <div className="px-8 py-4 max-w-[1120px] mx-auto">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="px-8 py-12 max-w-[1120px] mx-auto">
        <Alert variant="warning" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your progress will be saved automatically as a draft. You can return to edit it later.
          </AlertDescription>
        </Alert>

        {currentStep === 'basic-info' && (
          <BasicInfoStep 
            data={formData.basicInfo}
            onUpdate={(data) => setFormData(prev => ({ ...prev, basicInfo: data }))}
          />
        )}
        {currentStep === 'format-selection' && (
          <FormatSelectionStep 
            selectedFormat={formData.format}
            onSelect={(format) => setFormData(prev => ({ ...prev, format }))}
          />
        )}
        {currentStep === 'format-settings' && (
          <FormatSettingsStep 
            format={formData.format}
            settings={formData.settings}
            onUpdate={(settings) => setFormData(prev => ({ ...prev, settings }))}
          />
        )}
      </div>
    </div>
  )
} 