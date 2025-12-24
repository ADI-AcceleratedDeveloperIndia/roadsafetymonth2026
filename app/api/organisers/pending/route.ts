import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Organiser from "@/models/Organiser";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import memoryCache from "@/lib/cache";

const CACHE_KEY = "organisers:pending";
const CACHE_TTL = 10000; // 10 seconds cache (admin data changes frequently)

export async function GET(request: NextRequest) {
  try {
    // Note: Admin dashboard is public, so no authentication required
    // Rate limiting: 30 requests per minute per IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 30, 60000);
    
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

    // Use lean() and limit results
    const pendingOrganisers = await Organiser.find({ status: "Pending Approval" })
      .sort({ createdAt: -1 })
      .limit(100) // Limit to prevent huge payloads
      .lean();

    const result = { organisers: pendingOrganisers };
    
    // Cache the result
    memoryCache.set(CACHE_KEY, result, CACHE_TTL);

    return NextResponse.json(result, {
      headers: {
        "X-Cache": "MISS",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    });
  } catch (error) {
    console.error("Error fetching pending organisers:", error);
    return NextResponse.json({ error: "Failed to fetch pending organisers" }, { status: 500 });
  }
}

