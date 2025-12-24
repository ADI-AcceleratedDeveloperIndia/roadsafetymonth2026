import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";

const generateRefSchema = z.object({
  certificateType: z.enum(["ORG", "PAR", "QUIZ", "SIM", "VOL", "SCH", "COL", "TOPPER"]),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validated = generateRefSchema.parse(body);

    await connectDB();

    // Generate Reference ID in format: KRMR-RSM-2026-PDL-RHL-{CERT_TYPE}-{NUMBER}
    // Count existing certificates with this format to get next number
    const certCount = await Certificate.countDocuments({
      certificateId: { $regex: `^KRMR-RSM-2026-PDL-RHL-${validated.certificateType}-` }
    });
    const nextCertNumber = certCount + 1;
    const certNumberStr = nextCertNumber.toString().padStart(5, "0");
    const referenceId = `KRMR-RSM-2026-PDL-RHL-${validated.certificateType}-${certNumberStr}`;

    return NextResponse.json({
      referenceId,
    }, {
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Certificate reference ID generation error:", error);
    return NextResponse.json({ error: "Failed to generate reference ID" }, { status: 500 });
  }
}

