"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full select-none", className)}
      classNames={{
        months: "flex flex-col w-full",
        month: "space-y-4 w-full",
        caption: "flex justify-between px-2 pt-1 relative items-center mb-4",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "flex w-full",
        head_cell: "text-muted-foreground w-full h-8 font-normal text-[0.8rem] uppercase",
        row: "flex w-full mt-2",
        cell: "relative w-full h-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 mx-auto font-normal",
          "hover:bg-muted rounded-md transition-colors",
          "aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-primary/20 text-primary font-medium",
          "hover:bg-primary/30 hover:text-primary",
          "ring-1 ring-primary/20"
        ),
        day_today: cn(
          "bg-accent/10 text-accent-foreground font-medium",
          "ring-1 ring-accent/50"
        ),
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 