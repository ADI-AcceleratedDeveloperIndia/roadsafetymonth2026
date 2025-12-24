"use client";

import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";

export default function BasicsPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");

  return (
    <div className="rs-container py-12 space-y-8">
      <div className="text-center space-y-4">
        <span className="rs-chip flex items-center gap-2 justify-center">
          <BookOpen className="h-4 w-4" /> Basics
        </span>
        <h1 className="text-4xl font-bold text-emerald-900">Basics <span className="text-3xl text-emerald-700">(For All)</span></h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Essential road safety knowledge for everyone. Content coming soon...
        </p>
      </div>

      <div className="rs-card p-8 text-center">
        <p className="text-slate-500">This page is being prepared. Content will be added shortly.</p>
      </div>
    </div>
  );
}

