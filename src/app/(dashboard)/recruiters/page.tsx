"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TableSkeleton } from "@/components/shared/loading-skeleton"
import { RecruiterTable } from "@/components/recruiters/recruiter-table"
import { RecruiterDetail } from "@/components/recruiters/recruiter-detail"
import { useRecruiters, useSpecializations } from "@/hooks/use-recruiters"
import type { Recruiter } from "@/types/api"

export default function RecruitersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("")
  const [minResponseRate, setMinResponseRate] = useState<number | undefined>()
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string | null>(null)
  const [showDetailSheet, setShowDetailSheet] = useState(false)

  // Fetch specializations for filter
  const { data: specializationsData } = useSpecializations()
  const specializations = specializationsData?.specializations || []

  // Fetch recruiters with filters
  const { data: recruitersResponse, isLoading } = useRecruiters({
    specialization: selectedSpecialization || undefined,
    min_response_rate: minResponseRate,
    search: searchQuery || undefined,
    per_page: 100,
  })

  const allRecruiters = recruitersResponse?.recruiters || []

  // Local filtering for search (in case API doesn't support it)
  const filteredRecruiters = useMemo(() => {
    return allRecruiters.filter((recruiter) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          recruiter.name.toLowerCase().includes(query) ||
          recruiter.company?.toLowerCase().includes(query) ||
          recruiter.email?.toLowerCase().includes(query) ||
          recruiter.title?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [allRecruiters, searchQuery])

  // Sort by response rate and interaction count
  const sortedRecruiters = useMemo(() => {
    return [...filteredRecruiters].sort((a, b) => {
      // Primary: by response rate (descending)
      const rateA = a.response_rate || 0
      const rateB = b.response_rate || 0
      if (rateA !== rateB) return rateB - rateA

      // Secondary: by interaction count (descending)
      const countA = a.interaction_count || 0
      const countB = b.interaction_count || 0
      return countB - countA
    })
  }, [filteredRecruiters])

  const handleSendMessage = (recruiter: Recruiter) => {
    // Navigate to outreach page with pre-filled recruiter
    const params = new URLSearchParams({
      recruiter_id: recruiter.contact_id,
      recruiter_name: recruiter.name,
      recruiter_email: recruiter.email || "",
      recruiter_company: recruiter.company || "",
    })
    router.push(`/outreach?${params.toString()}`)
  }

  const handleSelectRecruiter = (recruiter: Recruiter) => {
    setSelectedRecruiterId(recruiter.contact_id)
    setShowDetailSheet(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruiters</h1>
          <p className="text-muted-foreground">
            {allRecruiters.length} recruiter{allRecruiters.length !== 1 ? "s" : ""} in
            your network
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Specialization Filter */}
        <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
          <SelectTrigger>
            <SelectValue placeholder="All specializations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All specializations</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Response Rate Filter */}
        <Select
          value={minResponseRate?.toString() || ""}
          onValueChange={(val) =>
            setMinResponseRate(val ? parseFloat(val) : undefined)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All response rates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All response rates</SelectItem>
            <SelectItem value="0.8">High (80%+)</SelectItem>
            <SelectItem value="0.5">Medium (50%+)</SelectItem>
            <SelectItem value="0">Low (0%+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <RecruiterTable
          recruiters={sortedRecruiters}
          onSelectRecruiter={handleSelectRecruiter}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* Detail Sheet */}
      <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
        <SheetContent className="w-full sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Recruiter Profile</SheetTitle>
          </SheetHeader>
          {selectedRecruiterId && (
            <div className="mt-6">
              <RecruiterDetail
                linkedinId={selectedRecruiterId}
                onClose={() => setShowDetailSheet(false)}
                onSendMessage={(recruiter) => {
                  handleSendMessage(recruiter)
                  setShowDetailSheet(false)
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
