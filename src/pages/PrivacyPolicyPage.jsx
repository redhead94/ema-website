import React from "react";
import { Shield, FileText, Phone, Mail, Building2 } from "lucide-react";

/**
 * Privacy Policy – EMA
 * - Includes SMS consent language required for A2P 10DLC
 * - Mobile-first, accessible, Tailwind styled
 */
export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Shield,
      title: "Information We Collect",
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Personal details you provide (name, email, phone number).</li>
          <li>Program details (family needs, volunteer preferences & scheduling).</li>
          <li>Message metadata related to SMS confirmations and reminders.</li>
          <li>Non-identifying usage data (pages visited, browser type).</li>
        </ul>
      ),
    },
    {
      icon: FileText,
      title: "How We Use Information",
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Coordinate assistance between families and volunteers.</li>
          <li>Send confirmations, reminders, and updates related to EMA activities.</li>
          <li>Improve our services, communications, and operations.</li>
        </ul>
      ),
    },
    {
      icon: Phone,
      title: "SMS Messaging & Consent",
      content: (
        <div className="space-y-2">
          <p>
            By providing your mobile number, you consent to receive text messages from
            Essential Mom Assistance Inc (“EMA”). Message and data rates may apply.
            Message frequency varies based on participation.
          </p>
          <p>
            You can opt out at any time by replying <strong>STOP</strong>. To request help,
            reply <strong>HELP</strong>. We do not require you to consent to receive SMS as
            a condition of using our services.
          </p>
        </div>
      ),
    },
    {
      icon: Building2,
      title: "Information Sharing",
      content: (
        <p>
          We do not sell or rent personal information. We may share limited data with
          service providers (e.g., Twilio) strictly to deliver our messaging and
          communications. These providers are obligated to protect your information.
        </p>
      ),
    },
    {
      icon: Shield,
      title: "Data Security",
      content: (
        <p>
          We use industry-standard safeguards to protect your data. However, no system is
          100% secure, and you use our services at your own risk.
        </p>
      ),
    },
    {
      icon: FileText,
      title: "Your Rights",
      content: (
        <p>
          You may request access, correction, or deletion of your personal information by
          contacting us at <a className="underline" href="mailto:info@essentialmomassistance.org">
          info@essentialmomassistance.org</a>.
        </p>
      ),
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: (
        <p>
          Questions about this policy? Email{" "}
          <a className="underline" href="mailto:info@essentialmomassistance.org">
            info@essentialmomassistance.org
          </a>.
        </p>
      ),
    },
  ];

  return (
    <div className="relative isolate bg-white text-slate-900">
      <BackgroundPattern />

      <header className="relative">
        <div className="relative min-h-[32vh] flex items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <div className="z-10 text-center max-w-3xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-3 text-white/90">Last updated: November 2025</p>
          </div>
        </div>
      </header>

      <main className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-slate-600">
            Essential Mom Assistance Inc (“EMA”, “we”, “us”, or “our”) respects your
            privacy. This policy explains what we collect, how we use it, and your choices.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map(({ icon: Icon, title, content }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Icon className="h-5 w-5 text-indigo-600" aria-hidden="true" /> {title}
                </div>
                <div className="mt-3 text-slate-700 leading-relaxed">{content}</div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/** BackgroundPattern - decorative */
function BackgroundPattern() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[85vw] max-w-[900px] h-[85vw] rounded-full opacity-25 blur-3xl bg-gradient-to-br from-indigo-200 to-blue-100" />
      <div className="absolute -bottom-40 right-1/2 translate-x-1/3 w-[70vw] max-w-[700px] h-[70vw] rounded-full opacity-20 blur-3xl bg-gradient-to-tr from-cyan-100 to-indigo-200" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
        <defs>
          <pattern id="grid-pp" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pp)" className="text-slate-400" />
      </svg>
    </div>
  );
}
