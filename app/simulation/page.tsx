"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import HelmetPrototype from "./HelmetPrototype";
import TripleRidingSimulation from "./TripleRidingSimulation";
import DrunkDriveSimulation from "./DrunkDriveSimulation";
import OverspeedSimulation from "./OverspeedSimulation";
import { BrainCircuit, Sparkles, ShieldCheck, WineOff, Gauge } from "lucide-react";

type SimulationStatus = "not-started" | "correct" | "wrong";

export default function SimulationPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId") || null;

  // Track completion status of all 4 simulations
  const [simulationStatus, setSimulationStatus] = useState<{
    helmet: SimulationStatus;
    triple: SimulationStatus;
    drunk: SimulationStatus;
    overspeed: SimulationStatus;
  }>({
    helmet: "not-started",
    triple: "not-started",
    drunk: "not-started",
    overspeed: "not-started",
  });

  // Callback when a simulation is completed
  const handleSimulationComplete = (simulationId: "helmet" | "triple" | "drunk" | "overspeed", success: boolean) => {
    setSimulationStatus((prev) => ({
      ...prev,
      [simulationId]: success ? "correct" : "wrong",
    }));
  };

  // Calculate score and redirect when all 4 are completed
  useEffect(() => {
    const { helmet, triple, drunk, overspeed } = simulationStatus;
    const allCompleted = 
      helmet !== "not-started" &&
      triple !== "not-started" &&
      drunk !== "not-started" &&
      overspeed !== "not-started";

    if (allCompleted) {
      // Calculate score
      const correct = [
        helmet === "correct",
        triple === "correct",
        drunk === "correct",
        overspeed === "correct",
      ].filter(Boolean).length;
      
      const total = 4;
      const percentage = Math.round((correct / total) * 100);
      const scoreLabel = `${correct}/${total} • ${percentage}%`;
      
      // Determine certificate type: SIM if >50%, PAR if <=50%
      const certificateType = percentage > 50 ? "SIM" : "PAR";
      
      // Generate reference ID using API (proper format)
      fetch("/api/certificates/generate-reference-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateType }),
      })
        .then((res) => res.json())
        .then((data) => {
          const referenceId = data.referenceId || `KRMR-RSM-2026-PDL-RHL-${certificateType}-${Date.now().toString().slice(-8)}`;
          
          // Redirect to certificate page after 2 seconds
          setTimeout(() => {
            const params = new URLSearchParams({
              type: certificateType,
              score: scoreLabel,
              ref: referenceId,
            });
            
            if (eventIdFromUrl) {
              params.set("eventId", eventIdFromUrl);
            } else {
              params.set("event", "Online Traffic Rules Simulation Event");
            }
            
            router.push(`/certificates/generate?${params.toString()}`);
          }, 2000);
        })
        .catch(() => {
          // Fallback if API fails
          const referenceId = `KRMR-RSM-2026-PDL-RHL-${certificateType}-${Date.now().toString().slice(-8)}`;
          setTimeout(() => {
            const params = new URLSearchParams({
              type: certificateType,
              score: scoreLabel,
              ref: referenceId,
            });
            
            if (eventIdFromUrl) {
              params.set("eventId", eventIdFromUrl);
            } else {
              params.set("event", "Online Traffic Rules Simulation Event");
            }
            
            router.push(`/certificates/generate?${params.toString()}`);
          }, 2000);
        });
    }
  }, [simulationStatus, eventIdFromUrl, router]);
  
  return (
    <div className="rs-container py-12 space-y-12">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-4">
          <span className="rs-chip flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" /> {tc("simulationLab")}
          </span>
          <h1 className="text-3xl font-semibold text-emerald-900">Simulation <span className="text-2xl text-emerald-700">(School)</span></h1>
          <p className="text-slate-600 max-w-2xl">
            {tc("dragAndDropLearning") || "Drag-and-drop micro learning challenges that help you identify and correct common road safety violations. Earn completion reference IDs for every simulation you master."}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-emerald-100 p-5 shadow-sm text-sm text-emerald-700 space-y-3">
          <p className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4" /> {tc("completionRewards") || "Completion Rewards"}</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>{tc("referenceIdForEachSimulation") || "Reference ID for each simulation completion"}</li>
            <li>{tc("instantFeedbackOnSafeDecisions") || "Instant feedback on safe decisions"}</li>
            <li>{tc("supportsQuizCertificateProgress") || "Supports quiz & certificate progress"}</li>
          </ul>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto shadow-none border-none">
        <CardHeader className="text-center">
          <CardTitle>{tc("interactiveRoadSafetySimulations") || "Interactive Road Safety Simulations"}</CardTitle>
          <CardDescription>
            {tc("chooseViolationScenario") || "Choose a violation scenario and drag the suggested solutions onto the violation to transform the scene into a safe one."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="helmet" className="w-full">
            <div className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="helmet"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-200 bg-white px-3 py-3 text-sm font-semibold text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span className="hidden sm:inline">Violation 1</span>
                  <span className="sm:hidden">V1</span>
                </TabsTrigger>
                <TabsTrigger
                  value="triple"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-200 bg-white px-3 py-3 text-sm font-semibold text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span className="hidden sm:inline">Violation 2</span>
                  <span className="sm:hidden">V2</span>
                </TabsTrigger>
                <TabsTrigger
                  value="drunk"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-200 bg-white px-3 py-3 text-sm font-semibold text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <WineOff className="h-5 w-5" />
                  <span className="hidden sm:inline">Violation 3</span>
                  <span className="sm:hidden">V3</span>
                </TabsTrigger>
                <TabsTrigger
                  value="overspeed"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-200 bg-white px-3 py-3 text-sm font-semibold text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <Gauge className="h-5 w-5" />
                  <span className="hidden sm:inline">Violation 4</span>
                  <span className="sm:hidden">V4</span>
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-slate-500">{tc("tapViolationToSwitch") || "Tap a violation above to switch the scenario."}</p>
                {Object.values(simulationStatus).some(status => status !== "not-started") && (
                  <div className="text-xs text-emerald-700 font-medium">
                    Progress: {Object.values(simulationStatus).filter(s => s !== "not-started").length}/4 completed
                  </div>
                )}
              </div>
            </div>

            <TabsContent value="helmet" className="mt-6">
              <HelmetPrototype onComplete={(success) => handleSimulationComplete("helmet", success)} />
            </TabsContent>

            <TabsContent value="triple" className="mt-6">
              <TripleRidingSimulation onComplete={(success) => handleSimulationComplete("triple", success)} />
            </TabsContent>

            <TabsContent value="drunk" className="mt-6">
              <DrunkDriveSimulation onComplete={(success) => handleSimulationComplete("drunk", success)} />
            </TabsContent>

            <TabsContent value="overspeed" className="mt-6">
              <OverspeedSimulation onComplete={(success) => handleSimulationComplete("overspeed", success)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="rs-card p-6">
        <h3 className="text-lg font-semibold text-emerald-900 mb-3">{tc("moreScenariosArrivingSoon") || "More scenarios arriving soon"}</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-600">
          <span>• {tc("scenarioWrongSideBike") || "Wrong-side bike riding"}</span>
          <span>• {tc("scenarioSignalJumping") || "Signal jumping (bike)"}</span>
          <span>• {tc("scenarioDrunkRiding") || "Drunk riding (bike)"}</span>
          <span>• {tc("scenarioGiveWayAmbulance") || "Give way to ambulance (car)"}</span>
          <span>• {tc("scenarioBlockedZebra") || "Blocked zebra crossing (car)"}</span>
          <span>• {tc("scenarioParkingFootpath") || "Parking on footpath (car)"}</span>
          <span>• {tc("scenarioOverspeedSchoolZone") || "Overspeed in school zone (car)"}</span>
          <span>• {tc("scenarioTailgating") || "Tailgating (car)"}</span>
          <span>• {tc("scenarioJaywalking") || "Jaywalking (pedestrian)"}</span>
          <span>• {tc("scenarioPhoneWhileCrossing") || "Using phone while crossing"}</span>
          <span>• {tc("scenarioCrossingDuringGreen") || "Crossing during green"}</span>
          <span>• {tc("scenarioWalkingOnRoad") || "Walking on road instead of footpath"}</span>
          <span>• {tc("scenarioWrongSideAuto") || "Wrong-side auto driving"}</span>
          <span>• {tc("scenarioBlockingFireTruck") || "Blocking fire truck (vehicles)"}</span>
          <span>• {tc("scenarioZigZagOvertaking") || "Zig-zag/rash overtaking (bike)"}</span>
        </div>
      </div>
    </div>
  );
}
