import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

// Simple approach: Return the photo with metadata in headers
// Client-side will handle overlay using html2canvas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoUrl = searchParams.get("photoUrl");
    const eventId = searchParams.get("eventId");
    const eventTitle = searchParams.get("eventTitle") || "Road Safety Event";
    const eventDate = searchParams.get("eventDate") || "";

    if (!photoUrl) {
      return NextResponse.json({ error: "Photo URL required" }, { status: 400 });
    }

    // Read the original photo
    const photoPath = join(process.cwd(), "public", photoUrl);
    const buffer = await readFile(photoPath);

    // Return photo with metadata in headers for client-side processing
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="roadsafety-event-${eventId || "photo"}.jpg"`,
        "X-Event-Title": encodeURIComponent(eventTitle),
        "X-Event-Date": encodeURIComponent(eventDate),
        "X-Event-Id": encodeURIComponent(eventId || ""),
      },
    });
  } catch (error) {
    console.error("Photo download error:", error);
    return NextResponse.json({ error: "Failed to process photo" }, { status: 500 });
  }
}

