/**
 * MSW Request Handlers - Mock API endpoints for testing
 * Author: Ahmed Adel Bakr Alderai
 */

import { http, HttpResponse } from "msw";

const API_URL = "http://localhost:8082";

// Mock data
const mockUser = {
  user_id: "user_1",
  email: "test@example.com",
  first_name: "Test",
  last_name: "User",
  name: "Test User",
};

const mockResume = {
  id: "resume_1",
  name: "Main Resume",
  filename: "resume.pdf",
  score: 88,
  uploaded_at: "2026-03-01T10:00:00Z",
  is_primary: true,
};

const mockNotification = {
  id: "notif_1",
  type: "info",
  message: "New job match",
  read: false,
  created_at: "2026-03-20T10:00:00Z",
};

const mockOutreachStats = {
  total_messages: 42,
  sent_count: 38,
  draft_count: 4,
  failed_count: 0,
  avg_response_rate: 0.25,
};

const mockOutreachMessage = {
  message_id: "msg_1",
  contact_id: "contact_1",
  message_type: "initial",
  subject: "Test Subject",
  body: "Test body",
  status: "sent",
  sent_at: "2026-03-20T12:00:00Z",
};

const mockPortal = {
  id: "portal_1",
  name: "LinkedIn",
  type: "linkedin",
  url: "https://linkedin.com",
  status: "active",
  last_sync: "2026-03-20T10:00:00Z",
  jobs_count: 42,
};

const mockAuthResponse = {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl8xIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjo5OTk5OTk5OTk5fQ.test",
  user_id: "user_1",
  email: "test@example.com",
  name: "Test User",
};

const mockJob = {
  job_id: "job_1",
  title: "Senior Software Engineer",
  company: "TechCorp",
  location: "Remote",
  url: "https://example.com/job/1",
  source: "linkedin",
  status: "new" as const,
  score: 85,
  ghost_score: 10,
  remote_type: "remote" as const,
  created_at: "2026-03-20T10:00:00Z",
  updated_at: "2026-03-20T10:00:00Z",
};

const mockApplication = {
  application_id: "app_1",
  job_id: "job_1",
  user_id: "user_1",
  status: "submitted" as const,
  applied_at: "2026-03-20T12:00:00Z",
  job_title: "Senior Software Engineer",
  company: "TechCorp",
  created_at: "2026-03-20T12:00:00Z",
  updated_at: "2026-03-20T12:00:00Z",
};

const mockContact = {
  contact_id: "contact_1",
  name: "Jane Doe",
  email: "jane@techcorp.com",
  company: "TechCorp",
  position: "Engineering Manager",
  linkedin_url: "https://linkedin.com/in/janedoe",
  linkedin_id: "contact_1",
};

const mockAlert = {
  alert_id: "alert_1",
  type: "new_job",
  threshold: 80,
  enabled: true,
  created_at: "2026-03-20T10:00:00Z",
};

export const handlers = [
  // Auth
  http.post(`${API_URL}/auth/login`, () => HttpResponse.json(mockAuthResponse)),
  http.post(`${API_URL}/auth/register`, () => HttpResponse.json(mockAuthResponse)),
  http.post(`${API_URL}/auth/logout`, () => HttpResponse.json({ success: true })),
  http.post(`${API_URL}/auth/forgot-password`, () => HttpResponse.json({ success: true })),

  // Jobs
  http.get(`${API_URL}/api/jobs`, () =>
    HttpResponse.json({
      data: [mockJob, { ...mockJob, job_id: "job_2", title: "Frontend Developer", score: 72 }],
      total: 2,
      page: 1,
      per_page: 20,
    })
  ),
  http.get(`${API_URL}/api/jobs/:id`, () => HttpResponse.json(mockJob)),
  http.patch(`${API_URL}/api/jobs/:id`, () => HttpResponse.json({ ...mockJob, status: "applied" })),
  http.delete(`${API_URL}/api/jobs/:id`, () => new HttpResponse(null, { status: 204 })),
  http.put(`${API_URL}/api/jobs/bulk-action`, () => HttpResponse.json({ success: true, count: 3 })),

  // Applications
  http.get(`${API_URL}/api/applications`, () =>
    HttpResponse.json({ data: [mockApplication], total: 1, page: 1, per_page: 20 })
  ),
  http.get(`${API_URL}/api/applications/:id`, () => HttpResponse.json(mockApplication)),
  http.post(`${API_URL}/api/applications`, () => HttpResponse.json(mockApplication)),
  http.patch(`${API_URL}/api/applications/:id`, () => HttpResponse.json({ ...mockApplication, status: "interview" })),
  http.post(`${API_URL}/api/applications/:id/withdraw`, () => HttpResponse.json({ ...mockApplication, status: "withdrawn" })),
  http.delete(`${API_URL}/api/applications/:id`, () => new HttpResponse(null, { status: 204 })),

  // Apply
  http.post(`${API_URL}/api/apply/:jobId`, () => HttpResponse.json({ success: true, application_id: "app_new", status: "applied" })),
  http.post(`${API_URL}/api/apply/dry-run`, () => HttpResponse.json({ can_apply: true, method: "api", ats_type: "greenhouse" })),
  http.post(`${API_URL}/api/apply/auto-apply/:jobId`, () => HttpResponse.json({ success: true, application_id: "app_auto", status: "applied" })),
  http.post(`${API_URL}/api/apply/retry/:appId`, () => HttpResponse.json({ success: true })),
  http.post(`${API_URL}/api/apply/batch-queue`, () => HttpResponse.json({ queued: 3, batch_id: "batch_1", skipped: 0 })),
  http.get(`${API_URL}/api/apply/status/:jobId`, () => HttpResponse.json({ status: "applied", applied_at: "2026-03-20T12:00:00Z" })),
  http.get(`${API_URL}/api/apply/bulk-status`, () => HttpResponse.json([{ status: "applied", applied_at: "2026-03-20T12:00:00Z" }])),
  http.get(`${API_URL}/api/apply/rate-limits`, () => HttpResponse.json({ daily_limit: 50, used: 12, remaining: 38 })),
  http.post(`${API_URL}/api/apply/rate-limits`, () => HttpResponse.json({ daily_limit: 100, used: 0, remaining: 100 })),

  // Contacts
  http.get(`${API_URL}/api/contacts`, () => HttpResponse.json({ data: [mockContact], total: 1 })),
  http.get(`${API_URL}/api/contacts/:id`, () => HttpResponse.json(mockContact)),
  http.post(`${API_URL}/api/contacts`, () => HttpResponse.json(mockContact)),
  http.put(`${API_URL}/api/contacts/:id`, () => HttpResponse.json({ ...mockContact, company: "NewCorp" })),
  http.delete(`${API_URL}/api/contacts/:id`, () => new HttpResponse(null, { status: 204 })),
  http.post(`${API_URL}/api/contacts/import`, () => HttpResponse.json({ imported: 10 })),

  // Alerts
  http.get(`${API_URL}/api/alerts`, () => HttpResponse.json({ data: [mockAlert] })),
  http.post(`${API_URL}/api/alerts`, () => HttpResponse.json(mockAlert)),
  http.delete(`${API_URL}/api/alerts/:id`, () => new HttpResponse(null, { status: 204 })),

  // Analytics - legacy endpoints
  http.get(`${API_URL}/api/analytics/dashboard`, () =>
    HttpResponse.json({ total_jobs: 150, total_applications: 42, total_contacts: 200, score_avg: 72, pipeline: { new: 80, applied: 30, interview: 10, offer: 2 } })
  ),
  http.get(`${API_URL}/api/analytics/pipeline`, () =>
    HttpResponse.json({ stages: [{ name: "Discovered", count: 150 }, { name: "Applied", count: 42 }, { name: "Interview", count: 10 }, { name: "Offer", count: 2 }] })
  ),
  http.get(`${API_URL}/api/analytics/timeline`, () =>
    HttpResponse.json({ data: [{ date: "2026-03-01", applications: 5, interviews: 1 }, { date: "2026-03-15", applications: 12, interviews: 3 }] })
  ),

  // Analytics - v1 endpoints for sources/companies/by-ats
  http.get(`${API_URL}/api/analytics/sources`, () =>
    HttpResponse.json([
      { source: "linkedin", count: 80, percentage: 53 },
      { source: "indeed", count: 40, percentage: 27 },
      { source: "glassdoor", count: 30, percentage: 20 },
    ])
  ),
  http.get(`${API_URL}/api/analytics/companies`, () =>
    HttpResponse.json([
      { company: "Google", applications: 5, interviews: 2 },
      { company: "Meta", applications: 3, interviews: 1 },
    ])
  ),
  http.get(`${API_URL}/api/analytics/by-ats`, () =>
    HttpResponse.json([
      { ats_type: "greenhouse", count: 25, percentage: 40 },
      { ats_type: "lever", count: 20, percentage: 32 },
      { ats_type: "workday", count: 17, percentage: 28 },
    ])
  ),

  // Ghost Detection
  http.get(`${API_URL}/api/ghost-detection/stats`, () =>
    HttpResponse.json({ total_scanned: 100, ghost_count: 15, avg_score: 42 })
  ),
  http.post(`${API_URL}/api/ghost-detection/scan`, () =>
    HttpResponse.json({ job_id: "job_1", ghost_score: 85, indicators: ["no_updates"] })
  ),

  // Work Mode
  http.get(`${API_URL}/api/work-mode/stats`, () =>
    HttpResponse.json({ remote_count: 60, hybrid_count: 25, onsite_count: 15 })
  ),
  http.post(`${API_URL}/api/work-mode/detect`, () =>
    HttpResponse.json({ work_mode: "remote", confidence: 0.92 })
  ),

  // Employment Type
  http.get(`${API_URL}/api/employment-type/stats`, () =>
    HttpResponse.json({ breakdown: { "full-time": 80, contract: 15, "part-time": 5 } })
  ),
  http.post(`${API_URL}/api/employment-type/detect`, () =>
    HttpResponse.json({ employment_type: "full-time", confidence: 0.88 })
  ),

  // Deploy
  http.get(`${API_URL}/api/deploy/status`, () =>
    HttpResponse.json({ agents: [{ name: "discovery", status: "running" }] })
  ),
  http.post(`${API_URL}/api/deploy/agents/:name/start`, () => HttpResponse.json({ success: true })),

  // LLM
  http.get(`${API_URL}/api/llm/settings`, () =>
    HttpResponse.json({ provider: "anthropic", model: "claude-sonnet-4-6", temperature: 0.7 })
  ),
  http.put(`${API_URL}/api/llm/settings`, () => HttpResponse.json({ success: true })),

  // Dashboard
  http.get(`${API_URL}/api/dashboard`, () =>
    HttpResponse.json({
      stats: { jobs: 150, applications: 42, contacts: 200, interviews: 10 },
      recent_activity: [{ type: "application", message: "Applied to TechCorp", date: "2026-03-20" }],
    })
  ),

  // Targets
  http.get(`${API_URL}/api/targets`, () =>
    HttpResponse.json({ data: [{ id: "t1", company: "Google", priority: "high" }] })
  ),

  // Admin
  http.get(`${API_URL}/api/admin/health`, () =>
    HttpResponse.json({ status: "healthy", uptime: 86400, version: "1.0.0" })
  ),

  // Infrastructure
  http.get(`${API_URL}/api/infrastructure/status`, () =>
    HttpResponse.json({ cpu: 45, memory: 62, disk: 38 })
  ),

  // Settings - v1 endpoints
  http.get(`${API_URL}/api/settings`, () =>
    HttpResponse.json({
      general: { theme: "light", language: "en", timezone: "UTC", notifications_enabled: true },
      pipeline: { auto_apply_enabled: true, rate_limit_per_hour: 10 },
      llm: { provider: "anthropic", model: "claude-3", temperature: 0.7 },
      notifications: {
        email_notifications: true,
        application_status_updates: true,
        interview_reminders: true,
        daily_digest: false,
        notification_email: "test@example.com",
      },
      advanced: { rate_limit_per_minute: 10, debug_mode: false },
    })
  ),
  http.put(`${API_URL}/api/settings`, () =>
    HttpResponse.json({
      general: { theme: "dark", language: "en", timezone: "UTC", notifications_enabled: true },
      pipeline: { auto_apply_enabled: true, rate_limit_per_hour: 10 },
      llm: { provider: "anthropic", model: "claude-3", temperature: 0.7 },
      notifications: {
        email_notifications: true,
        application_status_updates: true,
        interview_reminders: true,
        daily_digest: false,
        notification_email: "test@example.com",
      },
      advanced: { rate_limit_per_minute: 10, debug_mode: false },
    })
  ),
  http.put(`${API_URL}/api/settings/general`, () =>
    HttpResponse.json({ theme: "dark", language: "en", timezone: "UTC", notifications_enabled: true })
  ),
  http.put(`${API_URL}/api/settings/pipeline`, () =>
    HttpResponse.json({ auto_apply_enabled: true, rate_limit_per_hour: 10 })
  ),
  http.get(`${API_URL}/api/settings/llm`, () =>
    HttpResponse.json({ provider: "anthropic", model: "claude-3", temperature: 0.7 })
  ),
  http.put(`${API_URL}/api/settings/llm`, () =>
    HttpResponse.json({ provider: "anthropic", model: "claude-3", temperature: 0.7 })
  ),
  http.put(`${API_URL}/api/settings/notifications`, () =>
    HttpResponse.json({
      email_notifications: true,
      application_status_updates: true,
      interview_reminders: true,
      daily_digest: false,
      notification_email: "test@example.com",
    })
  ),
  http.put(`${API_URL}/api/settings/advanced`, () =>
    HttpResponse.json({ rate_limit_per_minute: 10, debug_mode: false })
  ),

  // Profile endpoints
  http.get(`${API_URL}/api/profiles/me`, () =>
    HttpResponse.json(mockUser)
  ),
  http.put(`${API_URL}/api/profiles/me`, () =>
    HttpResponse.json(mockUser)
  ),
  http.get(`${API_URL}/api/profiles/resumes`, () =>
    HttpResponse.json({ resumes: [mockResume] })
  ),
  http.post(`${API_URL}/api/onboarding/cv`, () =>
    HttpResponse.json(mockResume)
  ),
  http.delete(`${API_URL}/api/profiles/resumes/:id`, () =>
    HttpResponse.json({ success: true })
  ),
  http.put(`${API_URL}/api/profiles/resumes/:id/primary`, () =>
    HttpResponse.json(mockResume)
  ),

  // Notifications - v1 endpoints
  http.get(`${API_URL}/api/notifications`, () =>
    HttpResponse.json({
      notifications: [mockNotification],
      total: 1,
      page: 1,
      per_page: 20,
    })
  ),
  http.patch(`${API_URL}/api/notifications/:id`, () =>
    HttpResponse.json({ ...mockNotification, read: true })
  ),
  http.post(`${API_URL}/api/notifications/mark-all-read`, () =>
    HttpResponse.json({ count: 5 })
  ),
  http.post(`${API_URL}/api/notifications/:id/delete`, () =>
    HttpResponse.json({ success: true })
  ),

  // Outreach endpoints
  http.get(`${API_URL}/api/outreach/stats`, () =>
    HttpResponse.json(mockOutreachStats)
  ),
  http.get(`${API_URL}/api/outreach/messages`, () =>
    HttpResponse.json({
      messages: [mockOutreachMessage],
      total: 1,
    })
  ),
  http.post(`${API_URL}/api/outreach/send`, () =>
    HttpResponse.json(mockOutreachMessage)
  ),
  http.get(`${API_URL}/api/outreach/campaigns`, () =>
    HttpResponse.json({
      campaigns: [{ id: "camp_1", name: "Q1 Outreach", type: "cold_email", created_at: "2026-03-01T10:00:00Z" }],
      total: 1,
    })
  ),

  // Portals
  http.get(`${API_URL}/api/portals`, () =>
    HttpResponse.json({ portals: [mockPortal] })
  ),
  http.get(`${API_URL}/api/portals/:id`, () =>
    HttpResponse.json(mockPortal)
  ),
  http.post(`${API_URL}/api/portals/:name/register`, () =>
    HttpResponse.json({
      ...mockPortal,
      jobs_synced: 15,
      status: "active",
    })
  ),
  http.post(`${API_URL}/api/portals/:name/sync`, () =>
    HttpResponse.json({ synced: 15, jobs_synced: 15 })
  ),
  http.delete(`${API_URL}/api/portals/:id`, () =>
    HttpResponse.json({ status: "deleted" })
  ),

  // GDPR
  http.post(`${API_URL}/api/gdpr/export`, () =>
    HttpResponse.json({ request_id: "gdpr_1", status: "processing" })
  ),
  http.get(`${API_URL}/api/gdpr/status/:id`, () =>
    HttpResponse.json({ request_id: "gdpr_1", status: "completed", download_url: "/api/gdpr/download/gdpr_1" })
  ),
  http.post(`${API_URL}/api/gdpr/delete`, () =>
    HttpResponse.json({ status: "scheduled", scheduled_at: "2026-04-20T00:00:00Z", cancel_before: "2026-04-20T00:00:00Z" })
  ),

  // Billing endpoints
  http.get(`${API_URL}/api/billing/plans`, () =>
    HttpResponse.json([
      { id: "plan_1", name: "Basic", price: 99, features: ["up to 50 applications/month"] },
      { id: "plan_2", name: "Pro", price: 199, features: ["up to 200 applications/month"] },
    ])
  ),
  http.get(`${API_URL}/api/billing/subscription`, () =>
    HttpResponse.json({
      plan_id: "plan_1",
      status: "active",
      current_period_start: "2026-02-20T00:00:00Z",
      current_period_end: "2026-03-20T00:00:00Z",
      cancel_at_period_end: false,
    })
  ),
  http.post(`${API_URL}/api/checkout/session`, () =>
    HttpResponse.json({ session_id: "cs_1", url: "https://checkout.stripe.com/test" })
  ),
  http.post(`${API_URL}/api/billing/cancel`, () =>
    HttpResponse.json({
      plan_id: "plan_1",
      status: "cancelled",
      current_period_start: "2026-02-20T00:00:00Z",
      current_period_end: "2026-03-20T00:00:00Z",
    })
  ),
  http.get(`${API_URL}/api/billing/invoices`, () =>
    HttpResponse.json([
      { id: "inv_1", amount: 99, currency: "USD", status: "paid", created_at: "2026-03-01T10:00:00Z" },
    ])
  ),
  http.post(`${API_URL}/api/billing/portal`, () =>
    HttpResponse.json({ url: "https://billing.stripe.com/p/session/test" })
  ),

  // Pipeline
  http.get(`${API_URL}/api/pipeline/status`, () =>
    HttpResponse.json({
      phase: "discover",
      status: "running",
      progress: 45,
      total_jobs: 150,
    })
  ),

  // Analytics - v1 API endpoints
  http.get(`${API_URL}/api/analytics/overview`, () =>
    HttpResponse.json({
      total_jobs: 150,
      total_applications: 42,
      success_rate: 28,
    })
  ),

  http.get(`${API_URL}/api/analytics/funnel`, () =>
    HttpResponse.json([
      { stage: "discovered", count: 150 },
      { stage: "applied", count: 42 },
      { stage: "interview", count: 10 },
      { stage: "offer", count: 2 },
    ])
  ),

  http.get(`${API_URL}/api/analytics/timeline`, () =>
    HttpResponse.json([
      {
        date: "2026-03-15",
        jobs_discovered: 12,
        applications: 3,
        success_rate: 25,
      },
      {
        date: "2026-03-18",
        jobs_discovered: 8,
        applications: 2,
        success_rate: 25,
      },
      {
        date: "2026-03-20",
        jobs_discovered: 5,
        applications: 1,
        success_rate: 20,
      },
    ])
  ),

  // Intelligence - Salary Benchmark
  http.get(`${API_URL}/api/salary/benchmark`, ({ request }) => {
    const url = new URL(request.url);
    const title = url.searchParams.get("title") || "Software Engineer";
    const location = url.searchParams.get("location") || "San Francisco";

    return HttpResponse.json({
      min_salary: 95000,
      max_salary: 150000,
      median_salary: 120000,
      currency: "USD",
      title: title,
      location: location,
    });
  }),

  // Intelligence - Salary Report
  http.get(`${API_URL}/api/salary/report`, () =>
    HttpResponse.json({
      report: {
        current_salary: 120000,
        target_salary: 150000,
        market_median: 125000,
        percentile_rank: 75,
        location: "San Francisco",
        title: "Senior Software Engineer",
      },
    })
  ),

  // Intelligence - Salary Report PDF
  http.get(`${API_URL}/api/salary/report/pdf`, () =>
    new HttpResponse(new Blob(["PDF content"], { type: "application/pdf" }), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=salary-report.pdf",
      },
    })
  ),

  // Intelligence - Visa Scoring
  http.post(`${API_URL}/api/visa-scoring/score`, () =>
    HttpResponse.json({
      score: 85,
      eligible: true,
      reasoning: "Occupation in demand list",
    })
  ),

  // Intelligence - Eligible Occupations
  http.get(`${API_URL}/api/visa-scoring/eligible-occupations`, () =>
    HttpResponse.json({
      occupations: [
        {
          occupation: "Software Engineer",
          countries: ["Ireland", "Canada", "UK"],
          demand: "high",
        },
        {
          occupation: "Data Scientist",
          countries: ["Ireland", "Germany"],
          demand: "high",
        },
      ],
    })
  ),

  // Intelligence - Remote Scoring
  http.post(`${API_URL}/api/remote-scoring/score`, () =>
    HttpResponse.json({
      remote_score: 85,
      remote_type: "remote" as const,
      reasoning: "Job description indicates fully remote position",
    })
  ),

  // Intelligence - Skill Gap Analyze
  http.post(`${API_URL}/api/skills-gap/analyze`, () =>
    HttpResponse.json({
      gaps: [
        { skill: "Kubernetes", importance: "high", difficulty: "medium" },
        { skill: "Go", importance: "medium", difficulty: "high" },
      ],
      recommendations: [
        { skill: "Kubernetes", estimated_hours: 40, resources: [] },
      ],
    })
  ),

  // Intelligence - Skill Gap Recommendations
  http.get(`${API_URL}/api/skills-gap/recommendations`, () =>
    HttpResponse.json({
      recommendations: [
        {
          skill: "Kubernetes",
          courses: [
            {
              name: "Kubernetes Fundamentals",
              provider: "Linux Academy",
              duration: "20 hours",
              cost: "free",
            },
          ],
        },
        {
          skill: "Go Programming",
          courses: [
            {
              name: "Go for Beginners",
              provider: "Udemy",
              duration: "30 hours",
              cost: "$14.99",
            },
          ],
        },
      ],
    })
  ),

  // Handle relative path requests for PDF downloads (for fetch("/api/salary/report/pdf"))
  http.get("/api/salary/report/pdf", () =>
    new HttpResponse(new Blob(["PDF content"], { type: "application/pdf" }), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=salary-report.pdf",
      },
    })
  ),
];
