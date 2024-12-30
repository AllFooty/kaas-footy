"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Info } from "lucide-react"
import { ScenarioComparison } from '../analysis/ScenarioComparison'
import { ScenarioGenerator } from '@/lib/services/scenarioGenerator'
import { applyScenario } from '@/lib/services/scenarioApplier'
import type { Tournament } from '@/types/tournament'
import type { TournamentScenario } from '@/lib/services/scenarioGenerator'
import { cn } from "@/lib/utils"

interface AnalysisStepProps {
  tournament: Tournament
  onUpdate: (tournament: Tournament, scenario: TournamentScenario | null) => void
}

export function AnalysisStep({ tournament, onUpdate }: AnalysisStepProps) {
  const [scenarios, setScenarios] = useState<TournamentScenario[]>([])
  const [feasibilityIssues, setFeasibilityIssues] = useState<Array<{
    type: 'ERROR' | 'WARNING'
    message: string
    suggestion: string
  }>>([])
  const [selectedScenario, setSelectedScenario] = useState<TournamentScenario | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const generateScenarios = useCallback(async () => {
    try {
      setIsGenerating(true)
      setError(null)
      const generator = new ScenarioGenerator(tournament)
      const { scenarios: newScenarios, feasibilityCheck } = await generator.generateScenarios()
      
      if (!feasibilityCheck.feasible) {
        setFeasibilityIssues(feasibilityCheck.issues)
        setScenarios([])
      } else {
        setFeasibilityIssues(feasibilityCheck.issues.filter(i => i.type === 'WARNING'))
        setScenarios(newScenarios)
      }
    } catch (err) {
      console.error('Error generating scenarios:', err)
      setError("Failed to generate scenarios. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }, [tournament])

  useEffect(() => {
    generateScenarios()
  }, [])

  const handleScenarioSelect = useCallback((scenario: TournamentScenario) => {
    setSelectedScenario(scenario)
    const updatedTournament = applyScenario(tournament, scenario)
    console.log('Updated tournament after scenario:', updatedTournament)
    onUpdate(updatedTournament, scenario)
  }, [tournament, onUpdate])

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="prose dark:prose-invert">
          <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-white">
            Tournament Format Options
          </h2>
          <p className="text-[#424245] dark:text-[#86868B]">
            {isGenerating ? "Analyzing your requirements..." :
             scenarios.length > 0 ? "Select the format that works best for you." :
             "Let's find the right format for your tournament."}
          </p>
        </div>
        {!isGenerating && scenarios.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={generateScenarios}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate Options
          </Button>
        )}
      </div>

      {isGenerating ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin">
              <RefreshCw className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Analyzing tournament requirements and generating optimal formats...
            </p>
          </div>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={generateScenarios}
            className="ml-auto"
          >
            Try Again
          </Button>
        </Alert>
      ) : (
        <>
          {/* Quick Summary Alert - Only show if there are issues */}
          {feasibilityIssues.length > 0 && (
            <Alert variant="warning" className="mb-6">
              <Info className="h-5 w-5" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    {feasibilityIssues.some(i => i.type === 'ERROR')
                      ? "We've adjusted the tournament format to work with your time constraints."
                      : "We've found some ways to optimize your tournament setup."}
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? "Hide Details" : "Show Details"}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Detailed Issues - Only show if user clicks "Show Details" */}
          {showDetails && feasibilityIssues.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-top-4">
              {feasibilityIssues.map((issue, index) => (
                <Alert 
                  key={index}
                  variant={issue.type === 'ERROR' ? 'destructive' : 'warning'}
                  className="flex items-start gap-2"
                >
                  {issue.type === 'ERROR' ? (
                    <AlertTriangle className="h-5 w-5 mt-0.5" />
                  ) : (
                    <Info className="h-5 w-5 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <AlertDescription className="text-base font-medium">
                      {issue.message}
                    </AlertDescription>
                    <p className="text-sm text-muted-foreground">
                      {issue.suggestion}
                    </p>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {/* Scenarios */}
          {scenarios.length > 0 ? (
            <Card className="p-6">
              <ScenarioComparison 
                scenarios={scenarios}
                selectedScenario={selectedScenario}
                onSelectScenario={handleScenarioSelect}
                tournament={tournament}
              />
            </Card>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <div className="flex-1 flex items-center justify-between">
                <AlertDescription>
                  We couldn't generate a tournament format with the current constraints.
                </AlertDescription>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="ml-4"
                >
                  Adjust Constraints
                </Button>
              </div>
            </Alert>
          )}
        </>
      )}
    </div>
  )
} 