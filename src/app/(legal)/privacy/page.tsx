/**
 * Privacy Policy Page
 * Author: Ahmed Adel Bakr Alderai
 */

import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | JobFlow",
  description: "JobFlow privacy policy and data handling practices",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 2026
        </p>

        <div className="mt-8 space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              1. Information We Collect
            </h2>
            <p className="mt-3">
              JobFlow collects information you provide directly, including your
              email address, name, resume/CV files, LinkedIn connection data, and
              job search preferences. We also collect usage data such as
              application history, agent activity logs, and analytics metrics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              2. How We Use Your Information
            </h2>
            <p className="mt-3">
              We use your information to power the job search automation
              pipeline, including job discovery, application submission, contact
              management, and AI-powered career coaching. Your data is processed
              to generate match scores, salary benchmarks, skills gap analyses,
              and visa eligibility assessments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              3. Data Storage and Security
            </h2>
            <p className="mt-3">
              Your data is stored in encrypted databases with WAL mode for
              concurrent access safety. We use JWT authentication, PBKDF2
              password hashing with 600K iterations, and enforce HTTPS for all
              communications. API rate limiting and security headers protect
              against common web vulnerabilities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              4. Third-Party Services
            </h2>
            <p className="mt-3">
              JobFlow integrates with third-party services including LinkedIn
              (for job discovery and networking), Stripe (for payment
              processing), and various AI providers (Anthropic, OpenAI, NVIDIA)
              for intelligent features. Each service has its own privacy policy
              governing their data handling practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              5. Your Rights (GDPR)
            </h2>
            <p className="mt-3">
              You have the right to access, rectify, erase, and export your
              personal data. You can request data deletion through your account
              settings or by contacting us. We maintain GDPR compliance with
              audit logging and data anonymization capabilities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              6. Data Retention
            </h2>
            <p className="mt-3">
              We retain your data for as long as your account is active. Deleted
              data enters a soft-delete state for 30 days before permanent
              removal. You may request immediate permanent deletion at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              7. Contact
            </h2>
            <p className="mt-3">
              For privacy-related inquiries, please contact us through your
              account settings or the support channel.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
