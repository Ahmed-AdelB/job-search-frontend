"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { JobFilters } from "@/types/api"
import { Filter, X, ChevronUp, ChevronDown } from "lucide-react"

interface JobFiltersProps {
  onFiltersChange: (filters: JobFilters) => void
  isCollapsed?: boolean
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "scored", label: "Scored" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "archived", label: "Archived" },
  { value: "rejected", label: "Rejected" },
]

const SOURCE_OPTIONS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "glassdoor", label: "Glassdoor" },
  { value: "builtin", label: "Built In" },
  { value: "greenhouse", label: "Greenhouse" },
  { value: "workday", label: "Workday" },
]

const REMOTE_OPTIONS = [
  { value: "remote", label: "100% Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
]

export function JobFilters({
  onFiltersChange,
  isCollapsed = false,
}: JobFiltersProps) {
  const [search, setSearch] = useState("")
  const [minScore, setMinScore] = useState(0)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [selectedRemoteTypes, setSelectedRemoteTypes] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(!isCollapsed)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: JobFilters = {
        search: search || undefined,
        min_score: minScore > 0 ? minScore : undefined,
        status: selectedStatuses.length > 0 ? selectedStatuses.join(",") : undefined,
        source: selectedSources.length > 0 ? selectedSources.join(",") : undefined,
        remote_type:
          selectedRemoteTypes.length > 0
            ? selectedRemoteTypes.join(",")
            : undefined,
      }
      onFiltersChange(filters)
    }, 500)

    return () => clearTimeout(timer)
  }, [search, minScore, selectedStatuses, selectedSources, selectedRemoteTypes, onFiltersChange])

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    )
  }

  const toggleRemoteType = (remoteType: string) => {
    setSelectedRemoteTypes((prev) =>
      prev.includes(remoteType)
        ? prev.filter((r) => r !== remoteType)
        : [...prev, remoteType]
    )
  }

  const clearAllFilters = () => {
    setSearch("")
    setMinScore(0)
    setSelectedStatuses([])
    setSelectedSources([])
    setSelectedRemoteTypes([])
  }

  const hasActiveFilters =
    search ||
    minScore > 0 ||
    selectedStatuses.length > 0 ||
    selectedSources.length > 0 ||
    selectedRemoteTypes.length > 0

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Search</Label>
        <Input
          placeholder="Job title, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8"
        />
      </div>

      {/* Min Score Slider */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Minimum Score: {minScore}</Label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Status</Label>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={`status-${option.value}`}
                checked={selectedStatuses.includes(option.value)}
                onCheckedChange={() => toggleStatus(option.value)}
              />
              <Label
                htmlFor={`status-${option.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Source Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Source</Label>
        <div className="space-y-2">
          {SOURCE_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={`source-${option.value}`}
                checked={selectedSources.includes(option.value)}
                onCheckedChange={() => toggleSource(option.value)}
              />
              <Label
                htmlFor={`source-${option.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Remote Type Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Remote Type</Label>
        <div className="space-y-2">
          {REMOTE_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={`remote-${option.value}`}
                checked={selectedRemoteTypes.includes(option.value)}
                onCheckedChange={() => toggleRemoteType(option.value)}
              />
              <Label
                htmlFor={`remote-${option.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear All Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="w-full"
        >
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Filter Sheet */}
      <div className="lg:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters {hasActiveFilters && <Badge className="ml-2">Active</Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Collapsible Filter Panel */}
      <div className="hidden lg:block mb-4">
        <Card>
          <div className="p-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full mb-4"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <h3 className="font-semibold">Filters</h3>
                {hasActiveFilters && <Badge>Active</Badge>}
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {isOpen && (
              <>
                <div className="border-t pt-4">
                  <FilterContent />
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
