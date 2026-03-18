/**
 * Community Page
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState } from "react"
import {
  useCommunities,
  useCommunityRecommendations,
  useTrackCommunity,
  useUntrackCommunity,
  useAddRecommendedCommunity,
} from "@/hooks"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CardSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { StatSkeleton } from "@/components/shared/loading-skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Reddit,
  MessageSquare,
  Users,
  ExternalLink,
  Loader2,
  Lightbulb,
  Check,
  Plus,
} from "lucide-react"
import type { Community, CommunityPlatform, CommunityRecommendation } from "@/types/api"

// Platform icon mapping
function getPlatformIcon(platform: CommunityPlatform) {
  switch (platform) {
    case "reddit":
      return Reddit
    case "discord":
      return MessageSquare
    case "slack":
      return MessageSquare
    case "linkedin_group":
      return Users
  }
}

// Platform color mapping
function getPlatformColor(platform: CommunityPlatform) {
  switch (platform) {
    case "reddit":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
    case "discord":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
    case "slack":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
    case "linkedin_group":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
  }
}

// Platform name mapping
function getPlatformName(platform: CommunityPlatform): string {
  switch (platform) {
    case "reddit":
      return "Reddit"
    case "discord":
      return "Discord"
    case "slack":
      return "Slack"
    case "linkedin_group":
      return "LinkedIn Group"
  }
}

interface CommunityCardProps {
  community: Community
  onTrackChange: (tracked: boolean) => void
  isUpdating: boolean
}

function CommunityCard({
  community,
  onTrackChange,
  isUpdating,
}: CommunityCardProps) {
  const PlatformIcon = getPlatformIcon(community.platform)
  const platformColor = getPlatformColor(community.platform)

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <PlatformIcon className="h-5 w-5" />
            <Badge className={platformColor}>
              {getPlatformName(community.platform)}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg">{community.name}</h3>
          {community.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {community.description}
            </p>
          )}
        </div>
        <Button
          variant={community.is_tracked ? "default" : "outline"}
          size="sm"
          onClick={() => onTrackChange(!community.is_tracked)}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : community.is_tracked ? (
            <>
              <Check className="mr-1 h-4 w-4" />
              Tracking
            </>
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" />
              Track
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {community.members_count !== undefined && (
          <div>
            <p className="text-muted-foreground">Members</p>
            <p className="font-medium">
              {community.members_count.toLocaleString()}
            </p>
          </div>
        )}
        {community.relevance_score !== undefined && (
          <div>
            <p className="text-muted-foreground">Relevance</p>
            <p className="font-medium">{community.relevance_score}%</p>
          </div>
        )}
      </div>

      {community.url && (
        <a
          href={community.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-primary hover:underline text-sm"
        >
          Visit Community
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      )}
    </Card>
  )
}

interface RecommendationCardProps {
  recommendation: CommunityRecommendation
  onAdd: () => void
  isAdding: boolean
}

function RecommendationCard({
  recommendation,
  onAdd,
  isAdding,
}: RecommendationCardProps) {
  const PlatformIcon = getPlatformIcon(recommendation.platform)
  const platformColor = getPlatformColor(recommendation.platform)

  return (
    <Card className="p-6 space-y-4 border-primary/50 bg-primary/5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <PlatformIcon className="h-5 w-5" />
            <Badge className={platformColor}>
              {getPlatformName(recommendation.platform)}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg">{recommendation.name}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {recommendation.reason}
          </p>
        </div>
        <Button
          onClick={onAdd}
          disabled={isAdding}
          size="sm"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Relevance</p>
          <p className="font-medium">{recommendation.relevance_score}%</p>
        </div>
        {recommendation.estimated_members && (
          <div>
            <p className="text-muted-foreground">Est. Members</p>
            <p className="font-medium">
              {recommendation.estimated_members.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

interface PlatformTabProps {
  platform: CommunityPlatform | "all"
  communities: Community[] | undefined
  isLoading: boolean
}

function PlatformTab({
  platform,
  communities,
  isLoading,
}: PlatformTabProps) {
  const trackCommunity = useTrackCommunity()
  const untrackCommunity = useUntrackCommunity()
  const [trackingId, setTrackingId] = useState<string | null>(null)

  const filteredCommunities = communities?.filter((c) =>
    platform === "all" ? true : c.platform === platform
  ) || []

  const handleTrackChange = (community: Community, tracked: boolean) => {
    setTrackingId(community.id)
    const mutation = tracked ? trackCommunity : untrackCommunity

    mutation.mutate(community.id, {
      onSettled: () => {
        setTrackingId(null)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!filteredCommunities || filteredCommunities.length === 0) {
    return (
      <EmptyState
        title={`No ${platform === "all" ? "" : platform} communities found`}
        description="Start tracking communities to stay engaged with job search communities."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredCommunities.map((community) => (
        <CommunityCard
          key={community.id}
          community={community}
          onTrackChange={(tracked) => handleTrackChange(community, tracked)}
          isUpdating={trackingId === community.id}
        />
      ))}
    </div>
  )
}

export default function CommunityPage() {
  const { data, isLoading } = useCommunities()
  const { data: recommendationsData, isLoading: isLoadingRecommendations } =
    useCommunityRecommendations()
  const addCommunity = useAddRecommendedCommunity()
  const [selectedPlatform, setSelectedPlatform] = useState<CommunityPlatform | "all">("all")
  const [showRecommendationsDialog, setShowRecommendationsDialog] = useState(false)
  const [addingRecommendationId, setAddingRecommendationId] = useState<string | null>(null)

  const communities = data?.communities || []
  const recommendations = recommendationsData?.recommendations || []
  const trackedCount = communities.filter((c) => c.is_tracked).length

  const handleAddRecommendation = (recommendation: CommunityRecommendation) => {
    setAddingRecommendationId(recommendation.id)
    addCommunity.mutate(recommendation, {
      onSettled: () => {
        setAddingRecommendationId(null)
      },
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground">
          Discover and track professional communities relevant to your job search
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Communities Tracked
            </p>
            <p className="text-3xl font-bold">{trackedCount}</p>
            <p className="text-xs text-muted-foreground">
              Active community memberships
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Recommendations
            </p>
            <p className="text-3xl font-bold">{recommendations.length}</p>
            <Button
              variant="link"
              size="sm"
              className="pl-0 text-primary"
              onClick={() => setShowRecommendationsDialog(true)}
            >
              View suggestions →
            </Button>
          </div>
        </Card>
      </div>

      {/* Communities by Platform */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Communities</h2>
        </div>

        <Tabs value={selectedPlatform} onValueChange={(val) => setSelectedPlatform(val as CommunityPlatform | "all")}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="reddit">Reddit</TabsTrigger>
            <TabsTrigger value="discord">Discord</TabsTrigger>
            <TabsTrigger value="slack">Slack</TabsTrigger>
            <TabsTrigger value="linkedin_group">LinkedIn</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPlatform} className="mt-6">
            <PlatformTab
              platform={selectedPlatform}
              communities={communities}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Recommendations Dialog */}
      <Dialog open={showRecommendationsDialog} onOpenChange={setShowRecommendationsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recommended Communities</DialogTitle>
            <DialogDescription>
              Based on your profile, we recommend joining these communities
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto space-y-4 py-4">
            {isLoadingRecommendations ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <EmptyState title="No recommendations available yet" />
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onAdd={() => handleAddRecommendation(rec)}
                    isAdding={addingRecommendationId === rec.id}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
