import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo") as File;
    const eventId = formData.get("eventId") as string;

    if (!photo || !eventId) {
      return NextResponse.json({ error: "Missing photo or eventId" }, { status: 400 });
    }

    await connectDB();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.photos.length >= 5) {
      return NextResponse.json({ error: "Maximum 5 photos allowed" }, { status: 400 });
    }

    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "events");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${eventId}-${timestamp}-${photo.name}`;
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    const photoUrl = `/uploads/events/${filename}`;

    // Update event with new photo
    event.photos.push(photoUrl);
    await event.save();

    return NextResponse.json({ photoUrl });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}

