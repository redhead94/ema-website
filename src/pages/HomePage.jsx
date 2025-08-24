import React from "react";
import PropTypes from "prop-types";
import { Baby, Heart, Users } from "lucide-react";

/**
 * HomePage
 * - More semantic markup (header/main/section)
 * - Accessible buttons & focus states
 * - Extracted FeatureCard + data-driven rendering
 * - Subtle motion + decorative SVG background (no external assets)
 * - Mobile-first responsive typography/layout
 */
export default function HomePage({ setActiveTab }) {
  const features = [
    {
      icon: Heart,
      title: "Meal Delivery",
      desc:
        "Fresh, nutritious meals delivered to new families to reduce stress and support recovery.",
    },
    {
      icon: Users,
      title: "Volunteer Babysitting",
      desc:
        "A trusted volunteer can watch your baby for an hour so you can rest, shower, or step out.",
    },
    {
      icon: Baby,
      title: "Family Support",
      desc:
        "Kind, judgment‑free guidance for new parents navigating the early weeks at home.",
    },
  ];

  return (
    <div className="relative isolate bg-white">
      {/* Decorative, non-interactive background */}

      <header aria-label="Hero" className="relative">
        <div className="relative min-h-[70vh] md:min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center overflow-hidden">
          <BackgroundPattern />

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
            <h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-4 sm:mb-6 leading-tight tracking-tight"
            >
              Raise Your Helping Hand
            </h1>

            <p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              We support mothers and families in Silver Spring with meal deliveries, volunteer
              babysitting, and thoughtful care—so the transition into parenthood can be smoother
              and more restful.
            </p>

            <div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
            >
              <button
                onClick={() => setActiveTab("donate")}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 sm:px-8 py-3 text-base sm:text-lg font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 transition"
              >
                Donate
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className="inline-flex items-center justify-center rounded-full bg-white px-7 sm:px-8 py-3 text-base sm:text-lg font-semibold text-gray-800 border border-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 transition"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Features */}
        <section aria-labelledby="how-we-help" className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 id="how-we-help" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                How We Help
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                Supporting families during their most important moments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {features.map(({ icon: Icon, title, desc }) => (
                <FeatureCard key={title} Icon={Icon} title={title} desc={desc} />
              ))}
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
    <article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="text-center p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white"
    >
      <div className="bg-blue-100 rounded-full w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <Icon className="w-7 sm:w-8 h-7 sm:h-8 text-blue-600" aria-hidden="true" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{desc}</p>
    </article>
  );
}

FeatureCard.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};

/** BackgroundPattern — decorative SVG "blob" and grid */
function BackgroundPattern() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* Soft radial blobs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[90vw] h-[90vw] max-w-[900px] rounded-full opacity-30 blur-3xl bg-gradient-to-br from-blue-200 to-indigo-100" />
      <div className="absolute -bottom-40 right-1/2 translate-x-1/3 w-[80vw] h-[80vw] max-w-[700px] rounded-full opacity-25 blur-3xl bg-gradient-to-tr from-cyan-100 to-blue-200" />
      {/* Subtle grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-gray-400" />
      </svg>
    </div>
  );
}
