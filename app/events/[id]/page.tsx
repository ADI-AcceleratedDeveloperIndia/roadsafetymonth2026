"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MapPin, Calendar, Users, Image as ImageIcon, Video, Download, Upload } from "lucide-react";
import Image from "next/image";

interface EventData {
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
  participants?: number;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        } else {
          router.push("/events");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        router.push("/events");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id, router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !event) return;

    if (event.photos.length >= 5) {
      alert("Maximum 5 photos allowed per event");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("eventId", event._id);

    try {
      const response = await fetch("/api/events/upload-photo", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setEvent({ ...event, photos: [...event.photos, data.photoUrl] });
      } else {
        alert("Failed to upload photo");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadPhoto = async (photoUrl: string) => {
    try {
      // Load html2canvas dynamically
      const html2canvas = (await import("html2canvas")).default;
      
      // Create a temporary container with the image and overlay
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "800px";
      container.style.height = "600px";
      container.style.background = "#000";
      
      const img = document.createElement("img");
      img.src = photoUrl;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.bottom = "0";
      overlay.style.left = "0";
      overlay.style.right = "0";
      overlay.style.background = "rgba(0, 0, 0, 0.7)";
      overlay.style.color = "#fff";
      overlay.style.padding = "20px";
      overlay.style.textAlign = "center";
      
      overlay.innerHTML = `
        <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">Road Safety Month</div>
        <div style="font-size: 20px; margin-bottom: 8px;">${event?.title || "Event"}</div>
        <div style="font-size: 16px;">${event?.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""}</div>
      `;
      
      container.appendChild(img);
      container.appendChild(overlay);
      document.body.appendChild(container);
      
      // Wait for image to load
      await new Promise((resolve) => {
        img.onload = resolve;
        if (img.complete) resolve();
      });
      
      // Capture with html2canvas
      const canvas = await html2canvas(container, { backgroundColor: null });
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/jpeg", 0.9);
      });
      
      // Download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `roadsafety-event-${event?.referenceId || "photo"}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      document.body.removeChild(container);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download photo with overlay. Please try again.");
    }
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="rs-container py-12">
        <div className="text-center">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rs-container py-12">
        <div className="text-center">Event not found</div>
        <Button onClick={() => router.push("/events")} className="mt-4">
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="rs-container py-12 space-y-8">
      <Button
        variant="outline"
        onClick={() => router.push("/events")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{event.title}</CardTitle>
          <CardDescription className="text-lg">{event.organiserName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <span>{event.location || "Location not specified"}, {event.regionCode || "Region not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            {event.participants && (
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <span>{event.participants} participants</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-semibold">Event ID:</span>
              <span className="font-mono">{event.eventId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-semibold">Reference ID:</span>
              <span className="font-mono">{event.referenceId}</span>
            </div>
          </div>

          {event.institution && (
            <div>
              <p className="text-sm text-slate-600">
                <span className="font-semibold">Institution:</span> {event.institution}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Gallery
          </CardTitle>
          <CardDescription>
            Photos ({event.photos.length}/5) and Videos ({event.videos.length}/5)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photos Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Photos</h3>
              {event.photos.length < 5 && (
                <label className="rs-btn-secondary cursor-pointer flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {event.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {event.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-emerald-200">
                      <Image
                        src={photo}
                        alt={`Event photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDownloadPhoto(photo)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No photos uploaded yet</p>
            )}
          </div>

          {/* Videos Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Videos</h3>
              {event.videos.length < 5 && (
                <div className="text-sm text-slate-600">
                  Add YouTube video URLs (max 5)
                </div>
              )}
            </div>
            {event.videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.videos.map((videoUrl, index) => {
                  const videoId = extractYouTubeId(videoUrl);
                  return videoId ? (
                    <div key={index} className="aspect-video relative rounded-lg overflow-hidden border-2 border-emerald-200">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`Event video ${index + 1}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div key={index} className="aspect-video flex items-center justify-center bg-slate-100 rounded-lg">
                      <p className="text-slate-500">Invalid YouTube URL</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No videos added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

