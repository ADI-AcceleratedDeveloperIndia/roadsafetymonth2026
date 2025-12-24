// Shared middleware utilities for API routes

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getRateLimitIdentifier } from "./rateLimit";

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const identifier = getRateLimitIdentifier(request);
  const rateLimitResult = rateLimit(identifier, config.limit, config.windowMs);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": config.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetAt.toString(),
        },
      }
    );
  }

  const response = await handler(request);
  response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
  response.headers.set("X-RateLimit-Limit", config.limit.toString());
  return response;
}

