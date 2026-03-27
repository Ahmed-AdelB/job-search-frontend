/**
 * Dashboard Redirect - redirects /dashboard to /jobs
 * The actual dashboard uses a (dashboard) route group, so pages
 * are at /jobs, /contacts, etc. — not /dashboard/jobs.
 * Author: Ahmed Adel Bakr Alderai
 */

import { redirect } from "next/navigation";

export default function DashboardRedirectPage() {
  redirect("/jobs");
}
