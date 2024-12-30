"use client"

import { Input } from "./input"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2">
      <div 
        className="w-10 h-10 rounded-lg border"
        style={{ backgroundColor: value }}
      />
      <Input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10"
      />
    </div>
  )
} 