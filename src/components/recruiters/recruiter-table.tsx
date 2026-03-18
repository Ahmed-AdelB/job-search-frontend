"use client"

import { useState } from "react"
import { format } from "date-fns"
import { MessageSquare, MoreHorizontal, ExternalLink } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import type { Recruiter } from "@/types/api"
import { Users } from "lucide-react"

export interface RecruiterTableProps {
  recruiters: Recruiter[]
  isLoading?: boolean
  onSelectRecruiter?: (recruiter: Recruiter) => void
  onSendMessage?: (recruiter: Recruiter) => void
}

function getResponseRateBadge(rate?: number) {
  if (!rate) return null

  if (rate >= 0.8) {
    return <Badge variant="default">High ({(rate * 100).toFixed(0)}%)</Badge>
  } else if (rate >= 0.5) {
    return <Badge variant="secondary">Medium ({(rate * 100).toFixed(0)}%)</Badge>
  } else {
    return <Badge variant="outline">Low ({(rate * 100).toFixed(0)}%)</Badge>
  }
}

export function RecruiterTable({
  recruiters,
  isLoading,
  onSelectRecruiter,
  onSendMessage,
}: RecruiterTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  if (!isLoading && recruiters.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No recruiters found"
        description="Add recruiters to your network to start outreach"
      />
    )
  }

  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleAllSelection = () => {
    if (selectedIds.size === recruiters.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(recruiters.map((r) => r.contact_id)))
    }
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={
                  selectedIds.size > 0 &&
                  selectedIds.size === recruiters.length
                }
                onChange={toggleAllSelection}
                className="rounded border-gray-300"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Response Rate</TableHead>
            <TableHead>Interactions</TableHead>
            <TableHead>Last Contact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recruiters.map((recruiter) => (
            <TableRow
              key={recruiter.contact_id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedIds.has(recruiter.contact_id)}
                  onChange={() => toggleRowSelection(recruiter.contact_id)}
                  className="rounded border-gray-300"
                />
              </TableCell>
              <TableCell
                className="font-medium cursor-pointer"
                onClick={() => onSelectRecruiter?.(recruiter)}
              >
                {recruiter.name}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {recruiter.company || "-"}
              </TableCell>
              <TableCell className="text-sm">
                {recruiter.specialization ? (
                  <Badge variant="outline" className="capitalize">
                    {recruiter.specialization}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {getResponseRateBadge(recruiter.response_rate)}
              </TableCell>
              <TableCell className="text-sm text-center">
                {recruiter.interaction_count || 0}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {recruiter.last_contact
                  ? format(new Date(recruiter.last_contact), "MMM d, yyyy")
                  : "Never"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onSelectRecruiter?.(recruiter)}
                    >
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onSendMessage?.(recruiter)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    {recruiter.linkedin_url && (
                      <DropdownMenuItem asChild>
                        <a
                          href={recruiter.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on LinkedIn
                        </a>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
