"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Loader2, CalendarCheck, CheckCircle2, MapPin, Users, Calendar } from "lucide-react";
import Link from "next/link";

interface Event {
  _id: string;
  eventId: string;
  referenceId: string;
  title: string;
  organiserName: string;
  organiserRole?: string;
  institution?: string;
  date: string;
  location?: string;
  regionCode?: string;
  photos: string[];
  videos: string[];
}

export default function EventsPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events/list");
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setReferenceId(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const videoUrlsText = formData.get("videoUrls") as string;
    const videoUrls = videoUrlsText
      ? videoUrlsText.split("\n").filter(url => url.trim()).slice(0, 5)
      : [];

    const eventData = {
      title: formData.get("title") as string,
      organiserName: formData.get("organiserName") as string,
      organiserRole: (formData.get("organiserRole") as string) || undefined,
      institution: (formData.get("institution") as string) || undefined,
      date: formData.get("date") as string,
      location: (formData.get("location") as string) || undefined,
      videos: videoUrls.length > 0 ? videoUrls : undefined,
    };

    try {
      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Display both Event ID and Reference ID
        const displayId = `Event ID: ${result.eventId}\nReference ID: ${result.referenceId}`;
        setReferenceId(displayId);
        (e.target as HTMLFormElement).reset();
        // Refresh events list
        const refreshResponse = await fetch("/api/events/list");
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setEvents(refreshData.events || []);
        }
      } else {
        const errorMsg = result.message || result.error || "Failed to create event";
        console.error("Event creation failed:", result);
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Event creation error:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rs-container py-14 space-y-8">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <span className="rs-chip flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" /> {t("events")}
          </span>
          <h1 className="text-3xl font-semibold text-emerald-900">{tc("roadSafetyEventsInKarimnagar") || "Road Safety Events in Karimnagar"}</h1>
          <p className="text-slate-600 max-w-2xl">
            {tc("browseOngoingEvents") || "Browse ongoing road safety events, rallies, workshops, and campaigns in Karimnagar district. Join or log your own event."}
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-emerald-900">{tc("upcomingRecentEvents") || "Upcoming & Recent Events"}</h2>
        {eventsLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
            <p className="mt-4 text-slate-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="rs-card p-12 text-center">
            <p className="text-slate-600">No events yet. Be the first to create an event!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event._id}
                href={`/events/${event._id}`}
                className="rs-card p-6 space-y-4 hover:shadow-lg transition-shadow block"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-emerald-900 leading-tight">{event.title}</h3>
                  </div>
                  <p className="text-sm text-emerald-700 font-medium">{event.organiserName}</p>
                  {event.institution && (
                    <p className="text-xs text-slate-600">{event.institution}</p>
                  )}
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {(event.photos.length > 0 || event.videos.length > 0) && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                      {event.photos.length > 0 && <span>{event.photos.length} photo{event.photos.length !== 1 ? 's' : ''}</span>}
                      {event.videos.length > 0 && <span>{event.videos.length} video{event.videos.length !== 1 ? 's' : ''}</span>}
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-emerald-100">
                  <p className="text-xs text-slate-500">Event ID: {event.eventId}</p>
                  <p className="text-xs text-slate-500">Ref: {event.referenceId}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Log Event Form */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rs-card p-8 bg-gradient-to-br from-amber-50 to-white">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-emerald-900">{tc("logYourRoadSafetyEvent") || "Log Your Road Safety Event"}</h2>
            <p className="text-slate-600">
              {tc("submitInstitutionActivities") || "Submit your institution's Road Safety Month activities, workshops, and campaigns. Every approved entry generates a reference ID to help participants earn certificates."}
            </p>
          </div>
        </div>

      <div className="rs-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-emerald-900">{tc("eventTitle") || "Event Title"} *</Label>
            <Input id="title" name="title" required className="h-11 rounded-lg border border-emerald-200" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organiserName" className="text-sm font-semibold text-emerald-900">{tc("organiserName") || "Organiser Name"} *</Label>
              <Input id="organiserName" name="organiserName" required className="h-11 rounded-lg border border-emerald-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organiserRole" className="text-sm font-semibold text-emerald-900">{tc("organiserRole") || "Organiser Role"}</Label>
              <Input
                id="organiserRole"
                name="organiserRole"
                placeholder={tc("principalHodEtc") || "Principal, HOD, etc."}
                className="h-11 rounded-lg border border-emerald-200"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institution" className="text-sm font-semibold text-emerald-900">{t("institution")}</Label>
              <Input id="institution" name="institution" className="h-11 rounded-lg border border-emerald-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold text-emerald-900">{tc("eventDate") || "Event Date"} *</Label>
              <Input id="date" name="date" type="date" required className="h-11 rounded-lg border border-emerald-200" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-emerald-900">{tc("location") || "Location"} (Karimnagar District)</Label>
              <Input 
                id="location" 
                name="location" 
                placeholder="Karimnagar Town Hall, Karimnagar"
                className="h-11 rounded-lg border border-emerald-200" 
              />
              <p className="text-xs text-slate-500">Events are limited to Karimnagar district only</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrls" className="text-sm font-semibold text-emerald-900">
              YouTube Video URLs (max 5, one per line)
            </Label>
            <Textarea
              id="videoUrls"
              name="videoUrls"
              placeholder="https://www.youtube.com/watch?v=...&#10;https://youtu.be/..."
              rows={4}
              className="border border-emerald-200 font-mono text-sm"
            />
            <p className="text-xs text-slate-500">Enter YouTube video URLs, one per line. Maximum 5 videos allowed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-emerald-900">
              {tc("highlightsOptional") || "Highlights (optional)"}
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder={tc("keyOutcomesPlaceholder") || "Key outcomes, number of participants, collaborations..."}
              rows={4}
              className="border border-emerald-200"
            />
          </div>

          <Button type="submit" className="rs-btn-primary w-full justify-center" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {tc("submitting")}
              </>
            ) : (
              tc("submitEvent") || "Submit Event"
            )}
          </Button>

          {success && (
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-lg space-y-2">
              <p className="text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> {tc("eventLoggedSuccessfully") || "Event logged successfully!"}
              </p>
              {referenceId && (
                <div className="text-sm text-emerald-900 space-y-1">
                  <pre className="whitespace-pre-wrap font-mono text-xs bg-white p-3 rounded border border-emerald-200">
                    {referenceId}
                  </pre>
                </div>
              )}
              <p className="text-xs text-emerald-800">{tc("shareIdForCertificates") || "Share this ID so participants can generate or verify their certificates."}</p>
            </div>
          )}
        </form>
      </div>
      </div>
    </div>
  );
}








