"use client";

/**
 * Visa Sponsorship Analysis Page
 * Author: Ahmed Adel Bakr Alderai
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Globe,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import type { VisaScore } from "@/types/api";

const LIKELIHOOD_CONFIG: Record<string, { color: string; badge: string; icon: React.ElementType }> = {
  high: { color: "text-green-600", badge: "bg-green-600", icon: TrendingUp },
  medium: { color: "text-amber-600", badge: "bg-amber-500", icon: Minus },
  low: { color: "text-red-600", badge: "bg-red-600", icon: TrendingDown },
};

export default function VisaPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["intelligence", "visa"],
    queryFn: () => apiGet<{ scores: VisaScore[] }>("/api/v1/visa/scores"),
    staleTime: 5 * 60 * 1000,
  });

  const scores = data?.scores ?? [];
  const highCount = scores.filter((s) => s.sponsorship_likelihood === "high").length;
  const mediumCount = scores.filter((s) => s.sponsorship_likelihood === "medium").length;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.eligibility_score, 0) / scores.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/intelligence">
            <ArrowLeft className="w-4 h-4 me-1" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visa Sponsorship</h1>
          <p className="text-muted-foreground">
            Visa eligibility scoring and sponsorship analysis
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{avgScore}/100</p>
              </div>
              <Shield className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Likelihood</p>
                <p className="text-2xl font-bold text-green-600">{highCount}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium Likelihood</p>
                <p className="text-2xl font-bold text-amber-500">{mediumCount}</p>
              </div>
              <Minus className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visa Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Visa Eligibility by Occupation
          </CardTitle>
          <CardDescription>{scores.length} occupations analyzed</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No visa data available. Add jobs to analyze sponsorship likelihood.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Occupation</TableHead>
                    <TableHead>Eligibility Score</TableHead>
                    <TableHead>Sponsorship Likelihood</TableHead>
                    <TableHead>Eligible Countries</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.map((score, idx) => {
                    const config = LIKELIHOOD_CONFIG[score.sponsorship_likelihood] ?? LIKELIHOOD_CONFIG.medium;
                    const LikelihoodIcon = config.icon;
                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-medium">{score.occupation}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  score.eligibility_score >= 70 ? "bg-green-600" :
                                  score.eligibility_score >= 40 ? "bg-amber-500" : "bg-red-600"
                                }`}
                                style={{ width: `${score.eligibility_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{score.eligibility_score}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={config.badge}>
                            <LikelihoodIcon className="w-3 h-3 me-1" />
                            {score.sponsorship_likelihood}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {score.eligible_countries.slice(0, 3).map((country) => (
                              <Badge key={country} variant="outline" className="text-xs">
                                <MapPin className="w-3 h-3 me-1" />
                                {country}
                              </Badge>
                            ))}
                            {score.eligible_countries.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{score.eligible_countries.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm max-w-[250px] truncate">
                          {score.details}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
