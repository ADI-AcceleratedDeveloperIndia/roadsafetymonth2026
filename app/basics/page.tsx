"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { generateReferenceId } from "@/lib/reference";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function BasicsPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // For now, Basics page is placeholder - when content is added, completion will be tracked
    // This is a placeholder that will be updated when content is added
  }, []);

  const handleCompletion = async () => {
    if (referenceId) return; // Already completed
    
    setIsSaving(true);
    try {
      const response = await fetch("/api/pages/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageType: "basics" }),
      });

      const data = await response.json();
      if (response.ok && data.referenceId) {
        setReferenceId(data.referenceId);
      } else {
        // Fallback: generate client-side reference ID if API fails
        setReferenceId(generateReferenceId("BASICS"));
      }
    } catch (error) {
      console.error("Error saving completion:", error);
      // Fallback: generate client-side reference ID
      setReferenceId(generateReferenceId("BASICS"));
    } finally {
      setIsSaving(false);
    }
  };

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

      <div className="rs-card p-8 text-center space-y-4">
        <p className="text-slate-500">This page is being prepared. Content will be added shortly.</p>
        {!referenceId && (
          <button
            onClick={handleCompletion}
            disabled={isSaving}
            className="rs-btn-primary"
          >
            {isSaving ? "Saving..." : "Mark as Completed"}
          </button>
        )}
        {referenceId && (
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="py-6 space-y-2">
              <p className="text-lg font-semibold text-emerald-900">
                Completion Recorded!
              </p>
              <p className="text-sm text-emerald-800">
                Reference ID: <Badge className="text-base px-4 py-2">{referenceId}</Badge>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

