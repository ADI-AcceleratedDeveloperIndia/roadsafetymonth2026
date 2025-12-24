import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PageCompletion from "@/models/PageCompletion";
import { generateReferenceId } from "@/lib/reference";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import memoryCache from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 20 completions per minute per IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 20, 60000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { pageType } = body;

    if (!pageType || !["basics", "guides", "prevention"].includes(pageType)) {
      return NextResponse.json({ error: "Invalid page type" }, { status: 400 });
    }

    await connectDB();

    // Generate reference ID based on page type
    let refPrefix = "BASICS";
    if (pageType === "guides") refPrefix = "GUIDE";
    else if (pageType === "prevention") refPrefix = "PREVENT";

    const referenceId = generateReferenceId(refPrefix);

    await PageCompletion.create({
      referenceId,
      pageType,
      completed: true,
    });

    // Invalidate stats cache
    memoryCache.delete("stats:overview");

    return NextResponse.json({ 
      success: true, 
      referenceId 
    }, {
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    });
  } catch (error) {
    console.error("Page completion error:", error);
    return NextResponse.json({ 
      error: "Failed to save completion",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

