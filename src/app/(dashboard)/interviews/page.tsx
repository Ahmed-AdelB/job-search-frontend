"use client"

import { useState, useMemo } from "react"
import { format, isPast, parseISO } from "date-fns"
import { Calendar, Plus, Clock, MapPin, Video, Phone, User, Eye, ExternalLink, Edit2, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useInterviews, useDeleteInterview } from "@/hooks/use-interviews"
import type { Interview } from "@/types/api"

// Interview type badge configuration
const interviewTypeBadgeConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; bgClass: string; textColor: string }> = {
  phone: { variant: "default", bgClass: "bg-blue-100 dark:bg-blue-950", textColor: "text-blue-700 dark:text-blue-300" },
  video: { variant: "default", bgClass: "bg-purple-100 dark:bg-purple-950", textColor: "text-purple-700 dark:text-purple-300" },
  onsite: { variant: "default", bgClass: "bg-orange-100 dark:bg-orange-950", textColor: "text-orange-700 dark:text-orange-300" },
  technical: { variant: "destructive", bgClass: "bg-red-100 dark:bg-red-950", textColor: "text-red-700 dark:text-red-300" },
  behavioral: { variant: "default", bgClass: "bg-yellow-100 dark:bg-yellow-950", textColor: "text-yellow-700 dark:text-yellow-300" },
  final: { variant: "default", bgClass: "bg-emerald-100 dark:bg-emerald-950", textColor: "text-emerald-700 dark:text-emerald-300" },
}

// Status badge configuration
const statusBadgeConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  scheduled: { variant: "default", label: "Scheduled" },
  completed: { variant: "secondary", label: "Completed" },
  cancelled: { variant: "outline", label: "Cancelled" },
  "no-show": { variant: "destructive", label: "No Show" },
}

// Interview card skeleton loader
function InterviewCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

// Interview card component
interface InterviewCardProps {
  interview: Interview
  onDelete: () => void
  isDeletingId: string | null
}

function InterviewCard({ interview, onDelete, isDeletingId }: InterviewCardProps) {
  const scheduledDate = parseISO(interview.scheduled_at)
  const isPastInterview = isPast(scheduledDate)
  const typeConfig = interviewTypeBadgeConfig[interview.type] || interviewTypeBadgeConfig.phone
  const statusConfig = statusBadgeConfig[interview.status] || statusBadgeConfig.scheduled

  const getInterviewIcon = () => {
    switch (interview.type) {
      case "phone":
        return <Phone className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "onsite":
        return <MapPin className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold truncate">Interview</h3>
              <Badge
                className={`${typeConfig.bgClass} ${typeConfig.textColor} border-0`}
              >
                {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(scheduledDate, "MMMM d, yyyy")} at {format(scheduledDate, "h:mm a")}
            </p>
          </div>
          <Badge variant={statusConfig.variant} className="whitespace-nowrap">
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {interview.interviewer_names && interview.interviewer_names.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {interview.interviewer_names.join(", ")}
              </span>
            </div>
          )}

          {interview.duration_minutes && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{interview.duration_minutes} minutes</span>
            </div>
          )}

          {interview.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{interview.location}</span>
            </div>
          )}

          {interview.meeting_url && (
            <div className="flex items-center gap-2 text-sm">
              <Video className="w-4 h-4 text-muted-foreground" />
              <a
                href={interview.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                Join meeting <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {interview.notes && (
            <div className="mt-3 p-2 bg-muted rounded text-sm">
              <p className="line-clamp-2 text-muted-foreground">{interview.notes}</p>
            </div>
          )}

          {interview.feedback && (
            <div className="mt-3 p-2 bg-green-50 dark:bg-green-950 rounded text-sm">
              <p className="font-medium text-green-700 dark:text-green-300 mb-1">Feedback</p>
              <p className="line-clamp-2 text-green-600 dark:text-green-400">{interview.feedback}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Eye className="w-4 h-4 mr-2" />
            View Notes
          </Button>

          {interview.meeting_url && (
            <a href={interview.meeting_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Join
              </Button>
            </a>
          )}

          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Edit2 className="w-4 h-4 mr-2" />
            Reschedule
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Interview</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this interview? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Interview</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  disabled={isDeletingId === interview.interview_id}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeletingId === interview.interview_id ? "Cancelling..." : "Cancel Interview"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}

export default function InterviewsPage() {
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const { data: response, isLoading } = useInterviews()
  const { mutate: deleteInterview } = useDeleteInterview()

  const interviews = response?.interviews ?? []

  // Separate interviews into upcoming and past
  const { upcoming, past } = useMemo(() => {
    return interviews.reduce(
      (acc, interview) => {
        if (isPast(parseISO(interview.scheduled_at))) {
          acc.past.push(interview)
        } else {
          acc.upcoming.push(interview)
        }
        return acc
      },
      { upcoming: [] as Interview[], past: [] as Interview[] }
    )
  }, [interviews])

  // Sort upcoming by date (earliest first)
  upcoming.sort((a, b) => parseISO(a.scheduled_at).getTime() - parseISO(b.scheduled_at).getTime())

  // Sort past by date (most recent first)
  past.sort((a, b) => parseISO(b.scheduled_at).getTime() - parseISO(a.scheduled_at).getTime())

  const handleDelete = (interviewId: string) => {
    setIsDeletingId(interviewId)
    deleteInterview(interviewId, {
      onSettled: () => {
        setIsDeletingId(null)
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">
            Schedule and prepare for your upcoming interviews
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {/* Upcoming Interviews Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Upcoming Interviews</h2>
          {upcoming.length > 0 && (
            <Badge variant="secondary">{upcoming.length}</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <InterviewCardSkeleton key={i} />
            ))}
          </div>
        ) : upcoming.length > 0 ? (
          <div className="grid gap-4">
            {upcoming.map((interview) => (
              <InterviewCard
                key={interview.interview_id}
                interview={interview}
                onDelete={() => handleDelete(interview.interview_id)}
                isDeletingId={isDeletingId}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground space-y-2">
                <Calendar className="w-12 h-12 mx-auto opacity-50" />
                <p>No upcoming interviews scheduled</p>
                <p className="text-sm">Schedule an interview to get started</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Interviews Section */}
      {past.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Past Interviews</h2>
            <Badge variant="outline">{past.length}</Badge>
          </div>

          <div className="grid gap-4">
            {past.map((interview) => (
              <InterviewCard
                key={interview.interview_id}
                interview={interview}
                onDelete={() => handleDelete(interview.interview_id)}
                isDeletingId={isDeletingId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {interviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interview Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Interviews</p>
                <p className="text-2xl font-bold">{interviews.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{upcoming.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {interviews.filter((i) => i.status === "completed").length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {interviews.length > 0
                    ? Math.round(
                      (interviews.filter((i) => i.status === "completed").length /
                        interviews.length) *
                      100
                    )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
