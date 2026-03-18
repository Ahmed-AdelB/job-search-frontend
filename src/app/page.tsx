/**
 * Landing Page - JobFlow
 * Author: Ahmed Adel Bakr Alderai
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Target, 
  BarChart3, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Mail,
  MessageSquare,
  Globe,
  Shield
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobFlow
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="w-3 h-3 me-1" />
            AI-Powered Job Search
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            Find Your Dream Job with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Automation
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Let intelligent agents search, apply, and track jobs for you 24/7. 
            Focus on interviews while we handle the busy work.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete suite of tools to supercharge your job search
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Job Search?</h2>
              <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                Join thousands of job seekers who have found their dream jobs with JobFlow.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-semibold">JobFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} JobFlow. Built by Ahmed Adel Bakr Alderai.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "AI Job Search",
    description: "Intelligent agents scan 50+ job boards to find perfect matches for your skills.",
    icon: Target,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Auto Apply",
    description: "Automatically submit applications with personalized cover letters.",
    icon: Briefcase,
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Email Automation",
    description: "Smart email campaigns to recruiters with follow-up sequences.",
    icon: Mail,
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Analytics Dashboard",
    description: "Track application status, response rates, and interview pipeline.",
    icon: BarChart3,
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    title: "Network Management",
    description: "Organize contacts, recruiters, and professional relationships.",
    icon: Users,
    bgColor: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    title: "Interview Prep",
    description: "AI-powered interview coaching and question preparation.",
    icon: MessageSquare,
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
];

const stats = [
  { value: "50+", label: "Job Boards" },
  { value: "10K+", label: "Jobs Applied" },
  { value: "95%", label: "Success Rate" },
];
