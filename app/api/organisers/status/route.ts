import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Organiser from "@/models/Organiser";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 20 status checks per minute per IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 20, 60000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tempOrganiserId = searchParams.get("tempId");

    if (!tempOrganiserId) {
      return NextResponse.json(
        { error: "Temporary Organiser ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const organiser = await Organiser.findOne({ tempOrganiserId }).lean();

    if (!organiser) {
      return NextResponse.json(
        { error: "Organiser not found. Please check your Temporary Organiser ID." },
        { status: 404 }
      );
    }

    // Return only necessary information (no sensitive data)
    return NextResponse.json({
      success: true,
      status: organiser.status,
      tempOrganiserId: organiser.tempOrganiserId,
      finalOrganiserId: organiser.finalOrganiserId || null,
      name: organiser.name,
      organisation: organiser.organisation,
      eventType: organiser.eventType,
      eventLocation: organiser.eventLocation,
      proposedEventDate: organiser.proposedEventDate,
      approvedAt: organiser.approvedAt || null,
      rejectedAt: organiser.rejectedAt || null,
      createdAt: organiser.createdAt,
      message: organiser.status === "Approved" 
        ? "Your registration is approved! You can now create events. Each event will get its own unique Event ID and Reference ID when created."
        : organiser.status === "Rejected"
        ? "Your registration was rejected. Please contact admin for more information."
        : "Your registration is pending admin approval.",
    }, {
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    });
  } catch (error) {
    console.error("Organiser status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}

