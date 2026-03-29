/**
 * Landing Page - JobFlow
 * Author: Ahmed Adel Bakr Alderai
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Target,
  BarChart3,
  Users,
  ArrowRight,
  Sparkles,
  Briefcase,
  Mail,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient-brand">
                JobFlow
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="gradient-brand text-white border-0">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-32 px-4 relative overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4f46e5]/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-[#7c3aed]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-[#22d3ee]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6 glass border border-border/50">
              <Sparkles className="w-3 h-3 me-1" />
              AI-Powered Job Search
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Find Your Dream Job with{" "}
            <span className="text-gradient-brand">AI Automation</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Let intelligent agents search, apply, and track jobs for you 24/7.
            Focus on interviews while we handle the busy work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 gradient-brand text-white border-0 shadow-lg shadow-[#4f46e5]/25 hover:shadow-[#4f46e5]/40 transition-shadow"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="glass">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete suite of tools to supercharge your job search
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="group card-glow glass border-border/50 h-full">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="text-4xl font-bold font-mono text-gradient-brand mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="gradient-brand text-white border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
              <CardContent className="p-8 sm:p-12 text-center relative">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Transform Your Job Search?
                </h2>
                <p className="text-white/80 mb-8 max-w-xl mx-auto">
                  Join thousands of job seekers who have found their dream jobs
                  with JobFlow.
                </p>
                <Link href="/signup">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2 shadow-lg"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
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
              &copy; {new Date().getFullYear()} JobFlow. Built by Ahmed Adel
              Bakr Alderai.
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
    description:
      "Intelligent agents scan 50+ job boards to find perfect matches for your skills.",
    icon: Target,
    bgColor: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
  },
  {
    title: "Auto Apply",
    description:
      "Automatically submit applications with personalized cover letters.",
    icon: Briefcase,
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    title: "Email Automation",
    description:
      "Smart email campaigns to recruiters with follow-up sequences.",
    icon: Mail,
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-400",
  },
  {
    title: "Analytics Dashboard",
    description:
      "Track application status, response rates, and interview pipeline.",
    icon: BarChart3,
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  {
    title: "Network Management",
    description:
      "Organize contacts, recruiters, and professional relationships.",
    icon: Users,
    bgColor: "bg-rose-500/10",
    iconColor: "text-rose-400",
  },
  {
    title: "Interview Prep",
    description:
      "AI-powered interview coaching and question preparation.",
    icon: MessageSquare,
    bgColor: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
  },
];

const stats = [
  { value: "50+", label: "Job Boards" },
  { value: "10K+", label: "Jobs Applied" },
  { value: "95%", label: "Success Rate" },
];
