import React from "react";
import { FileBadge2, MessageCircle, Shield, Info, Mail } from "lucide-react";

/**
 * Terms of Service – EMA
 * - Includes explicit SMS terms & links to Privacy Policy
 */
export default function TermsOfService() {
  const items = [
    {
      icon: Info,
      title: "1. Use of Services",
      body: (
        <p>
          EMA connects volunteers and families for community support such as meal delivery,
          childcare assistance, and event coordination. You agree to use these services only
          for lawful purposes and in accordance with these terms.
        </p>
      ),
    },
    {
      icon: MessageCircle,
      title: "2. SMS Notifications",
      body: (
        <div className="space-y-2">
          <p>
            By providing your phone number through our registration forms, you consent to
            receive automated text messages from EMA regarding confirmations, scheduling,
            and updates. Message and data rates may apply. Message frequency varies.
          </p>
          <p>
            You may opt out at any time by replying <strong>STOP</strong>. For assistance,
            reply <strong>HELP</strong>. Consent is not a condition of service.
          </p>
        </div>
      ),
    },
    {
      icon: Shield,
      title: "3. Privacy",
      body: (
        <p>
          Your information is handled according to our{" "}
          <a className="underline" href="/privacy-policy">
            Privacy Policy
          </a>.
        </p>
      ),
    },
    {
      icon: FileBadge2,
      title: "4. Limitation of Liability",
      body: (
        <p>
          EMA provides services “as is” without warranties of any kind. To the fullest
          extent permitted by law, EMA is not liable for indirect, incidental, or
          consequential damages arising from participation in our programs or use of our
          messaging services.
        </p>
      ),
    },
    {
      icon: Info,
      title: "5. Changes to These Terms",
      body: (
        <p>
          We may update these terms periodically. Updates will be posted on this page with a
          revised “Last updated” date.
        </p>
      ),
    },
    {
      icon: Mail,
      title: "6. Contact Us",
      body: (
        <p>
          Questions about these terms? Email{" "}
          <a className="underline" href="mailto:info@essentialmom.net">
            info@essentialmom.net
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
              Terms of Service
            </h1>
            <p className="mt-3 text-white/90">Last updated: November 2025</p>
          </div>
        </div>
      </header>

      <main className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-slate-600">
            Welcome to Essential Mom Assistance Inc (“EMA”). By accessing or using our
            website, programs, or text messaging services, you agree to the terms below.
          </p>

          <div className="space-y-6">
            {items.map(({ icon: Icon, title, body }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Icon className="h-5 w-5 text-indigo-600" aria-hidden="true" /> {title}
                </div>
                <div className="mt-3 text-slate-700 leading-relaxed">{body}</div>
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
          <pattern id="grid-tos" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-tos)" className="text-slate-400" />
      </svg>
    </div>
  );
}
