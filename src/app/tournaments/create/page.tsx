'use client'

import { Suspense } from "react"
import { TournamentCreator } from "@/components/tournament/TournamentCreator"
import CreateTournamentLoading from "./loading"

export default function CreateTournamentPage() {
  return (
    <Suspense fallback={<CreateTournamentLoading />}>
      <TournamentCreator />
    </Suspense>
  )
} 