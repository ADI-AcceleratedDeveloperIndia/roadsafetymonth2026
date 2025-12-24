"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function OrganiserRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    organisation: "",
    mobileNumber: "",
    eventLocation: "Karimnagar",
    proposedEventDate: "",
    eventType: "School" as "School" | "College" | "Public Awareness",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempId, setTempId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/organisers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTempId(data.tempOrganiserId);
        setFormData({
          name: "",
          organisation: "",
          mobileNumber: "",
          eventLocation: "Karimnagar",
          proposedEventDate: "",
          eventType: "School",
        });
      } else {
        setError(data.error || "Failed to register. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rs-container py-14">
      <div className="max-w-2xl mx-auto">
        <div className="rs-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold text-emerald-900">Organiser Registration</h1>
            <p className="text-slate-600">
              Register to organize a Road Safety Month event in Karimnagar district
            </p>
          </div>

          {success ? (
            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg space-y-4">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle2 className="h-6 w-6" />
                <h2 className="text-xl font-semibold">Registration Submitted Successfully!</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-green-700">
                  Your registration has been submitted and is awaiting admin approval.
                </p>
                {tempId && (
                  <div className="bg-white p-4 rounded border border-green-200 space-y-3">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Temporary Organiser ID:</p>
                      <code className="text-base font-mono text-emerald-900 font-semibold">{tempId}</code>
                    </div>
                    <p className="text-xs text-slate-500">
                      ⚠️ <strong>Important:</strong> Save this ID. You'll need it to check your approval status and get your Final Organiser ID and Event Reference ID.
                    </p>
                    <Link href={`/organiser-status?tempId=${encodeURIComponent(tempId)}`}>
                      <Button className="w-full rs-btn-primary">
                        Check Status Now
                      </Button>
                    </Link>
                    <p className="text-xs text-slate-500 text-center">
                      You can check your status anytime using this Temporary ID
                    </p>
                  </div>
                )}
                <p className="text-green-700 font-medium">
                  Your registration is pending admin approval. Check your status using your Temporary Organiser ID.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSuccess(false);
                  setTempId(null);
                }}
                className="w-full"
              >
                Register Another Organiser
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-emerald-900">
                  Organiser Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organisation" className="text-sm font-semibold text-emerald-900">
                  Organisation / School / College / NGO *
                </Label>
                <Input
                  id="organisation"
                  value={formData.organisation}
                  onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                  placeholder="e.g., Karimnagar Government High School"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="text-sm font-semibold text-emerald-900">
                  Mobile Number *
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  placeholder="10-digit mobile number"
                  required
                  minLength={10}
                  maxLength={10}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventLocation" className="text-sm font-semibold text-emerald-900">
                  Event Location *
                </Label>
                <Input
                  id="eventLocation"
                  value={formData.eventLocation}
                  disabled
                  className="h-11 bg-slate-100"
                />
                <p className="text-xs text-slate-500">Currently limited to Karimnagar district only</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposedEventDate" className="text-sm font-semibold text-emerald-900">
                  Proposed Event Date *
                </Label>
                <Input
                  id="proposedEventDate"
                  type="date"
                  value={formData.proposedEventDate}
                  onChange={(e) => setFormData({ ...formData, proposedEventDate: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-sm font-semibold text-emerald-900">
                  Event Type *
                </Label>
                <select
                  id="eventType"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                  className="w-full h-11 rounded-lg border border-emerald-200 px-3"
                  required
                >
                  <option value="School">School</option>
                  <option value="College">College</option>
                  <option value="Public Awareness">Public Awareness</option>
                </select>
              </div>

              <div className="pt-4 space-y-3">
                <Button type="submit" className="w-full rs-btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
                <p className="text-xs text-center text-slate-500">
                  By submitting, you agree that your registration will be reviewed by admin before approval.
                </p>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-emerald-100 text-center space-y-2">
            <Link href="/organiser-status" className="text-sm text-emerald-700 hover:text-emerald-900 font-medium">
              Check Registration Status →
            </Link>
            <p className="text-xs text-slate-500">Already registered? Check your approval status</p>
            <Link href="/" className="block text-sm text-emerald-700 hover:text-emerald-900 mt-2">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

