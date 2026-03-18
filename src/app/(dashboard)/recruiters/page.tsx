"use client"

import { useState, useMemo } from "react"
import { format, parseISO } from "date-fns"
import { User, Plus, Mail, Briefcase, TrendingUp, Calendar, ChevronDown, ChevronUp, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useRecruiters } from "@/hooks/use-recruiters"
import type { Recruiter } from "@/types/api"

// Response rate badge configuration
const getResponseRateBadgeColor = (responseRate?: number): { bg: string; text: string } => {
  if (!responseRate) return { bg: "bg-gray-100 dark:bg-gray-900", text: "text-gray-700 dark:text-gray-300" }
  if (responseRate > 70) return { bg: "bg-green-100 dark:bg-green-950", text: "text-green-700 dark:text-green-300" }
  if (responseRate >= 40) return { bg: "bg-yellow-100 dark:bg-yellow-950", text: "text-yellow-700 dark:text-yellow-300" }
  return { bg: "bg-red-100 dark:bg-red-950", text: "text-red-700 dark:text-red-300" }
}

// Recruiter card skeleton loader
function RecruiterCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  )
}

// Recruiter card component
interface RecruiterCardProps {
  recruiter: Recruiter
  expanded: boolean
  onToggleExpand: (id: string) => void
}

function RecruiterCard({ recruiter, expanded, onToggleExpand }: RecruiterCardProps) {
  const responseRate = recruiter.response_rate || 0
  const responseRateColor = getResponseRateBadgeColor(responseRate)
  const lastContactDate = recruiter.last_contact ? parseISO(recruiter.last_contact) : null

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{recruiter.name}</h3>
            {recruiter.company && (
              <p className="text-sm text-muted-foreground truncate">{recruiter.company}</p>
            )}
            {recruiter.title && (
              <p className="text-sm text-muted-foreground truncate">{recruiter.title}</p>
            )}
          </div>
          <Badge className={`${responseRateColor.bg} ${responseRateColor.text} border-0 whitespace-nowrap`}>
            {responseRate}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Specialization */}
        {recruiter.specialization && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {recruiter.specialization}
            </Badge>
          </div>
        )}

        {/* Response Rate Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Response Rate
            </span>
            <span className="font-semibold">{responseRate}%</span>
          </div>
          <Progress
            value={responseRate}
            className="h-2"
          />
        </div>

        {/* Interaction Count & Last Contact */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Interactions</p>
            <p className="text-lg font-semibold">{recruiter.interaction_count || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Last Contact</p>
            <p className="text-sm font-semibold">
              {lastContactDate ? format(lastContactDate, "MMM d") : "Never"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          {recruiter.email && (
            <a href={`mailto:${recruiter.email}`}>
              <Button variant="outline" size="sm" className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </a>
          )}
          <Button variant="outline" size="sm" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        </div>

        {/* Interaction Log */}
        {recruiter.interaction_log && recruiter.interaction_log.length > 0 && (
          <Collapsible
            open={expanded}
            onOpenChange={() => onToggleExpand(recruiter.contact_id)}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-xs font-medium">
                  Interaction History ({recruiter.interaction_log.length})
                </span>
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {recruiter.interaction_log.map((log, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-muted p-2 text-xs border-l-2 border-primary"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {log.type}
                    </Badge>
                    <span className="text-muted-foreground">
                      {format(parseISO(log.date), "MMM d, yyyy")}
                    </span>
                  </div>
                  {log.subject && (
                    <p className="font-semibold text-xs mb-1">{log.subject}</p>
                  )}
                  {log.body && (
                    <p className="text-muted-foreground line-clamp-2">{log.body}</p>
                  )}
                  {log.status && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {log.status}
                    </Badge>
                  )}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Recommended Outreach */}
        {recruiter.recommended_outreach && (
          <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
            <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">Recommended Outreach</p>
            <p className="text-blue-800 dark:text-blue-400">{recruiter.recommended_outreach}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Import MessageCircle from lucide (not in original, but needed for the button)
import { MessageCircle } from "lucide-react"

export default function RecruitersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [filterSpecialization, setFilterSpecialization] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)

  const { data: response, isLoading } = useRecruiters({
    search: searchQuery || undefined,
    specialization: filterSpecialization || undefined,
    page: currentPage,
    per_page: 12,
  })

  const recruiters = response?.recruiters ?? []
  const total = response?.total ?? 0
  const perPage = response?.per_page ?? 12
  const totalPages = Math.ceil(total / perPage)

  // Get unique specializations for filter
  const specializations = useMemo(() => {
    const specs = new Set<string>()
    recruiters.forEach((r) => {
      if (r.specialization) specs.add(r.specialization)
    })
    return Array.from(specs).sort()
  }, [recruiters])

  // Filter and sort recruiters
  const filteredRecruiters = useMemo(() => {
    let filtered = [...recruiters]

    // Sort by response rate (highest first)
    filtered.sort((a, b) => (b.response_rate || 0) - (a.response_rate || 0))

    return filtered
  }, [recruiters])

  const handleToggleExpand = (recruiterId: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(recruiterId)) {
      newExpanded.delete(recruiterId)
    } else {
      newExpanded.add(recruiterId)
    }
    setExpandedIds(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recruiters</h1>
          <p className="text-muted-foreground">
            Manage recruiter relationships and track interactions
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Recruiter
        </Button>
      </div>

      {/* Search & Filter Section */}
      <div className="space-y-4 bg-card p-4 rounded-lg border">
        <div>
          <label className="text-sm font-medium mb-2 block">Search by name or company</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search recruiters..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
        </div>

        {specializations.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Filter by specialization</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!filterSpecialization ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterSpecialization("")
                  setCurrentPage(1)
                }}
              >
                All
              </Button>
              {specializations.map((spec) => (
                <Button
                  key={spec}
                  variant={filterSpecialization === spec ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setFilterSpecialization(spec)
                    setCurrentPage(1)
                  }}
                >
                  {spec}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recruiters Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecruiterCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredRecruiters.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredRecruiters.length} of {total} recruiters
            </p>
            {total > perPage && (
              <Badge variant="outline">
                Page {currentPage} of {totalPages}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecruiters.map((recruiter) => (
              <RecruiterCard
                key={recruiter.contact_id}
                recruiter={recruiter}
                expanded={expandedIds.has(recruiter.contact_id)}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground space-y-2">
              <User className="w-12 h-12 mx-auto opacity-50" />
              {searchQuery || filterSpecialization ? (
                <>
                  <p>No recruiters match your search</p>
                  <p className="text-sm">
                    Try adjusting your filters or search terms
                  </p>
                </>
              ) : (
                <>
                  <p>No recruiters added yet</p>
                  <p className="text-sm">Start building your recruiter network</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {recruiters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recruiter Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Recruiters</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Response Rate</p>
                <p className="text-2xl font-bold">
                  {recruiters.length > 0
                    ? Math.round(
                      recruiters.reduce((sum, r) => sum + (r.response_rate || 0), 0) /
                      recruiters.length
                    )
                    : 0}
                  %
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Top Responders</p>
                <p className="text-2xl font-bold">
                  {recruiters.filter((r) => (r.response_rate || 0) > 70).length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Interactions</p>
                <p className="text-2xl font-bold">
                  {recruiters.reduce((sum, r) => sum + (r.interaction_count || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
