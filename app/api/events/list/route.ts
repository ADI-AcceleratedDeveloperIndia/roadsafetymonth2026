import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import memoryCache from "@/lib/cache";

const CACHE_KEY = "events:list";
const CACHE_TTL = 30000; // 30 seconds cache

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 50 requests per minute per IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 50, 60000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Check cache
    const cached = memoryCache.get(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" }
      });
    }

    await connectDB();

    // Fetch all approved events, sorted by date (newest first)
    const eventsRaw = await Event.find({ approved: true })
      .sort({ date: -1, createdAt: -1 })
      .limit(100) // Limit to 100 most recent events
      .select({
        _id: 1,
        eventId: 1,
        referenceId: 1,
        title: 1,
        organiserName: 1,
        organiserRole: 1,
        institution: 1,
        date: 1,
        location: 1,
        regionCode: 1,
        photos: 1,
        videos: 1,
      })
      .lean();

    // Ensure all events have eventId (fallback for old events)
    const events = eventsRaw.map((event: any) => ({
      ...event,
      eventId: event.eventId || `EVT-${event._id.toString().slice(-5).padStart(5, '0')}`, // Fallback for old events
    }));

    const result = { events };

    // Cache the result
    memoryCache.set(CACHE_KEY, result, CACHE_TTL);

    return NextResponse.json(result, {
      headers: {
        "X-Cache": "MISS",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    // Return cached data if available
    const cached = memoryCache.get(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached, { headers: { "X-Cache": "STALE" } });
    }
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}

