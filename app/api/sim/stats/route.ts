import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SimStat from "@/models/SimStat";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import memoryCache from "@/lib/cache";

const CACHE_KEY = "sim:stats";
const CACHE_TTL = 60000; // 1 minute cache

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 100 requests per minute per IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 100, 60000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
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

    // Use Promise.all for parallel queries with allowDiskUse for large aggregations
    const [totalSessions, totalCompletions, categoryStats, scenarioStats, avgTime] = await Promise.all([
      SimStat.countDocuments(),
      SimStat.countDocuments({ success: true }),
      SimStat.aggregate([
        {
          $group: {
            _id: "$category",
            total: { $sum: 1 },
            successful: { $sum: { $cond: ["$success", 1, 0] } },
          },
        },
      ]).allowDiskUse(true),
      SimStat.aggregate([
        {
          $group: {
            _id: "$sceneId",
            total: { $sum: 1 },
            failed: { $sum: { $cond: ["$success", 0, 1] } },
          },
        },
        { $sort: { failed: -1 } },
        { $limit: 5 },
      ]).allowDiskUse(true),
      SimStat.aggregate([
        {
          $group: {
            _id: null,
            avgSeconds: { $avg: "$seconds" },
          },
        },
      ]).allowDiskUse(true),
    ]);

    const successRate = totalSessions > 0 ? totalCompletions / totalSessions : 0;
    const avgTimeSeconds = avgTime[0]?.avgSeconds || 0;

    const result = {
      totalSessions,
      totalCompletions,
      successRate,
      categoryStats: categoryStats.map((c) => ({
        category: c._id,
        total: c.total,
        successful: c.successful,
      })),
      topFailedScenarios: scenarioStats.map((s) => ({
        sceneId: s._id,
        total: s.total,
        failed: s.failed,
      })),
      avgTimeSeconds: Math.round(avgTimeSeconds),
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
    console.error("Sim stats error:", error);
    // Return cached data if available
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






