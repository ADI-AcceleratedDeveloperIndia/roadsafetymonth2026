import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SimStat from "@/models/SimStat";
import { generateReferenceId } from "@/lib/reference";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import memoryCache from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 50 simulation completions per minute per IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 50, 60000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { sceneId, success, attempts, seconds } = body;

    if (!sceneId || typeof success !== "boolean" || !attempts || !seconds) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await connectDB();

    // Extract category from sceneId
    let category: "bike" | "car" | "pedestrian" | "other" = "other";
    if (sceneId.startsWith("bike_")) category = "bike";
    else if (sceneId.startsWith("car_")) category = "car";
    else if (sceneId.startsWith("ped_")) category = "pedestrian";

    const referenceId = generateReferenceId(category === "bike" ? "SIM-BIKE" : category === "car" ? "SIM-CAR" : category === "pedestrian" ? "SIM-PED" : "SIM");

    await SimStat.create({
      referenceId,
      sceneId,
      category,
      success,
      attempts,
      seconds,
    });

    // Invalidate sim stats cache
    memoryCache.delete("sim:stats");
    memoryCache.delete("stats:overview");

    return NextResponse.json({ 
      ok: true, 
      referenceId 
    }, {
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    });
  } catch (error) {
    console.error("Sim completion error:", error);
    // Don't fail the request - simulation completion is non-critical
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to log, but simulation completed successfully" 
    }, { status: 200 }); // Return 200 so user experience isn't broken
  }
}




