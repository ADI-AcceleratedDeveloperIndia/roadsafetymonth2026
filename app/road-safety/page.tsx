"use client";

import { useTranslation } from "react-i18next";
import { BookOpenCheck, Activity } from "lucide-react";
import Link from "next/link";

export default function RoadSafetyPage() {
  const { t } = useTranslation("common");
  return (
    <div className="rs-container py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-emerald-900">Road Safety Resources</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Access comprehensive guides and prevention tips to make our roads safer.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/guides" className="rs-card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <BookOpenCheck className="h-6 w-6 text-emerald-600" />
            <h2 className="text-2xl font-semibold text-emerald-900">Road Safety Guides <span className="text-lg text-emerald-700">(Undergrad)</span></h2>
          </div>
          <p className="text-slate-600">
            Comprehensive safety guides covering two-wheeler readiness, urban commute habits, night & weather awareness, and emergency preparedness.
          </p>
        </Link>

        <Link href="/prevention" className="rs-card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="h-6 w-6 text-amber-600" />
            <h2 className="text-2xl font-semibold text-emerald-900">Prevention &gt; Cure <span className="text-lg text-emerald-700">(Graduation)</span></h2>
          </div>
          <p className="text-slate-600">
            Learn prevention strategies that help avoid incidents before they occur. Plan your journey, prioritize people, maintain your vehicle, and know how to respond.
          </p>
        </Link>
      </div>
    </div>
  );
}

