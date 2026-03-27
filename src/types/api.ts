/**
 * API TypeScript Interfaces
 * Author: Ahmed Adel Bakr Alderai
 */

// Authentication
export interface AuthResponse {
  token: string;
  user_id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// Error Handling (RFC 7807 Problem Detail)
export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}

// User
export interface User {
  user_id: string;
  email: string;
  name?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

// Job
export interface Job {
  job_id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  job_type?: "full-time" | "part-time" | "contract" | "freelance" | "internship";
  remote_type?: "on-site" | "hybrid" | "remote";
  url: string;
  source: string;
  posted_at?: string;
  status: "new" | "applied" | "interview" | "offer" | "rejected" | "archived";
  score?: number;
  ghost_score?: number;
  visa_sponsored?: boolean;
  requirements?: string[];
  created_at: string;
  updated_at: string;
}

// Application
export interface Application {
  application_id: string;
  job_id: string;
  user_id: string;
  status: "draft" | "submitted" | "screening" | "interview" | "offer" | "hired" | "rejected" | "withdrawn";
  applied_at?: string;
  cover_letter?: string;
  resume_url?: string;
  notes?: string;
  job_title?: string;
  company?: string;
  ats_type?: string;
  method?: string;
  resume_version?: string;
  confirmation_email?: string;
  created_at: string;
  updated_at: string;
}

// Contact/Recruiter
export interface Contact {
  contact_id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  linkedin_url?: string;
  type: "recruiter" | "hiring_manager" | "referral" | "network" | "other";
  notes?: string;
  created_at: string;
  updated_at: string;
}

// LinkedIn Connection Contact
export interface LinkedInContact {
  linkedin_id: string;
  first_name: string;
  last_name: string;
  company: string;
  position: string;
  email?: string;
  phone?: string;
  connected_on?: string;
  score?: number;
  tags?: string[];
  notes?: string;
}

export interface ContactsResponse {
  contacts: LinkedInContact[];
  total: number;
  page: number;
  per_page: number;
}

// Recruiter (extends Contact with additional fields)
export interface Recruiter extends Contact {
  specialization?: string;
  response_rate?: number;
  last_contact?: string;
  interaction_count?: number;
  interaction_log?: InteractionLog[];
  recommended_outreach?: string;
}

export interface InteractionLog {
  date: string;
  type: "email" | "message" | "call" | "note";
  subject?: string;
  body?: string;
  status?: "pending" | "sent" | "delivered" | "opened" | "replied";
}

export interface RecruitersResponse {
  recruiters: Recruiter[];
  total: number;
  page: number;
  per_page: number;
}

// Outreach Message
export interface OutreachMessage {
  message_id: string;
  contact_id: string;
  message_type: "initial" | "follow_up_1" | "follow_up_2" | "follow_up_3" | "thank_you" | "referral_request";
  subject: string;
  body: string;
  status: "draft" | "sent" | "delivered" | "opened" | "replied" | "bounced";
  sent_at?: string;
  opened_at?: string;
  replied_at?: string;
}

export interface OutreachStats {
  total_sent: number;
  total_opened: number;
  total_replied: number;
  open_rate: number;
  reply_rate: number;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  message_type: string;
}

// Agent
export interface Agent {
  agent_id: string;
  user_id: string;
  name: string;
  type: "search" | "apply" | "email" | "interview" | "custom";
  display_name: string;
  status: "idle" | "running" | "paused" | "error" | "completed" | "stopped";
  config: Record<string, unknown>;
  schedule?: string;
  last_run_at?: string;
  next_run_at?: string;
  circuit_state?: "closed" | "open" | "half-open";
  consecutive_failures?: number;
  error_message?: string;
  poll_interval?: number;
  total_runs?: number;
  total_errors?: number;
  created_at: string;
  updated_at: string;
}

// Interview
export interface Interview {
  interview_id: string;
  application_id: string;
  user_id: string;
  type: "phone" | "video" | "onsite" | "technical" | "behavioral" | "final";
  scheduled_at: string;
  duration_minutes?: number;
  location?: string;
  meeting_url?: string;
  interviewer_names?: string[];
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
  feedback?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

// Outreach/Email Campaign
export interface OutreachCampaign {
  campaign_id: string;
  user_id: string;
  name: string;
  type: "cold_email" | "follow_up" | "networking" | "thank_you";
  status: "draft" | "active" | "paused" | "completed";
  template_subject: string;
  template_body: string;
  contacts: string[];
  sent_count: number;
  opened_count: number;
  replied_count: number;
  created_at: string;
  updated_at: string;
}

// Profile & Billing
export interface Profile {
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

export interface Resume {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  is_primary: boolean;
  parsed_data?: Record<string, unknown>;
}

export interface ResumesResponse {
  resumes: Resume[];
  total: number;
}

export interface ParsedProfileData {
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field?: string;
    graduation_date?: string;
  }>;
  certifications?: string[];
}

export interface OnboardingStatus {
  email_verified: boolean;
  profile_completed: boolean;
  resume_uploaded: boolean;
  preferences_set: boolean;
  step: number;
  completed_at?: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  tier: "free" | "starter" | "professional" | "enterprise";
  price_monthly: number;
  price_annual: number;
  features: string[];
  limits: Record<string, number>;
}

export interface Subscription {
  plan_id: string;
  tier: string;
  status: "active" | "cancelled" | "past_due" | "trialing";
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_method?: {
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  invoice_date: string;
  due_date?: string;
  download_url?: string;
}

export interface CheckoutSession {
  session_id: string;
  url: string;
}

export interface PortalSession {
  url: string;
}

// ============================================================================
// Target Companies
// ============================================================================
export type TierType = 'A' | 'B' | 'C';

export interface TargetCompany {
  id: string;
  name: string;
  tier: TierType;
  industry?: string;
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  careers_url?: string;
  open_roles?: number;
  applied_count?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTargetCompanyRequest {
  name: string;
  tier: TierType;
  industry?: string;
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  careers_url?: string;
  notes?: string;
}

export interface UpdateTargetCompanyRequest {
  tier?: TierType;
  industry?: string;
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  careers_url?: string;
  notes?: string;
}

export interface TargetListResponse {
  companies: TargetCompany[];
  total: number;
}

// ============================================================================
// Community
// ============================================================================
export type CommunityPlatform = 'reddit' | 'discord' | 'slack' | 'linkedin_group';

export interface Community {
  id: string;
  name: string;
  platform: CommunityPlatform;
  members_count?: number;
  relevance_score?: number;
  url?: string;
  description?: string;
  is_tracked: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityRecommendation {
  id: string;
  name: string;
  platform: CommunityPlatform;
  reason: string;
  relevance_score: number;
  url?: string;
  estimated_members?: number;
}

export interface CommunitiesResponse {
  communities: Community[];
  total: number;
}

export interface CommunityRecommendationsResponse {
  recommendations: CommunityRecommendation[];
}

// ============================================================================
// Invitations
// ============================================================================
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Invitation {
  id: string;
  person_name: string;
  company: string;
  email?: string;
  type: 'incoming' | 'outgoing';
  status: InvitationStatus;
  message?: string;
  sent_at?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InvitationsResponse {
  invitations: Invitation[];
  total: number;
  acceptance_rate?: number;
}

// ============================================================================
// Triage (Daily Digest)
// ============================================================================
export interface TriageAlert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  description?: string;
  action_url?: string;
  action_label?: string;
  created_at: string;
}

export interface TriageDigestPreview {
  date: string;
  jobs_discovered?: number;
  recommended_actions: string[];
  alerts: TriageAlert[];
  summary?: string;
}

export interface TriageDigestHistory {
  id: string;
  date: string;
  jobs_discovered: number;
  recommended_actions: string[];
  alerts_count: number;
  created_at: string;
}

export interface TriageConfig {
  digest_frequency: 'daily' | 'weekly' | 'never';
  include_job_recommendations: boolean;
  include_recruiter_alerts: boolean;
  include_interview_reminders: boolean;
  min_match_score?: number;
  notification_time?: string; // HH:mm format
}

export interface TriageConfigResponse {
  config: TriageConfig;
}

export interface TriagePreviewResponse {
  preview: TriageDigestPreview;
}

export interface TriageHistoryResponse {
  history: TriageDigestHistory[];
  total: number;
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
  };
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

// ============================================================================
// Intelligence Hub
// ============================================================================
export interface SkillGapAnalysis {
  required_skills: { skill: string; importance: "critical" | "preferred" | "nice_to_have" }[];
  possessed_skills: string[];
  missing_skills: { skill: string; importance: string; recommendation?: string }[];
  match_percentage: number;
}

export interface VisaScore {
  occupation: string;
  eligibility_score: number;
  eligible_countries: string[];
  sponsorship_likelihood: "high" | "medium" | "low";
  details: string;
}

export interface SalaryBenchmark {
  title: string;
  location: string;
  percentile_25: number;
  percentile_50: number;
  percentile_75: number;
  percentile_90: number;
  currency: string;
  sample_size: number;
}

export interface RemoteScore {
  remote_score: number;
  remote_type: "remote" | "hybrid" | "onsite";
  reasoning: string;
}

// ============================================================================
// Analytics (Backend Response Types)
// ============================================================================

// Overview metrics
export interface AnalyticsOverview {
  total_jobs_discovered: number;
  total_applications: number;
  response_rate: number;
  interview_count: number;
  offer_count: number;
  acceptance_rate: number;
  active_applications: number;
  rejection_rate: number;
}

// Funnel stage
export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

// Funnel metrics
export interface FunnelMetrics {
  stages: FunnelStage[];
  conversion_to_offer: number;
}

// Timeline entry
export interface TimelineEntry {
  date: string;
  applications: number;
  responses: number;
  interviews: number;
}

// Timeline metrics
export interface TimelineMetrics {
  entries: TimelineEntry[];
  total_applications: number;
  daily_average: number;
}

// For backwards compatibility with existing page, expose FunnelData
export interface FunnelData extends FunnelStage {}

// For backwards compatibility with existing page, expose TimelineData
export interface TimelineData extends TimelineEntry {
  jobs_discovered?: number;
  offers?: number;
}

// ============================================================================
// Missing Types (required by hooks)
// ============================================================================

// Job Filters and Response
export interface JobFilters {
  status?: string;
  source?: string;
  min_score?: number;
  remote_type?: string;
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  per_page: number;
}

// Application Response
export interface ApplicationsResponse {
  applications: Application[];
  total: number;
  page: number;
  per_page: number;
}

// Agent Action
export interface AgentAction {
  agent_id: string;
  action: "start" | "stop" | "pause" | "resume" | "restart";
  status: string;
}

// Pipeline
export interface PipelineStatus {
  phase: string;
  status: "idle" | "running" | "completed" | "error";
  progress: number;
  started_at?: string;
  completed_at?: string;
}

export interface PipelineStats {
  jobs_discovered: number;
  jobs_applied: number;
  applications_in_progress: number;
  interviews_scheduled: number;
  offers_received: number;
  success_rate: number;
}

// Settings
export interface PipelineSettings {
  auto_apply_enabled: boolean;
  min_match_score: number;
  max_applications_per_day: number;
  preferred_locations: string[];
  excluded_companies: string[];
  remote_types: string[];
  [key: string]: unknown;
}

// Deploy
export interface DeployStatus {
  version: string;
  status: "running" | "deploying" | "failed" | "stopped";
  uptime: string;
  last_deploy: string;
}

// Logs
export interface LogEntry {
  id: string;
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  agent?: string;
  message: string;
  context?: Record<string, unknown>;
}

// SSE
export interface SSEEvent {
  type: string;
  data: unknown;
  timestamp: string;
}

// Admin
export interface Tenant {
  id: string;
  name: string;
  plan: string;
  status: "active" | "suspended" | "cancelled";
  created_at: string;
}

// Notifications
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

// ============================================================================
// Apply System
// ============================================================================
export interface ApplyRequest {
  resume_id?: string;
  cover_letter?: string;
  answers?: Record<string, string>;
}

export interface ApplyResponse {
  application_id: string;
  status: string;
  message: string;
  ats_type?: string;
}

export interface ApplyStatus {
  job_id: string;
  status: "queued" | "in_progress" | "success" | "failed" | "rate_limited";
  message?: string;
  application_id?: string;
  ats_type?: string;
  submitted_at?: string;
}

export interface BatchApplyRequest {
  job_ids: string[];
  resume_id?: string;
  cover_letter_template?: string;
}

export interface BatchApplyResponse {
  queued: number;
  skipped: number;
  errors: string[];
}

export interface RateLimits {
  max_per_hour: number;
  max_per_day: number;
  current_hour: number;
  current_day: number;
  reset_at: string;
}

export interface DryRunResult {
  job_id: string;
  ats_type: string;
  fields_detected: string[];
  can_auto_apply: boolean;
  missing_info: string[];
  estimated_time: number;
}

// ============================================================================
// Portals
// ============================================================================
export interface Portal {
  id: string;
  name: string;
  type: "linkedin" | "indeed" | "glassdoor" | "builtin" | "greenhouse" | "lever" | "workday" | "other";
  url: string;
  status: "active" | "inactive" | "error";
  jobs_count: number;
  last_sync?: string;
  config?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PortalsResponse {
  portals: Portal[];
  total: number;
}

// ============================================================================
// GDPR
// ============================================================================
export interface GDPRExportRequest {
  format?: "json" | "csv";
}

export interface GDPRExportResponse {
  request_id: string;
  status: "processing" | "ready" | "expired";
  download_url?: string;
  expires_at?: string;
}

export interface GDPRDeleteResponse {
  request_id: string;
  status: "scheduled" | "processing" | "completed";
  scheduled_at?: string;
}

// ============================================================================
// Work Mode
// ============================================================================
export interface WorkModeDetection {
  work_mode: "remote" | "hybrid" | "onsite";
  confidence: number;
  reasoning: string;
}

export interface WorkModeStats {
  total_analyzed: number;
  remote_count: number;
  hybrid_count: number;
  onsite_count: number;
}

// ============================================================================
// Employment Type
// ============================================================================
export interface EmploymentTypeDetection {
  employment_type: "full-time" | "part-time" | "contract" | "freelance" | "internship" | "temporary";
  confidence: number;
  duration?: string;
}

export interface EmploymentTypeStats {
  total_analyzed: number;
  breakdown: Record<string, number>;
}
