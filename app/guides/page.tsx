"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { generateReferenceId } from "@/lib/reference";

type Section = {
  id: string;
  title: string;
  description: string;
  steps: { prompt: string; reinforcement: string }[];
};

const GUIDE_SECTIONS: Section[] = [
  {
    id: "two-wheeler",
    title: "Two-Wheeler Readiness",
    description: "Small routines before you ride make the biggest difference on Telangana's busy roads.",
    steps: [
      {
        prompt: "Do you inspect tyre pressure, chain slack, and brake feel before every long ride?",
        reinforcement:
          "A one-minute inspection keeps grip predictable, prevents wobble, and saves you from roadside breakdowns.",
      },
      {
        prompt: "Do you set mirrors so your shoulders sit just outside the frame?",
        reinforcement:
          "Wide-angle mirrors erase blind spots and help you catch fast-moving cabs and delivery riders early.",
      },
      {
        prompt: "Do you carry reflective rain gear during early mornings and late evenings?",
        reinforcement:
          "Weather turns quickly in Telangana. High-visibility gear keeps you seen when drizzle or dust hits.",
      },
      {
        prompt: "Do you brief your pillion to mount only after your signal?",
        reinforcement:
          "Controlled mounting keeps the bike balanced and avoids low-speed slips near parking exits and signals.",
      },
    ],
  },
  {
    id: "commuter",
    title: "Urban Commute Habits",
    description: "Structure your daily travel so you never rely on risky last-second reactions.",
    steps: [
      {
        prompt: "Do you map potholes, school zones, and ongoing works on your regular route?",
        reinforcement:
          "Knowing hot-spots upfront helps you slow down earlier and keeps everyone calmer around choke points.",
      },
      {
        prompt: "Do you build a five-minute buffer before office or school runs?",
        reinforcement:
          "Starting a little early removes the urge to weave or jump queues — courtesy spreads faster than you think.",
      },
      {
        prompt: "Do you merge into the correct lane at least 100 metres before a turn?",
        reinforcement:
          "Early lane discipline cuts side-swipes and gives heavy vehicles enough time to react to your move.",
      },
      {
        prompt: "Do you practise engine braking instead of sudden pedal slams?",
        reinforcement:
          "Progressive slowing alerts drivers behind and prevents the chain of rear-end bumps common in rush hour.",
      },
    ],
  },
  {
    id: "night-weather",
    title: "Night & Weather Awareness",
    description: "Evening visibility and changing weather demand their own playbook.",
    steps: [
      {
        prompt: "Do you wipe headlamps, tail-lamps, and number plates before a night ride?",
        reinforcement:
          "Clean lenses improve throw by nearly 40%, ensuring others spot you well before junctions.",
      },
      {
        prompt: "Do you flip to low beam the moment you sight reflective signboards or approaching vehicles?",
        reinforcement:
          "Timed dipping avoids glare and keeps everyone — including you — able to read road cues in time.",
      },
      {
        prompt: "Do you slow to walking pace when the first rain dots hit the road?",
        reinforcement:
          "The initial drizzle lifts oil and dust, making the surface glassy. Slowing keeps tyres in control.",
      },
      {
        prompt: "Do you keep a microfiber cloth to reset visor clarity at signals?",
        reinforcement:
          "A quick wipe prevents eye strain and keeps your attention on pedestrians stepping off the curb.",
      },
    ],
  },
  {
    id: "emergency",
    title: "Emergency Preparedness",
    description: "Being calm and equipped is the best support you can offer yourself and others.",
    steps: [
      {
        prompt: "Do you store ICE (In Case of Emergency) contacts with country code on your phone?",
        reinforcement:
          "Emergency responders scan for ICE entries first. Having them saves coordination time during incidents.",
      },
      {
        prompt: "Do you carry a compact first-aid pouch and one pair of gloves in your vehicle?",
        reinforcement:
          "Simple supplies let you help safely while waiting for professional support — even for strangers.",
      },
      {
        prompt: "Do you remember highway helplines 1033 and 112 without looking them up?",
        reinforcement:
          "Dialling the right number instantly mobilises cranes, ambulances, and patrols on national highways.",
      },
      {
        prompt: "Do you rehearse placing reflective triangles or hazard lights during breakdowns?",
        reinforcement:
          "Practising once ensures your instincts put warning devices first, protecting oncoming traffic.",
      },
    ],
  },
];

type Progress = Record<string, boolean[]>;

export default function GuidesPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  
  const [guideProgress, setGuideProgress] = useState<Progress>(() =>
    GUIDE_SECTIONS.reduce((acc, section) => {
      acc[section.id] = section.steps.map(() => false);
      return acc;
    }, {} as Progress)
  );
  const [guideReferenceId, setGuideReferenceId] = useState<string | null>(null);

  const totalGuideSteps = useMemo(
    () => GUIDE_SECTIONS.reduce((total, section) => total + section.steps.length, 0),
    []
  );

  const completedGuideSteps = useMemo(
    () => Object.values(guideProgress).reduce((total, steps) => total + steps.filter(Boolean).length, 0),
    [guideProgress]
  );

  const handleGuideYes = (sectionId: string, stepIndex: number) => {
    setGuideProgress((prev) => {
      const sectionProgress = prev[sectionId];
      if (!sectionProgress || sectionProgress[stepIndex]) return prev;

      const updatedSection = sectionProgress.map((value, idx) => (idx === stepIndex ? true : value));
      const updated = { ...prev, [sectionId]: updatedSection };

      const updatedCompleted = Object.values(updated).reduce(
        (total, steps) => total + steps.filter(Boolean).length,
        0
      );

      if (updatedCompleted === totalGuideSteps && !guideReferenceId) {
        // Save completion to database
        fetch("/api/pages/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageType: "guides" }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.referenceId) {
              setGuideReferenceId(data.referenceId);
            } else {
              // Fallback: generate client-side reference ID
              setGuideReferenceId(generateReferenceId("GUIDE"));
            }
          })
          .catch((error) => {
            console.error("Error saving completion:", error);
            // Fallback: generate client-side reference ID
            setGuideReferenceId(generateReferenceId("GUIDE"));
          });
      }

      return updated;
    });
  };

  return (
    <div className="rs-container py-12 space-y-8">
      <div className="space-y-3 text-center md:text-left">
        <span className="rs-chip flex items-center gap-2 justify-center md:justify-start">
          <BookOpenCheck className="h-4 w-4" /> {tc("safetyGuides") || "Safety Guides"}
        </span>
        <h1 className="text-3xl md:text-4xl font-semibold text-emerald-900">{tc("roadSafetyGuidesForEveryone") || "Road Safety Guides for Everyone"} <span className="text-2xl text-emerald-700">(Undergrad)</span></h1>
        <p className="text-slate-600 max-w-3xl">
          {tc("tapYesToConfirmHabit") || "Tap \"Yes\" to confirm each habit. Only after you respond will the reinforcement appear — helping you actively remember the point. A reference ID unlocks once you acknowledge every habit across all sections."}
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <p className="text-sm font-medium text-slate-700">
          {tc("progress") || "Progress"}: <span className="text-emerald-700">{completedGuideSteps} / {totalGuideSteps}</span>
        </p>
        {!guideReferenceId && (
          <p className="text-xs text-slate-500">
            {tc("keepGoingCompletionId") || "Keep going! The completion ID appears automatically after all prompts are acknowledged."}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {GUIDE_SECTIONS.map((section) => {
          const sectionProgress = guideProgress[section.id] || [];
          const sectionCompleted = sectionProgress.every(Boolean);
          return (
            <Card key={section.id}>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
                {sectionCompleted && <Badge variant="default">{tc("sectionCompleted") || "Section completed"}</Badge>}
              </CardHeader>
              <CardContent className="space-y-4">
                {section.steps.map((step, index) => {
                  const acknowledged = sectionProgress[index];
                  return (
                    <div
                      key={`${section.id}-${index}`}
                      className="rounded-md border border-green-100 bg-white p-4 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <p className="font-medium text-gray-800">{step.prompt}</p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleGuideYes(section.id, index)}
                          disabled={acknowledged}
                        >
                          {acknowledged ? (tc("noted") || "Noted") : (tc("yes") || "Yes")}
                        </Button>
                      </div>
                      {acknowledged && (
                        <p className="text-sm text-green-700 bg-green-50 border-l-4 border-green-500 px-3 py-2 rounded-md">
                          {step.reinforcement}
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {guideReferenceId && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-6 text-center space-y-2">
            <p className="text-lg font-semibold text-green-800">
              {tc("fantasticRevisitedHabits") || "Fantastic! You consciously revisited every habit in this guide."}
            </p>
            <p className="text-sm text-green-800">
              {tc("noteCompletionReferenceId") || "Note your completion reference ID and share it with your coordinator if asked."}
            </p>
            <Badge variant="default" className="text-base px-4 py-2">
              {guideReferenceId}
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
