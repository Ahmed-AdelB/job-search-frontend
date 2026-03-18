"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CardSkeleton } from "@/components/shared/loading-skeleton"
import { usePrepNotes, useRegeneratePrepNotes } from "@/hooks/use-interviews"
import { RefreshCw } from "lucide-react"

export interface PrepNotesProps {
  interviewId: string
}

function parsePrepNotes(text: string): {
  companyResearch?: string
  commonQuestions?: string
  talkingPoints?: string
  questionsToAsk?: string
  raw: string
} {
  // Try to parse structured sections from the prep notes
  const sections = {
    companyResearch: "",
    commonQuestions: "",
    talkingPoints: "",
    questionsToAsk: "",
    raw: text,
  }

  // Check for section headers (case-insensitive)
  const companyMatch = text.match(/(?:company research|about the company)([\s\S]*?)(?=(?:common questions|interview questions|your talking|questions to ask|$))/i)
  if (companyMatch) sections.companyResearch = companyMatch[1].trim()

  const questionsMatch = text.match(/(?:common questions|interview questions)([\s\S]*?)(?=(?:your talking|questions to ask|$))/i)
  if (questionsMatch) sections.commonQuestions = questionsMatch[1].trim()

  const talkingMatch = text.match(/(?:your talking points|talking points|your strengths)([\s\S]*?)(?=(?:questions to ask|$))/i)
  if (talkingMatch) sections.talkingPoints = talkingMatch[1].trim()

  const askMatch = text.match(/(?:questions to ask|ask them)([\s\S]*?)$/i)
  if (askMatch) sections.questionsToAsk = askMatch[1].trim()

  return sections
}

export function PrepNotes({ interviewId }: PrepNotesProps) {
  const { data, isLoading, error } = usePrepNotes(interviewId)
  const regenerateMutation = useRegeneratePrepNotes()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <p className="text-sm text-red-700 dark:text-red-300">
          Failed to load prep notes. Please try again.
        </p>
      </Card>
    )
  }

  if (!data?.prep_notes) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No prep notes generated yet.</p>
          <Button
            onClick={() => regenerateMutation.mutate(interviewId)}
            disabled={regenerateMutation.isPending}
          >
            {regenerateMutation.isPending ? "Generating..." : "Generate Prep Notes"}
          </Button>
        </div>
      </Card>
    )
  }

  const sections = parsePrepNotes(data.prep_notes)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Interview Preparation Notes</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => regenerateMutation.mutate(interviewId)}
          disabled={regenerateMutation.isPending}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {regenerateMutation.isPending ? "Regenerating..." : "Regenerate"}
        </Button>
      </div>

      {sections.companyResearch && (
        <Card className="p-4">
          <h4 className="font-semibold text-base mb-2">Company Research</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {sections.companyResearch}
            </p>
          </div>
        </Card>
      )}

      {sections.commonQuestions && (
        <Card className="p-4">
          <h4 className="font-semibold text-base mb-2">Common Interview Questions</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {sections.commonQuestions}
            </p>
          </div>
        </Card>
      )}

      {sections.talkingPoints && (
        <Card className="p-4">
          <h4 className="font-semibold text-base mb-2">Your Talking Points</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {sections.talkingPoints}
            </p>
          </div>
        </Card>
      )}

      {sections.questionsToAsk && (
        <Card className="p-4">
          <h4 className="font-semibold text-base mb-2">Questions to Ask</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {sections.questionsToAsk}
            </p>
          </div>
        </Card>
      )}

      {!sections.companyResearch &&
        !sections.commonQuestions &&
        !sections.talkingPoints &&
        !sections.questionsToAsk && (
          <Card className="p-4">
            <div className="whitespace-pre-wrap text-sm text-muted-foreground">
              {sections.raw}
            </div>
          </Card>
        )}
    </div>
  )
}
