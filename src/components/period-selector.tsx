"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { useDashboardStore } from "@/lib/store"
import { Calendar, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function PeriodSelector() {
  const { currentPeriod, setPeriod } = useDashboardStore()
  
  // Labels des périodes en français
  const periodLabels = {
    day: "Aujourd'hui",
    week: "Cette semaine",
    month: "Ce mois-ci",
    year: "Cette année"
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{periodLabels[currentPeriod]}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setPeriod("day")}>
          {periodLabels.day}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPeriod("week")}>
          {periodLabels.week}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPeriod("month")}>
          {periodLabels.month}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPeriod("year")}>
          {periodLabels.year}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 