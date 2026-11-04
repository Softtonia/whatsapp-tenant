import Link from "next/link";
import {
  Shield,
  FileText,
  Lock,
  ArrowLeft,
  Printer,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Building2,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service & Multi-Tenant Isolation Agreement | WhatsApp CRM",
  description:
    "Terms of service, multi-tenant isolation policy, and Meta WhatsApp Business API compliance agreement.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container max-w-5xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link
            href="/organization-setup"
            className="flex items-center gap-2.5 font-bold text-sm text-foreground hover:opacity-85 transition-opacity"
          >
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <MessageSquare className="size-4" />
            </div>
            <span>WhatsApp CRM</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/organization-setup"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border/70 hover:bg-muted"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Onboarding</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="border-b border-border/60 bg-muted/20 py-10 px-4 sm:px-6">
        <div className="container max-w-5xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
            <Shield className="size-3.5" />
            <span>Multi-Tenant Legal &amp; Compliance Framework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Terms of Service &amp; Multi-Tenant Isolation Agreement
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Effective Date: November 2026 &bull; Version 2.4. This Master Agreement governs your multi-tenant workspace, cryptographic data isolation, WhatsApp Cloud API usage, and billing subscriptions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto flex-1 py-10 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Desktop Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-2 sticky top-24 self-start text-xs">
            <p className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-3">
              Table of Contents
            </p>
            <nav className="space-y-1.5 border-l border-border pl-3 text-muted-foreground">
              <a href="#acceptance" className="block hover:text-primary transition-colors py-0.5">
                1. Acceptance of Terms
              </a>
              <a href="#isolation" className="block hover:text-primary transition-colors py-0.5">
                2. Multi-Tenant Isolation
              </a>
              <a href="#whatsapp" className="block hover:text-primary transition-colors py-0.5">
                3. WhatsApp Cloud API Policy
              </a>
              <a href="#workspace" className="block hover:text-primary transition-colors py-0.5">
                4. Workspace Administration
              </a>
              <a href="#quotas" className="block hover:text-primary transition-colors py-0.5">
                5. Messaging Quotas &amp; Limits
              </a>
              <a href="#billing" className="block hover:text-primary transition-colors py-0.5">
                6. Subscriptions &amp; Payments
              </a>
              <a href="#privacy" className="block hover:text-primary transition-colors py-0.5">
                7. Data Privacy &amp; Security
              </a>
              <a href="#liability" className="block hover:text-primary transition-colors py-0.5">
                8. Liability &amp; SLA
              </a>
            </nav>
          </aside>

          {/* Legal Clauses Body */}
          <article className="lg:col-span-3 space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {/* Section 1 */}
            <section id="acceptance" className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <FileText className="size-4 text-primary" />
                <h2>1. Acceptance of Terms &amp; Scope of Services</h2>
              </div>
              <p>
                By completing the tenant onboarding registration, creating a workspace, or using the WhatsApp CRM platform (&quot;Service&quot;), your organization (&quot;Tenant&quot;, &quot;Customer&quot;, or &quot;You&quot;) agrees to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or other legal entity, you represent and warrant that you possess the full authority to bind such entity.
              </p>
              <p>
                The Service provides multi-tenant messaging aggregation, WhatsApp Business Cloud API integration, CRM contact routing, broadcast campaigns, team collaboration, and automated conversational tools.
              </p>
            </section>

            {/* Section 2 */}
            <section id="isolation" className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <Lock className="size-4 text-primary" />
                <h2>2. Multi-Tenant Isolation &amp; Cryptographic Partitioning Agreement</h2>
              </div>
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-foreground space-y-2">
                <div className="flex items-center gap-2 font-semibold text-xs text-primary">
                  <CheckCircle2 className="size-4" />
                  <span>Strict RFC Isolation Standard</span>
                </div>
                <p className="text-xs text-muted-foreground leading-normal">
                  Each Tenant workspace is provisioned with a dedicated organizational identifier (`tenant_id`), isolated tenant boundaries, and encrypted storage. Under no circumstances will Customer data, WhatsApp message logs, contacts, templates, or media be visible or accessible to any other tenant workspace.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Data Boundary Enforcement:</strong> Every database query, webhook dispatch, and API transaction is scoped strictly to your authenticated workspace context.
                </li>
                <li>
                  <strong>Cryptographic Segregation:</strong> Sensitive credentials (including WhatsApp Cloud API tokens, webhook verify tokens, and payment secrets) are encrypted using AES-256-GCM.
                </li>
                <li>
                  <strong>Zero Cross-Tenant Leakage:</strong> Internal routing prohibits cross-tenant message transmission or shared conversational threads.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="whatsapp" className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <MessageSquare className="size-4 text-primary" />
                <h2>3. Meta WhatsApp Business Cloud API Compliance</h2>
              </div>
              <p>
                Your use of the WhatsApp Cloud API integration is strictly subject to Meta Platforms Inc.&apos;s WhatsApp Business Policy and WhatsApp Commerce Policy. As a Tenant, you agree that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Explicit Customer Opt-In:</strong> You must obtain clear, verifiable opt-in consent from recipients prior to transmitting any proactive marketing broadcast or notification template.
                </li>
                <li>
                  <strong>24-Hour Customer Service Window:</strong> Freeform conversational messages may only be sent within 24 hours of the customer&apos;s last inbound message. Outside this window, only pre-approved Meta message templates are permitted.
                </li>
                <li>
                  <strong>Opt-Out &amp; STOP Processing:</strong> You must honor unsubscribe keywords (such as &quot;STOP&quot;, &quot;UNSUBSCRIBE&quot;) immediately without delay.
                </li>
                <li>
                  <strong>Prohibited Content:</strong> Spamming, deceptive promotions, unlicensed pharmaceuticals, gambling, payday loans, or unlawful material will result in immediate tenant suspension.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="workspace" className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <Building2 className="size-4 text-primary" />
                <h2>4. Workspace Administration &amp; Team Access</h2>
              </div>
              <p>
                The Tenant Administrator is responsible for maintaining all user accounts, role-based access permissions (`Admin`, `Manager`, `Agent`), and enforcing multi-factor authentication (MFA / 2FA).
              </p>
              <p>
                All actions executed by team members, invited agents, or authorized API keys are attributable to the Tenant organization. In the event of compromised credentials, the Administrator must immediately revoke affected member invitations and update security credentials.
              </p>
            </section>

            {/* Section 5 */}
            <section id="quotas" className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <AlertTriangle className="size-4 text-primary" />
                <h2>5. Messaging Quotas, Rate Limits &amp; Fair Use Policy</h2>
              </div>
              <p>
                Each subscription plan specifies predefined monthly conversation quotas, broadcast dispatch limits, and registered WhatsApp phone numbers.
              </p>
              <p>
                Platform throughput is monitored against abnormal burst spikes. If a tenant exhausts their monthly conversation allocation, further proactive broadcasts may be queued or paused until a plan upgrade or quota top-up is processed.
              </p>
            </section>

            {/* Section 6 */}
            <section id="billing" className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <CreditCard className="size-4 text-primary" />
                <h2>6. Subscriptions, Invoicing &amp; Razorpay Payment Terms</h2>
              </div>
              <p>
                Subscription plans are billed in advance on either a monthly or annual recurring cycle. Payments are securely processed via Razorpay or authorized banking gateways.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Prorated Plan Upgrades:</strong> When upgrading your subscription tier mid-period, charges are automatically calculated based on remaining cycle duration.
                </li>
                <li>
                  <strong>Taxes &amp; Invoices:</strong> Applicable GST, VAT, or local taxes are computed based on your country of operation. Itemized VAT/GST receipts are issued upon verified payment capture.
                </li>
                <li>
                  <strong>Cancellations:</strong> You may cancel or schedule cancellation of your workspace subscription at any time. Services will remain active until the conclusion of the current prepaid billing period.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="privacy" className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <Shield className="size-4 text-primary" />
                <h2>7. Data Privacy, Encryption &amp; Document Retention</h2>
              </div>
              <p>
                We comply with international data protection frameworks (including GDPR principles). All data in transit is encrypted using TLS 1.3, and all tenant business verification documents uploaded during onboarding are stored in cryptographically sealed cloud buckets accessible only by your tenant ID.
              </p>
              <p>
                Tenant administrators may request complete data export or workspace deletion in accordance with applicable statutory retention requirements.
              </p>
            </section>

            {/* Section 8 */}
            <section id="liability" className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <CheckCircle2 className="size-4 text-primary" />
                <h2>8. Service Level Agreement &amp; Limitation of Liability</h2>
              </div>
              <p>
                We strive to maintain a 99.9% uptime availability for the core messaging routing engine, excluding scheduled maintenance windows and third-party upstream downtime attributable to Meta WhatsApp Cloud infrastructure.
              </p>
              <p>
                In no event shall either party be liable for any indirect, incidental, punitive, or consequential damages resulting from upstream carrier network delays or Meta account verifications.
              </p>
            </section>

            {/* Contact Support Note */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/30 text-xs space-y-1">
              <p className="font-semibold text-foreground">Legal &amp; Compliance Inquiries</p>
              <p className="text-muted-foreground">
                For questions regarding this agreement, multi-tenant isolation protocols, or custom enterprise SLAs, please contact your organization&apos;s account manager or email{" "}
                <span className="font-mono text-primary font-medium">legal@whatsappcrm.com</span>.
              </p>
            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 px-4 sm:px-6 bg-muted/10 text-center text-xs text-muted-foreground">
        <div className="container max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} WhatsApp CRM Tenant System. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms-of-service#isolation" className="hover:text-foreground transition-colors">
              Multi-Tenant Isolation
            </Link>
            <Link href="/terms-of-service#whatsapp" className="hover:text-foreground transition-colors">
              WhatsApp Policy
            </Link>
            <Link href="/organization-setup" className="hover:text-foreground transition-colors">
              Onboarding
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

