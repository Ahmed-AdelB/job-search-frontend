"use client"

import { format } from "date-fns"
import { Mail, Phone, MapPin, Link as LinkIcon, MessageSquare, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CardSkeleton } from "@/components/shared/loading-skeleton"
import { useRecruiter, useRecruiterRecommendations } from "@/hooks/use-recruiters"
import type { Recruiter } from "@/types/api"

export interface RecruiterDetailProps {
  linkedinId: string
  onClose?: () => void
  onSendMessage?: (recruiter: Recruiter) => void
}

export function RecruiterDetail({
  linkedinId,
  onClose,
  onSendMessage,
}: RecruiterDetailProps) {
  const { data: recruiter, isLoading: isLoadingRecruiter } = useRecruiter(linkedinId)
  const { data: recommendations, isLoading: isLoadingRecs } = useRecruiterRecommendations(linkedinId)

  if (isLoadingRecruiter) {
    return <CardSkeleton />
  }

  if (!recruiter) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Recruiter not found</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{recruiter.name}</h2>
          {recruiter.title && (
            <p className="text-muted-foreground">{recruiter.title}</p>
          )}
          {recruiter.company && (
            <p className="text-sm text-muted-foreground">{recruiter.company}</p>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Contact Information */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Contact Information</h3>

        {recruiter.email && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a
              href={`mailto:${recruiter.email}`}
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {recruiter.email}
            </a>
          </div>
        )}

        {recruiter.phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a
              href={`tel:${recruiter.phone}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {recruiter.phone}
            </a>
          </div>
        )}

        {recruiter.linkedin_url && (
          <div className="flex items-center gap-3">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <a
              href={recruiter.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline truncate"
            >
              LinkedIn Profile
            </a>
          </div>
        )}
      </Card>

      {/* Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Response Rate</p>
            <p className="text-lg font-bold">
              {recruiter.response_rate
                ? `${(recruiter.response_rate * 100).toFixed(0)}%`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Interactions
            </p>
            <p className="text-lg font-bold">{recruiter.interaction_count || 0}</p>
          </div>
          {recruiter.last_contact && (
            <div className="col-span-2">
              <p className="text-xs font-medium text-muted-foreground">
                Last Contact
              </p>
              <p className="text-sm">
                {format(new Date(recruiter.last_contact), "PPP")}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Specialization */}
      {recruiter.specialization && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-2">Specialization</h3>
          <Badge variant="secondary" className="capitalize">
            {recruiter.specialization}
          </Badge>
        </Card>
      )}

      {/* Notes */}
      {recruiter.notes && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {recruiter.notes}
          </p>
        </Card>
      )}

      {/* Recommended Outreach */}
      {!isLoadingRecs && recommendations?.recommended_outreach && (
        <Card className="p-4 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <h3 className="font-semibold text-sm mb-2">Recommended Outreach</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {recommendations.recommended_outreach}
          </p>
        </Card>
      )}

      {/* Interaction Log */}
      {recruiter.interaction_log && recruiter.interaction_log.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Interaction History</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recruiter.interaction_log.map((log, index) => (
              <div
                key={index}
                className="flex items-start justify-between text-sm border-l-2 border-muted pl-3 py-1"
              >
                <div className="flex-1">
                  <p className="font-medium capitalize">
                    {log.type === "email" ? "Email" : log.type}
                  </p>
                  {log.subject && (
                    <p className="text-xs text-muted-foreground">{log.subject}</p>
                  )}
                  {log.body && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {log.body}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(log.date), "PPp")}
                  </p>
                </div>
                {log.status && (
                  <Badge variant="outline" className="text-xs capitalize ml-2">
                    {log.status}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Button */}
      {recruiter && (
        <Button
          onClick={() => onSendMessage?.(recruiter)}
          className="w-full"
          size="lg"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Send Message
        </Button>
      )}
    </div>
  )
}
