'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { TournamentSettings } from "./tabs/TournamentSettings"
import type { Tournament } from "@/types/tournament"

interface TournamentSettingsDialogProps {
  tournament: Tournament
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (tournament: Tournament) => void
}

export function TournamentSettingsDialog({ 
  tournament, 
  open, 
  onOpenChange,
  onUpdate
}: TournamentSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <TournamentSettings 
          tournament={tournament} 
          onUpdate={onUpdate}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
} 