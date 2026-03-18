/**
 * Navigation Translation Keys Mapping
 * Author: Ahmed Adel Bakr Alderai
 */

export const NAV_KEYS: Record<string, string> = {
  Dashboard: "dashboard",
  Jobs: "jobs",
  Applications: "applications",
  Agents: "agents",
  Contacts: "contacts",
  Outreach: "outreach",
  Recruiters: "recruiters",
  Interviews: "interviews",
  Analytics: "analytics",
  Intelligence: "intelligence",
  "Target List": "targetList",
  Triage: "triage",
  Profile: "profile",
  Settings: "settings",
  Billing: "billing",
  Deploy: "deploy",
  Logs: "logs",
  Notifications: "notifications",
  Admin: "admin",
};

export function getNavKey(label: string): string {
  return NAV_KEYS[label] || label;
}
