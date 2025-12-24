import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Organiser from "@/models/Organiser";
import { generateReferenceId } from "@/lib/reference";
import { authOptions } from "@/lib/auth";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import memoryCache from "@/lib/cache";

const approveSchema = z.object({
  organiserId: z.string(),
  action: z.enum(["approve", "reject"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = approveSchema.parse(body);

    await connectDB();

    const organiser = await Organiser.findById(validated.organiserId);

    if (!organiser) {
      return NextResponse.json({ error: "Organiser not found" }, { status: 404 });
    }

    if (organiser.status !== "Pending Approval") {
      return NextResponse.json(
        { error: "Organiser is not in pending status" },
        { status: 400 }
      );
    }

    if (validated.action === "approve") {
      // Generate final IDs
      const finalOrganiserId = `ORG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const eventReferenceId = generateReferenceId("EVENT");

      organiser.status = "Approved";
      organiser.finalOrganiserId = finalOrganiserId;
      organiser.eventReferenceId = eventReferenceId;
      organiser.approvedAt = new Date();
      organiser.approvedBy = session.user.email || "admin";

      await organiser.save();

      // Invalidate caches
      memoryCache.delete("organisers:pending");
      memoryCache.delete("stats:overview");

      return NextResponse.json({
        success: true,
        finalOrganiserId,
        eventReferenceId,
        message: "Organiser approved successfully",
      });
    } else {
      // Reject
      organiser.status = "Rejected";
      organiser.rejectedAt = new Date();
      organiser.approvedBy = session.user.email || "admin";

      await organiser.save();

      // Invalidate pending organisers cache
      memoryCache.delete("organisers:pending");

      return NextResponse.json({
        success: true,
        message: "Organiser rejected",
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Organiser approval error:", error);
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 });
  }
}

