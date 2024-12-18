'use client'

import { Button } from "@/components/ui/button"
import { PlusCircle, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { TournamentHub } from "@/components/tournament/TournamentHub"

export default function TournamentHubPage() {
  const router = useRouter()

  return <TournamentHub />
} 