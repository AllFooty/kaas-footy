'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2, Save, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Tournament } from "@/types"

interface TournamentSettingsProps {
  tournament: Tournament
  onUpdate: (tournament: Tournament) => void
  onCancel: () => void
}

export function TournamentSettings({ tournament, onUpdate, onCancel }: TournamentSettingsProps) {
  const [formData, setFormData] = useState({
    name: tournament.name,
    description: tournament.description || "",
    settings: tournament.settings
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onUpdate({
      ...tournament,
      name: formData.name,
      description: formData.description,
      settings: formData.settings
    })
    setIsSaving(false)
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="border-0 bg-white dark:bg-[#1D1D1F] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-[#1D1D1F] dark:text-white">
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tournament Name</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="border-[#D2D2D7] focus:border-[#0066CC]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px] border-[#D2D2D7] focus:border-[#0066CC]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white dark:bg-[#1D1D1F] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-[#1D1D1F] dark:text-white">
            Tournament Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(tournament.format === 'KNOCKOUT' || tournament.format === 'GROUP_KNOCKOUT') && (
            <div className="flex items-center justify-between">
              <Label htmlFor="third-place" className="cursor-pointer">
                Third Place Playoff
              </Label>
              <Switch 
                id="third-place" 
                defaultChecked={tournament.settings.knockout?.thirdPlace ?? false} 
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    knockout: {
                      ...prev.settings.knockout,
                      thirdPlace: checked
                    }
                  }
                }))}
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label htmlFor="extra-time" className="cursor-pointer">
              Extra Time
            </Label>
            <Switch 
              id="extra-time" 
              defaultChecked={tournament.settings.matchDuration.extraTime !== undefined} 
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  matchDuration: {
                    ...prev.settings.matchDuration,
                    extraTime: checked ? 30 : undefined
                  }
                }
              }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="penalties" className="cursor-pointer">
              Penalty Shootout
            </Label>
            <Switch 
              id="penalties" 
              defaultChecked={tournament.settings.matchDuration.penalties ?? false} 
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  matchDuration: {
                    ...prev.settings.matchDuration,
                    penalties: checked
                  }
                }
              }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button 
          variant="destructive"
          className="bg-[#FF3B30] hover:bg-[#FF453A] text-white rounded-full px-6"
          onClick={() => setShowDeleteAlert(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Tournament
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={onCancel}
            className="rounded-full px-6"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#0066CC] hover:bg-[#0077ED] text-white rounded-full px-6"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tournament
              and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#FF3B30] hover:bg-[#FF453A] text-white"
            >
              Delete Tournament
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 