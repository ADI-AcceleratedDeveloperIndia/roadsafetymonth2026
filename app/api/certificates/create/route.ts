import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import { signCertificateUrl } from "@/lib/hmac";
import { hashIp } from "@/lib/utils";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import memoryCache from "@/lib/cache";

const createCertSchema = z.object({
  type: z.enum(["organiser", "participant", "merit"]),
  fullName: z.string().min(1),
  district: z.string().min(1),
  appreciationOptIn: z.boolean().default(false),
  appreciationText: z.string().optional(),
  userEmail: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 20 certificate creations per minute per IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 20, 60000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many certificate requests. Please wait before trying again." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const body = await request.json();
    const validated = createCertSchema.parse(body);

    await connectDB();

    const certificateId = uuidv4();
    const appOrigin = process.env.APP_ORIGIN || "http://localhost:3000";

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userIpHash = hashIp(ip);

    const certificate = new Certificate({
      certificateId,
      type: validated.type,
      fullName: validated.fullName,
      regionCode: validated.district, // store district in regionCode
      userEmail: validated.userEmail,
      appreciationOptIn: validated.appreciationOptIn,
      appreciationText: validated.appreciationText,
      userIpHash,
      appreciationTo: validated.appreciationOptIn
        ? "To Sri Ponnam Prabhakar Garu, Hon'ble Cabinet Minister of Government of Telangana"
        : undefined,
    });

    await certificate.save();

    // Invalidate related caches
    memoryCache.delete("stats:overview");
    memoryCache.delete("appreciations:list");

    const sig = await signCertificateUrl(certificateId);
    const downloadUrl = `/api/certificates/download?cid=${certificateId}&sig=${sig}`;

    return NextResponse.json({ 
      downloadUrl, 
      certificateId 
    }, {
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Certificate creation error:", error);
    return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 });
  }
}



