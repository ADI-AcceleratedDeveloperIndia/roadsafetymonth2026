import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import QuizAttempt from "@/models/QuizAttempt";
import SimulationPlay from "@/models/SimulationPlay";
import memoryCache from "@/lib/cache";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";

const CACHE_KEY = "stats:overview";
const CACHE_TTL = 60000; // 1 minute cache

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 100 requests per minute per IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 100, 60000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetAt.toString(),
          }
        }
      );
    }

    // Check cache first
    const cached = memoryCache.get(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "X-Cache": "HIT",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        }
      });
    }

    await connectDB();

    // Use Promise.all for parallel queries
    const [totalCertificates, totalAppreciations, totalEvents, totalQuizPasses, totalQuizAttempts, totalSimulationPlays, districtAgg] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.countDocuments({ appreciationOptIn: true }),
      Event.countDocuments(),
      QuizAttempt.countDocuments({ passed: true }),
      QuizAttempt.countDocuments(),
      SimulationPlay.countDocuments(),
      Certificate.aggregate([
        {
          $group: {
            _id: "$regionCode",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 20 }, // Limit to top 20 districts
      ]).allowDiskUse(true), // Allow disk use for large aggregations
    ]);

    const passRate = totalQuizAttempts > 0 ? totalQuizPasses / totalQuizAttempts : 0;

    const result = {
      totalCertificates,
      totalAppreciations,
      totalEvents,
      totalQuizPasses,
      totalQuizAttempts,
      passRate,
      totalSimulationPlays,
      districts: districtAgg.map((d) => ({ key: d._id || "", count: d.count })),
    };

    // Cache the result
    memoryCache.set(CACHE_KEY, result, CACHE_TTL);

    return NextResponse.json(result, {
      headers: {
        "X-Cache": "MISS",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      }
    });
  } catch (error) {
    console.error("Stats error:", error);
    // Return cached data if available, even if stale
    const cached = memoryCache.get(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "X-Cache": "STALE",
          "X-Error": "true",
        }
      });
    }
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}



