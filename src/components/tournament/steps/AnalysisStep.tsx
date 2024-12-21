"use client"

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { ScenarioComparison } from '../analysis/ScenarioComparison'
import { ScenarioGenerator } from '@/lib/services/scenarioGenerator'
import { applyScenario } from '@/lib/services/scenarioApplier'
import type { Tournament } from '@/types/tournament'
import type { TournamentScenario } from '@/lib/services/scenarioGenerator'

interface AnalysisStepProps {
  tournament: Tournament
  onUpdate: (tournament: Tournament) => void
}

export function AnalysisStep({ tournament, onUpdate }: AnalysisStepProps) {
  const [scenarios, setScenarios] = useState<TournamentScenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<TournamentScenario | null>(null)

  useEffect(() => {
    const generator = new ScenarioGenerator(tournament)
    setScenarios(generator.generateScenarios())
  }, [tournament])

  const handleScenarioSelect = (scenario: TournamentScenario) => {
    console.log('Selected scenario:', scenario)
    setSelectedScenario(scenario)
    const updatedTournament = applyScenario(tournament, scenario)
    console.log('Updated tournament after scenario:', updatedTournament)
    onUpdate(updatedTournament)
  }

  return (
    <div className='space-y-8 max-w-4xl mx-auto'>
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Tournament Analysis & Recommendations</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Based on your preferences and constraints, we&apos;ve generated the following scenarios. 
          Choose the one that best fits your needs.
        </p>
        <ScenarioComparison 
          scenarios={scenarios}
          selectedScenario={selectedScenario}
          onSelectScenario={handleScenarioSelect}
        />
      </Card>
    </div>
  )
} 