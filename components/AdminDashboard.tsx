"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Award, FileText, Users, Download, Activity, MapPin, BookOpen, Copy, Check, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalAppreciations: 0,
    totalEvents: 0,
    totalQuizPasses: 0,
    totalQuizAttempts: 0,
    passRate: 0,
    totalSimulationPlays: 0,
    districts: [] as { key: string; count: number }[],
  });
  const [simStats, setSimStats] = useState({
    totalSessions: 0,
    totalCompletions: 0,
    successRate: 0,
    categoryStats: [] as { category: string; total: number; successful: number }[],
    avgTimeSeconds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [appreciations, setAppreciations] = useState<{ fullName: string; appreciationText: string; createdAt: string }[]>([]);
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);
  const [pendingOrganisers, setPendingOrganisers] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats/overview").then((res) => res.ok ? res.json() : null).catch(() => null),
      fetch("/api/sim/stats").then((res) => res.ok ? res.json() : null).catch(() => null),
    ])
      .then(([overviewData, simData]) => {
        // Only update if we got valid data from API
        if (overviewData && typeof overviewData === 'object') {
          setStats({
            totalCertificates: overviewData.totalCertificates || 0,
            totalAppreciations: overviewData.totalAppreciations || 0,
            totalEvents: overviewData.totalEvents || 0,
            totalQuizPasses: overviewData.totalQuizPasses || 0,
            totalQuizAttempts: overviewData.totalQuizAttempts || 0,
            passRate: overviewData.passRate || 0,
            totalSimulationPlays: overviewData.totalSimulationPlays || 0,
            districts: overviewData.districts || [],
          });
        }
        if (simData && simData.categoryStats && Array.isArray(simData.categoryStats)) {
          setSimStats({
            totalSessions: simData.totalSessions || 0,
            totalCompletions: simData.totalCompletions || 0,
            successRate: simData.successRate || 0,
            categoryStats: simData.categoryStats || [],
            avgTimeSeconds: simData.avgTimeSeconds || 0,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/appreciations/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "appreciations.csv";
      a.click();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export");
    }
  };

  const fetchPendingOrganisers = async () => {
    setLoadingPending(true);
    try {
      const response = await fetch("/api/organisers/pending");
      const data = await response.json();
      if (response.ok) {
        setPendingOrganisers(data.organisers || []);
      }
    } catch (error) {
      console.error("Error fetching pending organisers:", error);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApproveReject = async (organiserId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch("/api/organisers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organiserId, action }),
      });

      const data = await response.json();

      if (response.ok) {
        if (action === "approve") {
          alert(`Organiser approved!\n\nFinal Organiser ID: ${data.finalOrganiserId}\nEvent Reference ID: ${data.eventReferenceId}`);
        } else {
          alert("Organiser rejected");
        }
        fetchPendingOrganisers();
      } else {
        alert(data.error || `Failed to ${action} organiser`);
      }
    } catch (error) {
      console.error("Approval error:", error);
      alert(`Failed to ${action} organiser`);
    }
  };

  const handleCopyRefId = (refId: string) => {
    navigator.clipboard.writeText(refId);
    setCopiedRefId(refId);
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  const handleDownloadStudyMaterial = async () => {
    try {
      // Try to download the PDF file from the correct path
      const response = await fetch("/assets/Road_Safety_Study_Material.pdf");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Road_Safety_Study_Material.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: Open HTML version in new tab for printing
        window.open("/assets/study-material/road-safety-study-material.html", "_blank");
        alert("PDF file not found. Opening HTML version. You can print it as PDF using your browser's print function.");
      }
    } catch (error) {
      console.error("Download error:", error);
      // Fallback: Open HTML version
      window.open("/assets/study-material/road-safety-study-material.html", "_blank");
      alert("PDF file not available. Opening HTML version. You can print it as PDF using your browser's print function.");
    }
  };

  useEffect(() => {
    fetch("/api/admin/appreciations/list")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setAppreciations(data.items || []))
      .catch(() => setAppreciations([]));
    fetchPendingOrganisers();
  }, []);

  const statCards = [
    {
      label: "Total Certificates",
      value: stats.totalCertificates,
      icon: <FileText className="h-6 w-6" />,
    },
    {
      label: "Appreciations",
      value: stats.totalAppreciations,
      icon: <Award className="h-6 w-6" />,
    },
    {
      label: "Quiz Attempts",
      value: stats.totalQuizAttempts,
      icon: <Users className="h-6 w-6" />,
    },
    {
      label: "Quiz Passes",
      value: stats.totalQuizPasses,
      icon: <Award className="h-6 w-6" />,
    },
  ];

  return (
    <div className="rs-container py-14 space-y-8">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="rs-chip">Transport Department • Admin</span>
            <h1 className="text-3xl font-semibold text-emerald-900 mt-2">Admin Dashboard</h1>
            <p className="text-slate-600 max-w-2xl">
              Monitor certificate issuance, quiz performance, simulation insights, and appreciation submissions across
              Telangana.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-emerald-700">{loading ? "Syncing..." : "Data refreshed"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rs-card p-5">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                {card.icon}
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Live</span>
            </div>
            <p className="text-3xl font-semibold text-emerald-900 mt-4">{card.value}</p>
            <p className="text-sm text-slate-600">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rs-card p-6">
          <p className="text-sm text-slate-600">Quiz pass rate</p>
          <p className="text-4xl font-semibold text-emerald-900">{(stats.passRate * 100).toFixed(1)}%</p>
          <p className="text-xs text-slate-500 mt-2">Passes vs attempts</p>
        </div>
        <div className="rs-card p-6">
          <p className="text-sm text-slate-600">Total simulation plays</p>
          <p className="text-4xl font-semibold text-emerald-900">{stats.totalSimulationPlays}</p>
          <p className="text-xs text-slate-500 mt-2">Includes all interactive scenarios</p>
        </div>
      </div>

      <div className="rs-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">District-wise Participation</h2>
            <p className="text-sm text-slate-600">Certificates issued by district</p>
          </div>
        </div>
        <div className="rs-table-wrapper">
          <table className="rs-table text-sm min-w-[420px]">
            <thead>
              <tr>
                <th className="text-left">District</th>
                <th className="text-left">Count</th>
              </tr>
            </thead>
            <tbody>
              {stats.districts?.map((d) => (
                <tr key={d.key}>
                  <td>{d.key || "Unknown"}</td>
                  <td>{d.count}</td>
                </tr>
              ))}
              {(!stats.districts || stats.districts.length === 0) && (
                <tr>
                  <td colSpan={2}>No data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 sm:hidden">Swipe sideways to check every district entry.</p>
      </div>

      <div className="rs-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-emerald-900">Export Appreciations</h2>
          <p className="text-sm text-slate-600">Download all appreciation messages as CSV.</p>
        </div>
        <Button onClick={handleExport} className="rs-btn-secondary text-sm">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="rs-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Simulation Statistics</h2>
            <p className="text-sm text-slate-600">Spot the Violation metrics</p>
          </div>
          <span className="rs-chip">Avg Time: {simStats.avgTimeSeconds}s</span>
        </div>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-slate-600">
          <div>
            <p>Total sessions</p>
            <p className="text-2xl font-semibold text-emerald-900">{simStats.totalSessions}</p>
          </div>
          <div>
            <p>Total completions</p>
            <p className="text-2xl font-semibold text-emerald-900">{simStats.totalCompletions}</p>
          </div>
          <div>
            <p>Success rate</p>
            <p className="text-2xl font-semibold text-emerald-900">{simStats.successRate}%</p>
          </div>
          <div>
            <p>Avg Time</p>
            <p className="text-2xl font-semibold text-emerald-900">{simStats.avgTimeSeconds}s</p>
          </div>
        </div>
        <div className="text-sm text-slate-600">
          <div>
            <h3 className="font-semibold text-emerald-900 mb-3">Completions by Category</h3>
            <div className="space-y-2">
              {simStats.categoryStats && simStats.categoryStats.length > 0 ? (
                simStats.categoryStats.map((cat) => (
                  <div key={cat.category} className="flex justify-between items-center">
                    <span className="capitalize">{cat.category}</span>
                    <span className="font-semibold text-emerald-800">
                      {cat.successful} / {cat.total}
                    </span>
                  </div>
                ))
              ) : (
                <p>No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Organisers Section */}
      <div className="rs-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Pending Organiser Approvals</h2>
            <p className="text-sm text-slate-600">Review and approve/reject organiser registrations</p>
          </div>
          <Button onClick={fetchPendingOrganisers} variant="outline" size="sm" disabled={loadingPending}>
            {loadingPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
        {loadingPending ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : pendingOrganisers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No pending organisers</div>
        ) : (
          <div className="space-y-3">
            {pendingOrganisers.map((org: any) => (
              <div key={org._id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-emerald-900 text-lg">{org.name}</div>
                    <div className="text-sm text-slate-600 mt-1">{org.organisation}</div>
                    <div className="text-xs text-slate-500 mt-2 space-y-1">
                      <div>
                        <span className="font-medium">Mobile:</span> {org.mobileNumber}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {org.eventLocation}
                      </div>
                      <div>
                        <span className="font-medium">Event Type:</span> {org.eventType}
                      </div>
                      <div>
                        <span className="font-medium">Proposed Date:</span>{" "}
                        {new Date(org.proposedEventDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                          Temp ID: {org.tempOrganiserId}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveReject(org._id, "approve")}
                      className="bg-green-600 hover:bg-green-700 text-white gap-2"
                      size="sm"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                      onClick={() => handleApproveReject(org._id, "reject")}
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rs-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-emerald-900">Appreciation Messages</h2>
        <div className="space-y-4">
          {appreciations.slice(0, 20).map((a, idx) => (
            <div key={idx} className="rounded-xl border border-emerald-100 bg-white/90 p-4">
              <div className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</div>
              <div className="font-semibold text-emerald-900">{a.fullName}</div>
              <div className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{a.appreciationText}</div>
            </div>
          ))}
          {appreciations.length === 0 && <div className="text-sm text-slate-600">No appreciations yet.</div>}
        </div>
      </div>
    </div>
  );
}



