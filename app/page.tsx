"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  BrainCircuit,
  GraduationCap,
  Activity,
  Award,
  Compass,
  Users,
  BookOpenCheck,
  ArrowRight,
  TrafficCone,
  AlertTriangle,
  Footprints,
} from "lucide-react";

const rulesSections = [
  {
    title: "Helmet Protocol",
    icon: <TrafficCone className="h-6 w-6" />,
    description:
      "Always wear a BIS-certified helmet while riding a two-wheeler. Secure the chin strap snugly and ensure your pillion rider does the same.",
  },
  {
    title: "Seatbelt Discipline",
    icon: <ShieldCheck className="h-6 w-6" />,
    description:
      "Fasten seatbelts in every seat. Child passengers must use age-appropriate safety seats even on short trips.",
  },
  {
    title: "Speed Awareness",
    icon: <AlertTriangle className="h-6 w-6" />,
    description:
      "Follow posted speed limits, especially in residential areas, school zones, and at zebra crossings.",
  },
  {
    title: "Pedestrian Priority",
    icon: <Footprints className="h-6 w-6" />,
    description:
      "Always stop for pedestrians at zebra crossings. Avoid distractions like mobile phones while walking across roads.",
  },
];

const featureCards = [
  {
    title: "Road Safety",
    description: "Comprehensive guides and prevention tips for students, parents, and community members.",
    href: "/road-safety",
    icon: <BookOpenCheck className="h-6 w-6" />,
    accent: "bg-yellow-100 text-yellow-800",
  },
];

const engagementHighlights = [
  {
    label: "Quiz Arena",
    description: "Earn merit badges by acing the 15-question knowledge check.",
    href: "/quiz",
    icon: <GraduationCap className="h-6 w-6" />,
  },
  {
    label: "Simulation Lab",
    description: "Fix violations in gamified scenarios: no helmet, triple riding, and drunk driving.",
    href: "/simulation",
    icon: <BrainCircuit className="h-6 w-6" />,
  },
  {
    label: "Certificates Hub",
    description: "Generate, preview, and verify official Telangana Road Safety certificates.",
    href: "/certificates",
    icon: <Award className="h-6 w-6" />,
  },
];

export default function Home() {
  const { t } = useTranslation("common");
  const leadershipProfiles = [
    {
      title: "Hon'ble Chief Minister",
      name: "Sri Anumula Revanth Reddy Garu",
      image: "/assets/leadership/CM.png",
      alt: "Sri Anumula Revanth Reddy Garu",
    },
    {
      title: "Hon'ble Transport Minister",
      name: "Sri Ponnam Prabhakar Garu",
      image: "/assets/minister/Sri-Ponnam-Prabhakar.jpg",
      alt: "Sri Ponnam Prabhakar Garu",
    },
  ];

  return (
    <div className="space-y-24">
      <section className="rs-hero-pattern">
        <div className="rs-container py-16 md:py-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12">
            <div className="flex-1 space-y-6 text-white">
              <span className="rs-chip" style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff" }}>
                Government of Telangana • Road Safety Month
              </span>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                Together for Safer Roads. Learn, Act, and Lead by Example.
              </h1>
              <p className="text-base md:text-lg text-white/80 max-w-xl">
                Road safety is a shared responsibility. Explore gamified learning, interactive simulations, and official
                certifications built to engage students, educators, and communities across Telangana.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/quiz" className="rs-btn-secondary">
                  <ShieldCheck className="h-5 w-5" />
                  Take the Quiz Challenge
                </Link>
                <Link href="/simulation" className="rs-btn-primary">
                  <BrainCircuit className="h-5 w-5" />
                  Launch Simulation Lab
                </Link>
              </div>
            </div>
            <div className="relative flex-1 min-w-[280px]">
              <div className="rs-roadstrap flex flex-col items-center gap-8 p-8 md:p-10 relative overflow-hidden" style={{ background: 'transparent' }}>
                {/* Video Background */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.5 }}
                >
                  <source src="/assets/HEROSECTION PHOTOCONTAINERBACKGROUND.mp4" type="video/mp4" />
                </video>
                
                <div className="grid w-full max-w-md grid-cols-1 gap-6 sm:grid-cols-2" style={{ position: 'relative', zIndex: 10 }}>
                  {leadershipProfiles.map((leader) => (
                    <div
                      key={leader.name}
                      className="flex flex-col items-center gap-4 rounded-3xl border border-white/70 bg-white/95 p-6 text-emerald-900 backdrop-blur-lg shadow-[0_18px_38px_rgba(0,0,0,0.22)]"
                    >
                      <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-[0_16px_28px_rgba(0,0,0,0.18)]">
                        <Image
                          src={leader.image}
                          alt={leader.alt}
                          width={320}
                          height={320}
                          className="h-full w-full object-cover"
                          priority
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-xs uppercase tracking-wide text-emerald-500">{leader.title}</p>
                        <p className="text-lg font-semibold text-emerald-900">{leader.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center text-white relative z-10">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/70">Live Dashboard</p>
                  <p className="text-sm font-semibold text-white">Updated every hour</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rs-section rs-grid-bg">
        <div className="rs-container space-y-10">
          <div className="space-y-3 text-center">
            <span className="rs-chip">Transport-approved regulations</span>
            <h2 className="text-3xl font-semibold text-emerald-900">Road Safety Rules for Every Citizen</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Telangana mandates strict adherence to road safety regulations to protect every commuter. Review the essentials
              below and integrate them into your daily travel routine.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {rulesSections.map((rule) => (
              <div key={rule.title} className="rs-card p-6">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  {rule.icon}
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-2">{rule.title}</h3>
                <p className="text-sm text-slate-600">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rs-section">
        <div className="rs-container space-y-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="rs-chip">Learn More</span>
              <h2 className="text-3xl font-semibold text-emerald-900 mt-3">Comprehensive Road Safety Resources</h2>
              <p className="text-slate-600 max-w-2xl">
                Dive deeper into interactive guides and prevention strategies designed for students, educators, and communities.
              </p>
            </div>
            <Link href="/events" className="rs-btn-secondary">
              <ArrowRight className="h-4 w-4" /> Log a Road Safety Event
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-1">
            {featureCards.map((card) => (
              <Link key={card.title} href={card.href} className="rs-card block h-full p-8">
                <div className="flex items-center gap-6">
                  <div className={`${card.accent} inline-flex h-16 w-16 items-center justify-center rounded-xl flex-shrink-0`}>{card.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-emerald-900 mb-2">{card.title}</h3>
                    <p className="text-base text-slate-600" dangerouslySetInnerHTML={{ __html: card.description }} />
                  </div>
                  <ArrowRight className="h-6 w-6 text-emerald-700 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rs-section">
        <div className="rs-container space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="rs-chip">Engagement Hub</span>
              <h2 className="text-3xl font-semibold text-emerald-900 mt-3">Play. Learn. Earn Road Safety Points.</h2>
            </div>
            <p className="text-slate-600 max-w-2xl">
              Earn badges, unlock certificates, and track your progress with reference IDs generated for every quiz,
              simulation, and training completed.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {engagementHighlights.map((item) => (
              <div key={item.label} className="rs-card p-6">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">{item.label}</h3>
                <p className="text-sm text-slate-600 mb-5">{item.description}</p>
                <Link href={item.href} className="inline-flex items-center text-sm font-semibold text-emerald-700 gap-2">
                  Go to {item.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rs-section">
        <div className="rs-container grid gap-10 md:grid-cols-[1.4fr_1fr] items-center">
          <div className="space-y-5">
            <span className="rs-chip">Minister&apos;s message</span>
            <h2 className="text-3xl font-semibold text-emerald-900">Road Safety is a shared promise to Telangana.</h2>
            <p className="text-slate-700 text-lg">
              "Road safety is a shared responsibility that requires the collective effort of every citizen. This month, we
              come together to raise awareness, educate our communities, and commit to making Telangana&apos;s roads safer for
              everyone."
            </p>
            <p className="text-sm text-slate-600">Sri Ponnam Prabhakar Garu • Hon&apos;ble Transport & BC Welfare Minister</p>
          </div>
          <div className="rs-card overflow-hidden p-0">
            <div className="flex flex-col items-center gap-4 p-6 bg-white">
              <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-emerald-200 shadow-lg">
                <img
                  src="/assets/minister/Sri-Ponnam-Prabhakar.jpg"
                  alt="Sri Ponnam Prabhakar Garu"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-emerald-900">Sri Ponnam Prabhakar Garu</p>
                <p className="text-sm text-slate-600">Hon&apos;ble Minister for Transport & BC Welfare</p>
              </div>
              <p className="text-sm text-slate-600 text-center">
                Join institutions across Telangana that are pledging, conducting workshops, and tracking impact through the
                official dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rs-section">
        <div className="rs-container grid gap-6 md:grid-cols-3">
          <div className="rs-card p-6">
            <h3 className="text-lg font-semibold text-emerald-900">Student-friendly</h3>
            <p className="text-sm text-slate-600">
              Designed with youth-focused UI, gamified flows, and bilingual support so learning remains fun and impactful.
            </p>
          </div>
          <div className="rs-card p-6">
            <h3 className="text-lg font-semibold text-emerald-900">Government-endorsed</h3>
            <p className="text-sm text-slate-600">
              Official certificates, verified reference IDs, and direct access to Transport Department initiatives.
            </p>
          </div>
          <div className="rs-card p-6">
            <h3 className="text-lg font-semibold text-emerald-900">Community-driven</h3>
            <p className="text-sm text-slate-600">
              Institutions log events, students share pledges, and families learn together to make Telangana&apos;s roads safer.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
