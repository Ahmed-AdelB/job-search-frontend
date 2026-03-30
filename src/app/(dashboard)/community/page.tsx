"use client";

/**
 * Community Page - Track and discover job seeker communities
 * Author: Ahmed Adel Bakr Alderai
 */

import { motion } from "motion/react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UsersRound,
  Search,
  ExternalLink,
  Star,
  Plus,
  Trash2,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import type {
  Community,
  CommunityRecommendation,
  CommunitiesResponse,
  CommunityRecommendationsResponse,
} from "@/types/api";

const PLATFORM_COLORS: Record<string, string> = {
  reddit: "bg-orange-600",
  discord: "bg-indigo-600",
  slack: "bg-green-600",
  linkedin_group: "bg-blue-600",
};

const PLATFORM_LABELS: Record<string, string> = {
  reddit: "Reddit",
  discord: "Discord",
  slack: "Slack",
  linkedin_group: "LinkedIn Group",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function CommunityPage() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground">
          Track and discover job seeker communities across platforms
        </p>
      </div>

      <Tabs defaultValue="tracked">
        <TabsList>
          <TabsTrigger value="tracked">
            <UsersRound className="w-4 h-4 me-2" />
            Tracked Communities
          </TabsTrigger>
          <TabsTrigger value="discover">
            <Lightbulb className="w-4 h-4 me-2" />
            Discover
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracked" className="mt-6">
          <TrackedTab />
        </TabsContent>
        <TabsContent value="discover" className="mt-6">
          <DiscoverTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function TrackedTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: () => apiGet<CommunitiesResponse>("/api/community/communities"),
  });

  const untrackMutation = useMutation({
    mutationFn: (id: string) => apiDelete<{ status: string }>(`/api/community/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["communities"] }),
  });

  const communities = (data?.communities ?? []).filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.platform.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="font-display text-lg">Your Communities</CardTitle>
          <CardDescription>{communities.length} tracked communities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : communities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UsersRound className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No communities tracked yet. Check the Discover tab for recommendations.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="table-row-hover">
                    <TableHead>Name</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Relevance</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communities.map((community, index) => (
                    <motion.tr
                      key={community.id}
                      className="table-row-hover"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 120,
                        damping: 20,
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-medium">{community.name}</span>
                          {community.url && (
                            <a
                              href={community.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {community.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {community.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`bg-gradient-to-r ${
                          community.platform === "reddit"
                            ? "from-orange-500/20 to-orange-400/20 text-orange-400"
                            : community.platform === "discord"
                            ? "from-indigo-500/20 to-indigo-400/20 text-indigo-400"
                            : community.platform === "slack"
                            ? "from-green-500/20 to-green-400/20 text-green-400"
                            : "from-blue-500/20 to-blue-400/20 text-blue-400"
                        }`}>
                          {PLATFORM_LABELS[community.platform] ?? community.platform}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-display">
                        {community.members_count?.toLocaleString() ?? "—"}
                      </TableCell>
                      <TableCell>
                        {community.relevance_score != null ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500" />
                            <span className="text-sm">{community.relevance_score}%</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => untrackMutation.mutate(community.id)}
                          disabled={untrackMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 me-1" />
                          Remove
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DiscoverTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["communities", "recommendations"],
    queryFn: () =>
      apiGet<CommunityRecommendationsResponse>("/api/community/recommendations"),
    staleTime: 1000 * 60 * 10,
  });

  const trackMutation = useMutation({
    mutationFn: (rec: CommunityRecommendation) =>
      apiPost<{ status: string }>("/api/community/communities", {
        name: rec.name,
        platform: rec.platform,
        url: rec.url,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["communities", "recommendations"] });
    },
  });

  const recommendations = data?.recommendations ?? [];

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Recommended Communities
        </CardTitle>
        <CardDescription>
          AI-suggested communities based on your profile and target roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recommendations available. Complete your profile to get suggestions.</p>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {recommendations.map((rec) => (
              <motion.div
                key={rec.id}
                className="flex items-start justify-between p-4 rounded-lg border"
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.15)",
                  transition: {
                    type: "spring",
                    stiffness: 120,
                    damping: 15,
                  },
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-medium">{rec.name}</span>
                    <Badge className={`bg-gradient-to-r ${
                          rec.platform === "reddit"
                            ? "from-orange-500/20 to-orange-400/20 text-orange-400"
                            : rec.platform === "discord"
                            ? "from-indigo-500/20 to-indigo-400/20 text-indigo-400"
                            : rec.platform === "slack"
                            ? "from-green-500/20 to-green-400/20 text-green-400"
                            : "from-blue-500/20 to-blue-400/20 text-blue-400"
                        }`}>
                      {PLATFORM_LABELS[rec.platform] ?? rec.platform}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" />
                      {rec.relevance_score}% match
                    </span>
                    {rec.estimated_members && (
                      <span>{rec.estimated_members.toLocaleString()} members</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => trackMutation.mutate(rec)}
                  disabled={trackMutation.isPending}
                >
                  <Plus className="w-4 h-4 me-1" />
                  Track
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
