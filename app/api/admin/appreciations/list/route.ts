import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import memoryCache from "@/lib/cache";

const CACHE_KEY = "appreciations:list";
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

    // Use lean() for better performance, limit to 1000 items
    const certificates = await Certificate.find({
      appreciationOptIn: true,
      appreciationText: { $exists: true, $ne: "" },
    })
      .sort({ createdAt: -1 })
      .limit(1000) // Limit results to prevent huge payloads
      .select({ fullName: 1, appreciationText: 1, createdAt: 1 })
      .lean();

    const result = { items: certificates };
    
    // Cache the result
    memoryCache.set(CACHE_KEY, result, CACHE_TTL);

    return NextResponse.json(result, {
      headers: {
        "X-Cache": "MISS",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    });
  } catch (error) {
    console.error("Appreciations list error:", error);
    // Return cached data if available
    const cached = memoryCache.get(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached, { headers: { "X-Cache": "STALE" } });
    }
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}









