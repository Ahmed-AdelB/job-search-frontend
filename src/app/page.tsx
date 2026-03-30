/**
 * Landing Page - JobFlow
 * Command Center / Mission Control Aesthetic
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
  Radar,
  Shield,
  Cpu,
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                JobFlow
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-0 hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mission Control */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Animated Gradient Mesh Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Primary gradient blob (top-left) */}
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[128px] animate-pulse" />

          {/* Secondary gradient blob (top-right) */}
          <div className="absolute top-20 -right-32 h-[400px] w-[400px] rounded-full bg-violet-500/20 blur-[128px] animate-pulse animation-delay-2000" />

          {/* Accent gradient blob (bottom-center) */}
          <div className="absolute -bottom-20 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-400/10 blur-[128px]" />

          {/* Grid overlay (subtle) */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(79, 70, 229, .05) 25%, rgba(79, 70, 229, .05) 26%, transparent 27%, transparent 74%, rgba(79, 70, 229, .05) 75%, rgba(79, 70, 229, .05) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(79, 70, 229, .05) 25%, rgba(79, 70, 229, .05) 26%, transparent 27%, transparent 74%, rgba(79, 70, 229, .05) 75%, rgba(79, 70, 229, .05) 76%, transparent 77%, transparent)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 glass border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
              <Radar className="w-3 h-3 mr-1.5" />
              AI-Powered Command Center
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight"
          >
            Your Job Search,{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Automated
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            AI-powered pipeline that discovers, scores, tailors, and applies to
            jobs — so you can focus on interviews and landing your dream role.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-0 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 px-8"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="glass backdrop-blur-xl px-8"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Key Metrics */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Glass Cards */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Complete Automation Suite
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From discovery to offers — your entire job search is orchestrated
              by intelligent agents working 24/7
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
                <Card className="group relative h-full overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] hover:-translate-y-1">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 pointer-events-none" />

                  <CardContent className="p-6 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 font-display">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Pipeline Visualization */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete pipeline of intelligent agents working in parallel to
              maximize your chances of landing interviews
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipeline.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="relative">
                  <div className="glass p-6 rounded-2xl border border-white/10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-mono font-semibold text-sm">
                        {i + 1}
                      </div>
                      {i < pipeline.length - 1 && (
                        <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                          <ArrowRight className="w-6 h-6 text-indigo-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 font-display">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm flex-grow">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Final Call to Action */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-indigo-500/90 to-violet-500/90 backdrop-blur-xl shadow-xl shadow-indigo-500/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
              <CardContent className="p-8 sm:p-12 text-center relative z-10">
                <h2 className="text-3xl font-bold mb-4 text-white font-display">
                  Ready to Transform Your Job Search?
                </h2>
                <p className="text-white/90 mb-8 max-w-xl mx-auto">
                  Join thousands of job seekers who have automated their job
                  search and found their dream roles faster with JobFlow.
                </p>
                <Link href="/signup">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2 shadow-lg hover:shadow-xl transition-all"
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
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-indigo-400" />
                <span className="font-semibold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  JobFlow
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered job search automation platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:text-foreground transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground transition">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} JobFlow. Built by Ahmed Adel
              Bakr Alderai.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                Made with AI & ❤️
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "AI Job Discovery",
    description:
      "Intelligent agents scan 50+ job boards continuously to find perfect matches for your profile and preferences.",
    icon: Target,
    bgColor: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
  },
  {
    title: "Smart Auto-Apply",
    description:
      "Automatically submit applications with personalized cover letters and optimized resumes.",
    icon: Briefcase,
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    title: "Email Outreach",
    description:
      "Strategic email campaigns to recruiters with intelligent follow-up sequences and timing.",
    icon: Mail,
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-400",
  },
  {
    title: "Analytics Dashboard",
    description:
      "Real-time visibility into your application status, response rates, and interview pipeline.",
    icon: BarChart3,
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  {
    title: "Network Intelligence",
    description:
      "Organize contacts, track recruiter interactions, and build strategic relationships.",
    icon: Users,
    bgColor: "bg-rose-500/10",
    iconColor: "text-rose-400",
  },
  {
    title: "AI Interview Coach",
    description:
      "Personalized interview preparation with AI coaching and question practice.",
    icon: MessageSquare,
    bgColor: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
  },
];

const stats = [
  { value: "50K+", label: "Jobs Analyzed Monthly" },
  { value: "89%", label: "Average Match Accuracy" },
  { value: "10x", label: "Faster to Apply" },
];

const pipeline = [
  {
    title: "Discover",
    description: "AI agents discover opportunities across 50+ job boards.",
  },
  {
    title: "Score",
    description:
      "Intelligent scoring system ranks jobs by fit and interview likelihood.",
  },
  {
    title: "Tailor",
    description: "Personalize applications with AI-generated cover letters.",
  },
  {
    title: "Apply",
    description:
      "Auto-submit applications and track every application status.",
  },
];
