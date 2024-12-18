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
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-[#1D1D1F] dark:text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 text-[#424245] dark:text-[#86868B] hover:text-[#0066CC] dark:hover:text-[#0A84FF]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-[#424245] dark:text-[#86868B] rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#0066CC]/10 dark:[&:has([aria-selected])]:bg-[#0066CC]/20",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2D2D2D]"
        ),
        day_selected: "bg-[#0066CC] text-white hover:bg-[#0077ED] hover:text-white",
        day_today: "bg-[#F5F5F7] dark:bg-[#2D2D2D] text-[#0066CC] dark:text-[#0A84FF] font-medium",
        day_outside: "text-[#424245]/50 dark:text-[#86868B]/50",
        day_disabled: "text-[#424245]/30 dark:text-[#86868B]/30",
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