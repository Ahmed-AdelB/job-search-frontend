/**
 * Mock Data Factories for Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import type {
  User,
  Job,
  Application,
  AuthResponse,
  Portal,
} from "@/types/api";

let idCounter = 1;
function nextId(prefix = "id") {
  return `${prefix}_${idCounter++}`;
}

export function resetIdCounter() {
  idCounter = 1;
}

// Auth
export function createMockUser(overrides?: Partial<User>): User {
  return {
    user_id: nextId("user"),
    email: "test@example.com",
    name: "Test User",
    ...overrides,
  };
}

export function createMockAuthResponse(overrides?: Partial<AuthResponse>): AuthResponse {
  return {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl8xIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjo5OTk5OTk5OTk5fQ.test",
    user_id: "user_1",
    email: "test@example.com",
    name: "Test User",
    ...overrides,
  };
}

// Jobs
export function createMockJob(overrides?: Partial<Job>): Job {
  const id = nextId("job");
  return {
    job_id: id,
    title: "Senior Software Engineer",
    company: "TechCorp",
    location: "Remote",
    url: `https://example.com/jobs/${id}`,
    source: "linkedin",
    status: "new",
    score: 85,
    ghost_score: 10,
    remote_type: "remote",
    visa_sponsored: false,
    created_at: "2026-03-20T10:00:00Z",
    updated_at: "2026-03-20T10:00:00Z",
    ...overrides,
  };
}

export function createMockJobList(count: number): Job[] {
  return Array.from({ length: count }, (_, i) =>
    createMockJob({
      title: `Engineer ${i + 1}`,
      company: `Company ${i + 1}`,
      score: Math.floor(Math.random() * 100),
    })
  );
}

// Applications
export function createMockApplication(overrides?: Partial<Application>): Application {
  return {
    application_id: nextId("app"),
    job_id: "job_1",
    user_id: "user_1",
    status: "submitted",
    applied_at: "2026-03-20T12:00:00Z",
    job_title: "Senior Software Engineer",
    company: "TechCorp",
    created_at: "2026-03-20T12:00:00Z",
    updated_at: "2026-03-20T12:00:00Z",
    ...overrides,
  };
}

// Contacts
export function createMockContact(overrides?: Record<string, unknown>) {
  return {
    contact_id: nextId("contact"),
    name: "Jane Doe",
    email: "jane@techcorp.com",
    company: "TechCorp",
    position: "Engineering Manager",
    linkedin_url: "https://linkedin.com/in/janedoe",
    ...overrides,
  };
}

// Portals
export function createMockPortal(overrides?: Partial<Portal>): Portal {
  return {
    id: nextId("portal"),
    name: "LinkedIn",
    type: "linkedin",
    url: "https://linkedin.com",
    status: "active",
    last_sync: "2026-03-20T10:00:00Z",
    jobs_count: 42,
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-20T10:00:00Z",
    ...overrides,
  };
}

// Alerts
export function createMockAlert(overrides?: Record<string, unknown>) {
  return {
    alert_id: nextId("alert"),
    type: "new_job",
    threshold: 80,
    enabled: true,
    created_at: "2026-03-20T10:00:00Z",
    ...overrides,
  };
}

// Analytics
export function createMockDashboardStats() {
  return {
    total_jobs: 150,
    total_applications: 42,
    total_contacts: 200,
    score_avg: 72,
    pipeline: { new: 80, applied: 30, interview: 10, offer: 2 },
  };
}

export function createMockPipelineData() {
  return {
    stages: [
      { name: "Discovered", count: 150 },
      { name: "Applied", count: 42 },
      { name: "Interview", count: 10 },
      { name: "Offer", count: 2 },
    ],
  };
}

// Intelligence
export function createMockGhostStats() {
  return { total_scanned: 100, ghost_count: 15, avg_score: 42 };
}

export function createMockSalaryBenchmark() {
  return { role: "SWE", median: 120000, p25: 95000, p75: 150000, currency: "USD" };
}

export function createMockVisaStats() {
  return { sponsored_count: 30, total_analyzed: 100, percentage: 30 };
}

export function createMockRemoteScoreStats() {
  return { avg_score: 72, remote_count: 60, hybrid_count: 25, onsite_count: 15 };
}

export function createMockSkillGap() {
  return {
    matching_skills: ["TypeScript", "React", "Node.js"],
    missing_skills: ["Kubernetes", "Go"],
    match_percentage: 75,
  };
}

export function createMockWorkModeStats() {
  return { remote_count: 60, hybrid_count: 25, onsite_count: 15 };
}

export function createMockEmploymentTypeStats() {
  return { breakdown: { "full-time": 80, contract: 15, "part-time": 5 } };
}

// GDPR
export function createMockGDPRExport() {
  return { request_id: "gdpr_1", status: "processing" };
}

// Notifications
export function createMockNotification(overrides?: Record<string, unknown>) {
  return {
    id: nextId("notification"),
    message: "New job match found",
    read: false,
    created_at: "2026-03-20T10:00:00Z",
    ...overrides,
  };
}

// Settings
export function createMockSettings() {
  return {
    notifications_enabled: true,
    email_frequency: "daily",
    language: "en",
  };
}
