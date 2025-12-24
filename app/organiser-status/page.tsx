"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Clock, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function OrganiserStatusPage() {
  const [tempId, setTempId] = useState("");
  const [loading, setLoading] = useState(false);
  const [organiserData, setOrganiserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrganiserData(null);

    try {
      const response = await fetch(`/api/organisers/status?tempId=${encodeURIComponent(tempId.trim())}`);
      const data = await response.json();

      if (response.ok) {
        setOrganiserData(data);
      } else {
        setError(data.error || "Failed to check status. Please verify your Temporary Organiser ID.");
      }
    } catch (error) {
      console.error("Status check error:", error);
      setError("Failed to check status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case "Rejected":
        return <XCircle className="h-6 w-6 text-red-600" />;
      case "Pending Approval":
        return <Clock className="h-6 w-6 text-amber-600" />;
      default:
        return <Clock className="h-6 w-6 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 border-green-200 text-green-800";
      case "Rejected":
        return "bg-red-50 border-red-200 text-red-800";
      case "Pending Approval":
        return "bg-amber-50 border-amber-200 text-amber-800";
      default:
        return "bg-slate-50 border-slate-200 text-slate-800";
    }
  };

  return (
    <div className="rs-container py-14">
      <div className="max-w-3xl mx-auto">
        <div className="rs-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold text-emerald-900">Check Organiser Status</h1>
            <p className="text-slate-600">
              Enter your Temporary Organiser ID to check your registration status and get your Final IDs
            </p>
          </div>

          <form onSubmit={handleCheckStatus} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tempId" className="text-sm font-semibold text-emerald-900">
                Temporary Organiser ID *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tempId"
                  value={tempId}
                  onChange={(e) => setTempId(e.target.value.toUpperCase())}
                  placeholder="ORG-TEMP-XXXXX-XXXX"
                  required
                  className="h-11 font-mono"
                />
                <Button type="submit" className="rs-btn-primary" disabled={loading || !tempId.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Checking...
                    </>
                  ) : (
                    "Check Status"
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Enter the Temporary Organiser ID you received during registration
              </p>
            </div>
          </form>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {organiserData && (
            <div className="space-y-4">
              {/* Status Card */}
              <div className={`p-6 rounded-lg border-2 ${getStatusColor(organiserData.status)}`}>
                <div className="flex items-center gap-3 mb-4">
                  {getStatusIcon(organiserData.status)}
                  <div>
                    <h2 className="text-xl font-semibold">Status: {organiserData.status}</h2>
                    <p className="text-sm opacity-80">
                      {organiserData.status === "Approved" && organiserData.approvedAt
                        ? `Approved on ${new Date(organiserData.approvedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}`
                        : organiserData.status === "Rejected" && organiserData.rejectedAt
                        ? `Rejected on ${new Date(organiserData.rejectedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}`
                        : `Registered on ${new Date(organiserData.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organiser Details */}
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <h3 className="font-semibold text-emerald-900">Organiser Details</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600">Name</p>
                    <p className="font-medium text-emerald-900">{organiserData.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Organisation</p>
                    <p className="font-medium text-emerald-900">{organiserData.organisation}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Event Type</p>
                    <p className="font-medium text-emerald-900">{organiserData.eventType}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Event Location</p>
                    <p className="font-medium text-emerald-900">{organiserData.eventLocation}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Proposed Event Date</p>
                    <p className="font-medium text-emerald-900">
                      {new Date(organiserData.proposedEventDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* IDs Section */}
              <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-200 space-y-4">
                <h3 className="font-semibold text-emerald-900">Your IDs</h3>
                
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-600 font-medium">Temporary Organiser ID</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(organiserData.tempOrganiserId, "temp")}
                        className="h-7 px-2"
                      >
                        {copied === "temp" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <code className="text-base font-mono text-emerald-900 font-semibold">
                      {organiserData.tempOrganiserId}
                    </code>
                  </div>

                  {organiserData.status === "Approved" && (
                    <>
                      {organiserData.finalOrganiserId && (
                        <div className="bg-white p-4 rounded border-2 border-green-300">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-green-700 font-medium">Final Organiser ID</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(organiserData.finalOrganiserId, "final")}
                              className="h-7 px-2"
                            >
                              {copied === "final" ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <code className="text-base font-mono text-green-800 font-semibold">
                            {organiserData.finalOrganiserId}
                          </code>
                          <p className="text-xs text-green-700 mt-2">
                            ✅ Use this ID for all official communications
                          </p>
                        </div>
                      )}

                      {organiserData.eventReferenceId && (
                        <div className="bg-white p-4 rounded border-2 border-green-300">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-green-700 font-medium">Event Reference ID</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(organiserData.eventReferenceId, "event")}
                              className="h-7 px-2"
                            >
                              {copied === "event" ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <code className="text-base font-mono text-green-800 font-semibold">
                            {organiserData.eventReferenceId}
                          </code>
                          <p className="text-xs text-green-700 mt-2">
                            ✅ Use this ID when creating events and generating certificates
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {organiserData.status === "Pending Approval" && (
                    <div className="bg-amber-50 p-4 rounded border border-amber-200">
                      <p className="text-sm text-amber-800">
                        ⏳ Your registration is under review. You will receive your Final Organiser ID and Event Reference ID once approved by admin.
                      </p>
                    </div>
                  )}

                  {organiserData.status === "Rejected" && (
                    <div className="bg-red-50 p-4 rounded border border-red-200">
                      <p className="text-sm text-red-800">
                        ❌ Your registration has been rejected. Please contact admin for more information.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setTempId("");
                    setOrganiserData(null);
                    setError(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Check Another ID
                </Button>
                <Link href="/organiser-register" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Register New Organiser
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-emerald-100 text-center space-y-2">
            <Link href="/" className="text-sm text-emerald-700 hover:text-emerald-900">
              ← Back to Home
            </Link>
            <p className="text-xs text-slate-500">
              Don't have a Temporary Organiser ID?{" "}
              <Link href="/organiser-register" className="text-emerald-700 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

