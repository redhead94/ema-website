import React from "react";
import PropTypes from "prop-types";
import { Baby, Users, Utensils, HeartHandshake, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * EMA – Meals & Babysitting (No Forms)
 * - Mobile-first, responsive, and a11y-conscious
 */
export default function HomePage({ setActiveTab }) {
  const features = [
    {
      icon: Utensils,
      title: "Meal Delivery",
      desc:
        "Fresh, nourishing meals delivered to new families to reduce stress and support recovery.",
    },
    {
      icon: Users,
      title: "Volunteer Babysitting",
      desc:
        "A trusted volunteer can watch your baby so you can rest, shower, or make an appointment.",
    },
    {
      icon: Baby,
      title: "Family Support",
      desc:
        "Kind, judgment-free guidance for new parents navigating the early weeks at home.",
    },
  ];

  const stats = [
    { label: "Meals delivered", value: "12,480+" },
    { label: "Babysitting hours", value: "5,200+" },
    { label: "Families supported", value: "1,100+" },
    { label: "Active volunteers", value: "380+" },
  ];

  const navigate = useNavigate();

  const testimonials = [
    {
      quote:
        "EMA showed up when we needed it most. A warm meal and a few hours of rest changed our entire week.",
      name: "Leah & Ben",
      role: "New parents, Silver Spring",
    },
    {
      quote:
        "Volunteering with EMA is simple and meaningful. I can pick up a shift after work and know it matters.",
      name: "Rachel M.",
      role: "Volunteer",
    },
  ];

  return (
    <div className="relative isolate bg-white text-slate-900">
      {/* Decorative background */}
      <BackgroundPattern />

      {/* Header / Hero */}
      <header aria-label="Hero" className="relative">
        <div
          className="relative min-h-[60vh] md:min-h-[70vh] lg:min-h-[86vh] flex items-center justify-center overflow-hidden bg-cover bg-center md:bg-fixed bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.55)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAZ3kf6baCgliCqcVr7ORktCw05xfzqcXnExL47WmertFSXZu8J5tIbxkMRWfITLXUoXPjvVITr-X4D2-tml1VKoTKAQBCISfjAPK1nVH5Oy9ghBY5mT9JcpLzJ3vPAuO9l-jsRzHv3TWT88--JVHpU1c3wRcbwhsNp5RDnMLEefIjtcP-tyy4145V4uh6WX5msADlLIN4CoH6I0gsHp4LvBsMMDw7yMZvpqlaT-CEuVXDUEPbnFJBsYcCm09TtwxahrsrRMvlbhZue')",
          }}
        >
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 text-white">
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              EMA – Essential Mom Assistance
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Supporting new moms- so the transition into parenthood can be smoother and more restful.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => navigate("/donate")}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-7 sm:px-8 py-3 text-base sm:text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 transition"
              >
                Donate
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center justify-center rounded-full bg-white px-7 sm:px-8 py-3 text-base sm:text-lg font-semibold text-slate-900 border border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 transition"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Programs / Features */}
        <section aria-labelledby="how-we-help" className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12">
              <h2 id="how-we-help" className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                How We Help
              </h2>
              <p className="text-base sm:text-lg text-slate-600">
                Supporting families during their most important moments
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
              {features.map(({ icon: Icon, title, desc }) => (
                <FeatureCard key={title} Icon={Icon} title={title} desc={desc} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold">Your kindness goes further with EMA</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/donate")}
                className="rounded-full bg-white px-6 py-3 font-semibold text-indigo-900 shadow hover:bg-indigo-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              >
                Donate
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="rounded-full border border-white/70 px-6 py-3 font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              >
                Contact
              </button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-it-works" className="bg-white border-y border-slate-200 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="how-it-works" className="text-2xl sm:text-3xl font-bold text-center">How EMA Works</h2>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <Step
                title="Reach out"
                desc="Tell us what you need - meals, babysitting, or both. We’ll confirm details and timing."
                Icon={Mail}
              />
              <Step
                title="We match you"
                desc="Coordinators connect you with trained volunteers nearby, aligned to your schedule."
                Icon={Users}
              />
              <Step
                title="Care arrives"
                desc="Receive a warm meal and reliable childcare support - with dignity, respect, and care."
                Icon={HeartHandshake}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

HomePage.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};

/** FeatureCard */
function FeatureCard({ Icon, title, desc }) {
  return (
    <article className="w-full max-w-sm text-center p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="bg-indigo-100 rounded-full w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <Icon className="w-7 sm:w-8 h-7 sm:h-8 text-indigo-600" aria-hidden="true" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{desc}</p>
    </article>
  );
}

FeatureCard.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};

/** Simple Step card */
function Step({ Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-slate-900 font-semibold">
        <Icon className="h-5 w-5 text-indigo-600" aria-hidden="true" /> {title}
      </div>
      <p className="mt-2 text-slate-600">{desc}</p>
    </div>
  );
}

Step.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};

/** BackgroundPattern - decorative SVG blobs & grid */
function BackgroundPattern() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* Soft radial blobs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[90vw] h-[90vw] max-w-[900px] rounded-full opacity-30 blur-3xl bg-gradient-to-br from-indigo-200 to-blue-100" />
      <div className="absolute -bottom-40 right-1/2 translate-x-1/3 w-[80vw] h-[80vw] max-w-[700px] rounded-full opacity-25 blur-3xl bg-gradient-to-tr from-cyan-100 to-indigo-200" />
      {/* Subtle grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-400" />
      </svg>
    </div>
  );
}
