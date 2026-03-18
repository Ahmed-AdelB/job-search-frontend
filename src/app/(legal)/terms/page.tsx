/**
 * Terms of Service Page
 * Author: Ahmed Adel Bakr Alderai
 */

import Link from "next/link";

export const metadata = {
  title: "Terms of Service | JobFlow",
  description: "JobFlow terms of service and usage agreement",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Home
        </Link>

        <h1 className="mt-8 text-3xl font-bold tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 2026
        </p>

        <div className="mt-8 space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="mt-3">
              By accessing or using JobFlow, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, you may not
              use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              2. Description of Service
            </h2>
            <p className="mt-3">
              JobFlow is an AI-powered job search automation platform that
              provides job discovery, automated application submission, contact
              management, interview preparation, salary benchmarking, and career
              coaching. The platform operates through automated agents that
              execute job search tasks on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              3. User Responsibilities
            </h2>
            <p className="mt-3">
              You are responsible for maintaining the confidentiality of your
              account credentials. You agree to provide accurate information for
              job applications and to comply with the terms of service of any
              third-party platforms (LinkedIn, job boards, ATS systems) accessed
              through JobFlow. You must not use the service for spam, fraud, or
              any illegal purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              4. Subscription and Billing
            </h2>
            <p className="mt-3">
              JobFlow offers tiered subscription plans (Free, Starter,
              Professional, Enterprise) with varying feature limits. Paid
              subscriptions are billed through Stripe. You may cancel your
              subscription at any time; cancellation takes effect at the end of
              the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              5. Automated Actions
            </h2>
            <p className="mt-3">
              JobFlow&apos;s agents perform automated actions including job
              applications, outreach messages, and form submissions on your
              behalf. You acknowledge that these automated actions are performed
              under your direction and responsibility. You may configure, pause,
              or stop any automated agent at any time through the Agent Control
              panel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              6. Limitation of Liability
            </h2>
            <p className="mt-3">
              JobFlow is provided &quot;as is&quot; without warranties of any
              kind. We are not liable for any outcomes resulting from automated
              job applications, including but not limited to rejected
              applications, missed opportunities, or account restrictions on
              third-party platforms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              7. Termination
            </h2>
            <p className="mt-3">
              We reserve the right to terminate or suspend your account for
              violation of these terms. Upon termination, you may request export
              of your data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              8. Changes to Terms
            </h2>
            <p className="mt-3">
              We may modify these terms at any time. Continued use of the
              service after changes constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
