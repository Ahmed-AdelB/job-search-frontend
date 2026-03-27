/**
 * Custom Hooks - Public API
 * Author: Ahmed Adel Bakr Alderai
 */

export { useAuth } from "./use-auth"

export {
  usePipelineStats,
  useAnalyticsOverview,
  useFunnelData,
} from "./use-dashboard"

export {
  useJobs,
  useJob,
  useUpdateJobStatus,
  useBulkAction,
  useDeleteJob,
} from "./use-jobs"

export {
  useAgents,
  useAgentAction,
  useAgentConfig,
  useUpdateAgentConfig,
} from "./use-agents"

export {
  useApplications,
  useApplication,
  useUpdateApplication,
  useWithdrawApplication,
  type ApplicationFilters,
} from "./use-applications"

export {
  useInterviews,
  useInterview,
  useScheduleInterview,
  useMarkCompleted,
  usePrepNotes,
  useRegeneratePrepNotes,
  useCalendarExport,
  useUpdateInterview,
  useDeleteInterview,
  type InterviewFilters,
  type ScheduleInterviewData,
} from "./use-interviews"

export {
  useRecruiters,
  useRecruiter,
  useUpdateRecruiter,
  useRecruitersBySpecialization,
  useRecruiterRecommendations,
  useSpecializations,
  type RecruiterFilters,
} from "./use-recruiters"

export {
  useContacts,
  useContact,
  useUpdateContact,
  useDeleteContact,
  useImportContacts,
  type ContactFilters,
} from "./use-contacts"

export {
  useOutreachStats,
  useOutreachMessages,
  useSendMessage,
  useResendMessage,
  useOutreachTemplates,
  type OutreachFilters,
  type SendMessagePayload,
  type OutreachTemplate,
} from "./use-outreach"

export {
  useProfile,
  useUpdateProfile,
  useUploadCV,
  useResumes,
  useDeleteResume,
  useSetPrimaryResume,
} from "./use-profile"

export {
  usePlans,
  useSubscription,
  useCreateCheckout,
  useCancelSubscription,
  useInvoices,
  usePortal,
} from "./use-billing"

export {
  useSkillGap,
  useSkillRecommendations,
  useVisaScore,
  useEligibleOccupations,
  useSalaryBenchmark,
  useSalaryReport,
  useRemoteScore,
  useSalaryReportPDF,
} from "./use-intelligence"

export {
  useTargetCompanies,
  useTargetCompany,
  useCreateTargetCompany,
  useUpdateTargetCompanyTier,
  useUpdateTargetCompany,
  useDeleteTargetCompany,
  useImportTargetCompanies,
  type TargetCompanyFilters,
} from "./use-target-companies"

export {
  useCommunities,
  useCommunity,
  useCommunityRecommendations,
  useTrackCommunity,
  useUntrackCommunity,
  useAddRecommendedCommunity,
  type CommunityFilters,
} from "./use-community"

export {
  useIncomingInvitations,
  useOutgoingInvitations,
  useInvitation,
  useAcceptInvitation,
  useDeclineInvitation,
  useWithdrawInvitation,
  useSendInvitation,
  type InvitationFilters,
} from "./use-invitations"

export {
  useTriagePreview,
  useTriageHistory,
  useTriageConfig,
  useTriageDigest,
  useGenerateTriageDigest,
  useUpdateTriageConfig,
  useCompleteTriageActions,
  type TriageHistoryFilters,
} from "./use-triage"

export { useSSE } from "./use-sse"

export {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  type NotificationsFilters,
} from "./use-notifications"

export {
  useSettings,
  useUpdateSettings,
  useUpdateGeneralSettings,
  useUpdatePipelineSettings,
  useLLMConfig,
  useUpdateLLMConfig,
  useUpdateNotificationSettings,
  useUpdateAdvancedSettings,
} from "./use-settings"

export {
  useAnalyticsOverview as useAnalyticsOverviewDetailed,
  useFunnel,
  useByATS,
  useTimeline,
  useTopSources,
  useTopCompanies,
} from "./use-analytics"

export {
  useApplyToJob,
  useDryRunApply,
  useAutoApply,
  useRetryApplication,
  useBatchApply,
  useApplyStatus,
  useBulkApplyStatus,
  useRateLimits,
  useUpdateRateLimits,
} from "./use-apply"

export {
  usePortals,
  usePortal as usePortalDetail,
  useCreatePortal,
  useDeletePortal,
  useSyncPortal,
} from "./use-portals"

export {
  useGDPRExport,
  useGDPRExportStatus,
  useGDPRDeleteAccount,
} from "./use-gdpr"

export {
  useWorkModeDetect,
  useWorkModeStats,
} from "./use-work-mode"

export {
  useEmploymentTypeDetect,
  useEmploymentTypeStats,
} from "./use-employment-type"
