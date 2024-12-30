"use client"

import DailySchedule from "@/components/tournament/steps/sections/DailySchedule"
import { useState } from "react"
import type { TournamentConstraints } from "@/types/tournament"

export default function PlanPage() {
  const [constraints, setConstraints] = useState<TournamentConstraints>({
    duration: {
      startDate: "",
      endDate: ""
    },
    venues: [],
    availability: []
  })

  const handleUpdate = (newData: TournamentConstraints) => {
    setConstraints(newData)
  }

  return (
    <div className="container mx-auto py-6">
      <DailySchedule 
        data={constraints} 
        onUpdate={handleUpdate}
      />
    </div>
  )
} 