import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { generateReferenceId } from "@/lib/reference";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import memoryCache from "@/lib/cache";

const createEventSchema = z.object({
  title: z.string().min(1),
  organiserName: z.string().min(1),
  organiserRole: z.string().optional(),
  institution: z.string().optional(),
  date: z.string(),
  location: z.string().optional(),
  regionCode: z.string().optional(),
  photos: z.array(z.string()).optional(),
  videos: z.array(z.string()).max(5).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 event creations per hour per IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 10, 3600000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many event creation requests. Please wait before trying again." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const body = await request.json();
    
    // Clean up empty strings to undefined for optional fields
    const cleanedBody = {
      ...body,
      organiserRole: body.organiserRole?.trim() || undefined,
      institution: body.institution?.trim() || undefined,
      location: body.location?.trim() || undefined,
      regionCode: body.regionCode?.trim() || undefined,
      photos: body.photos?.length ? body.photos : undefined,
      videos: body.videos?.length ? body.videos : undefined,
    };
    
    const validated = createEventSchema.parse(cleanedBody);

    await connectDB();

    // Generate Event ID (sequential: EVT-00001, EVT-00002, ..., EVT-10000)
    // Always uses 5 digits for consistency
    const eventCount = await Event.countDocuments();
    const nextEventNumber = eventCount + 1;
    const eventIdNumber = nextEventNumber.toString().padStart(5, "0"); // Always 5 digits
    const eventId = `EVT-${eventIdNumber}`;

    // Generate Reference ID: KRMR-RSM-2026-PDL-RHL-EVT-00001
    // KRMR = Karimnagar, RSM = Road Safety Month, 2026 = Year (hardcoded)
    // PDL = Padala, RHL = Rahul, EVT-00001 = Event ID
    const referenceId = `KRMR-RSM-2026-PDL-RHL-${eventId}`;

    const event = new Event({
      eventId,
      referenceId,
      ...validated,
      date: new Date(validated.date),
      approved: true,
    });

    await event.save();

    // Invalidate caches
    memoryCache.delete("stats:overview");
    memoryCache.delete("events:list");

    return NextResponse.json({ 
      success: true, 
      eventId, // The unique Event ID (EVT-00001, EVT-00002, etc.)
      referenceId, // The full reference ID (KRMR-RSM-2026-PDL-RHL-EVT-00001)
      mongoId: event._id.toString() // MongoDB internal ID (for reference)
    }, {
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", JSON.stringify(error.errors, null, 2));
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.errors,
        message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
      }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes("duplicate key")) {
      console.error("Duplicate event ID error:", error);
      // Retry with a new event ID
      try {
        const eventCount = await Event.countDocuments();
        const nextEventNumber = eventCount + 1;
        const eventIdNumber = nextEventNumber.toString().padStart(5, "0");
        const eventId = `EVT-${eventIdNumber}`;
        const referenceId = `KRMR-RSM-2026-PDL-RHL-${eventId}`;

        const event = new Event({
          eventId,
          referenceId,
          ...validated,
          date: new Date(validated.date),
          approved: true,
        });

        await event.save();
        memoryCache.delete("stats:overview");
        memoryCache.delete("events:list");

        return NextResponse.json({ 
          success: true, 
          eventId,
          referenceId,
          mongoId: event._id.toString()
        });
      } catch (retryError) {
        console.error("Retry failed:", retryError);
        return NextResponse.json({ error: "Failed to create event. Please try again." }, { status: 500 });
      }
    }
    console.error("Event creation error:", error);
    return NextResponse.json({ 
      error: "Failed to create event",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}








