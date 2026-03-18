"use client"

import { useState } from "react"
import { format, isPast, isSameDay } from "date-fns"
import { Calendar, Clock, MapPin, Video, Phone, MapPinIcon, MoreHorizontal } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import type { Interview } from "@/types/api"
import { useMarkCompleted, useDeleteInterview } from "@/hooks/use-interviews"

export interface InterviewListProps {
  interviews: Interview[]
  isLoading?: boolean
  onPrepNotesClick?: (interviewId: string) => void
  onEditClick?: (interview: Interview) => void
  onRescheduleClick?: (interview: Interview) => void
}

function getInterviewIcon(type: Interview["type"]) {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4" />
    case "phone":
      return <Phone className="h-4 w-4" />
    case "onsite":
      return <MapPinIcon className="h-4 w-4" />
    default:
      return <Calendar className="h-4 w-4" />
  }
}

function isInterviewToday(scheduledAt: string): boolean {
  return isSameDay(new Date(scheduledAt), new Date())
}

function isInterviewUpcoming(scheduledAt: string): boolean {
  return !isPast(new Date(scheduledAt))
}

export function InterviewList({
  interviews,
  isLoading,
  onPrepNotesClick,
  onEditClick,
  onRescheduleClick,
}: InterviewListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const markCompletedMutation = useMarkCompleted()
  const deleteInterviewMutation = useDeleteInterview()

  if (!isLoading && interviews.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No interviews scheduled"
        description="Schedule your first interview to get started"
        action={{
          label: "Schedule Interview",
          onClick: () => console.log("Open schedule dialog"),
        }}
      />
    )
  }

  // Sort interviews by date
  const sortedInterviews = [...interviews].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )

  return (
    <div className="space-y-4">
      {sortedInterviews.map((interview) => {
        const isExpanded = expandedId === interview.interview_id
        const isToday = isInterviewToday(interview.scheduled_at)
        const isUpcoming = isInterviewUpcoming(interview.scheduled_at)
        const interviewDate = new Date(interview.scheduled_at)
        const dateLabel = isToday ? "Today" : format(interviewDate, "MMM d, yyyy")
        const timeLabel = format(interviewDate, "h:mm a")
        const interviewerName = interview.interviewer_names?.[0]

        return (
          <Card
            key={interview.interview_id}
            className={`overflow-hidden transition-all ${
              isToday ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950" : ""
            }`}
          >
            <div
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : interview.interview_id)}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Application details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg truncate">
                      Interview {interview.interview_id.substring(0, 8)}
                    </h3>
                    <StatusBadge status={interview.status} className="text-xs" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Application {interview.application_id.substring(0, 8)}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      {getInterviewIcon(interview.type)}
                      <span className="capitalize">{interview.type}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Date, Time, Actions */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {dateLabel}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="h-4 w-4" />
                      {timeLabel}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isUpcoming && interview.status === "scheduled" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onPrepNotesClick?.(interview.interview_id)}
                          >
                            View Prep Notes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditClick?.(interview)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onRescheduleClick?.(interview)}
                          >
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => markCompletedMutation.mutate(interview.interview_id)}
                          >
                            Mark Completed
                          </DropdownMenuItem>
                        </>
                      )}
                      {!isUpcoming && interview.status === "scheduled" && (
                        <DropdownMenuItem
                          onClick={() => markCompletedMutation.mutate(interview.interview_id)}
                        >
                          Mark Completed
                        </DropdownMenuItem>
                      )}
                      {interview.status === "completed" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onPrepNotesClick?.(interview.interview_id)}
                          >
                            View Prep Notes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditClick?.(interview)}
                          >
                            Edit Notes
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteInterviewMutation.mutate(interview.interview_id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Date/Time summary line */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t">
                {interview.duration_minutes && (
                  <span>{interview.duration_minutes} mins</span>
                )}
                {interview.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {interview.location}
                  </div>
                )}
                {interview.meeting_url && (
                  <a
                    href={interview.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t bg-muted/30 p-4 space-y-3">
                {interviewerName && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Interviewer(s)</p>
                    <p className="text-sm">{interview.interviewer_names?.join(", ")}</p>
                  </div>
                )}

                {interview.notes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{interview.notes}</p>
                  </div>
                )}

                {interview.status === "completed" && interview.feedback && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Feedback</p>
                    <p className="text-sm whitespace-pre-wrap">{interview.feedback}</p>
                  </div>
                )}

                {interview.status === "completed" && interview.rating && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Rating</p>
                    <p className="text-sm">{"⭐".repeat(interview.rating)}</p>
                  </div>
                )}

                {!interview.notes && !interviewerName && (
                  <p className="text-sm text-muted-foreground italic">No additional details</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPrepNotesClick?.(interview.interview_id)}
                  >
                    View Prep Notes
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
