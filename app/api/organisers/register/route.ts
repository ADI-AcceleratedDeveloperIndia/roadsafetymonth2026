import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Organiser from "@/models/Organiser";
import { generateReferenceId } from "@/lib/reference";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import memoryCache from "@/lib/cache";

const registerSchema = z.object({
  name: z.string().min(1, "Organiser name is required"),
  organisation: z.string().min(1, "Organisation is required"),
  mobileNumber: z.string().min(10, "Valid mobile number is required"),
  eventLocation: z.string().default("Karimnagar"),
  proposedEventDate: z.string(),
  eventType: z.enum(["School", "College", "Public Awareness"]),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 registrations per hour per IP (prevent spam)
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 5, 3600000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait before trying again." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Ensure location is Karimnagar only
    if (validated.eventLocation !== "Karimnagar") {
      return NextResponse.json(
        { error: "Events are currently limited to Karimnagar district only" },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate temporary Organiser ID
    const tempOrganiserId = `ORG-TEMP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const organiser = new Organiser({
      tempOrganiserId,
      name: validated.name,
      organisation: validated.organisation,
      mobileNumber: validated.mobileNumber,
      eventLocation: validated.eventLocation,
      proposedEventDate: new Date(validated.proposedEventDate),
      eventType: validated.eventType,
      status: "Pending Approval",
    });

    await organiser.save();

    // Invalidate pending organisers cache
    memoryCache.delete("organisers:pending");

    return NextResponse.json({
      success: true,
      tempOrganiserId,
      message: "Registration submitted successfully. Awaiting admin approval.",
    }, {
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.errors 
      }, { status: 400 });
    }
    console.error("Organiser registration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Failed to register organiser",
      message: errorMessage
    }, { status: 500 });
  }
}

