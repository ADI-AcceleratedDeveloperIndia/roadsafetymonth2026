import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import QuizAttempt from "@/models/QuizAttempt";
import { generateReferenceId } from "@/lib/reference";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import memoryCache from "@/lib/cache";
import enQuiz from "@/locales/en/quiz.json";
import teQuiz from "@/locales/te/quiz.json";

const submitQuizSchema = z.object({
  fullName: z.string().min(1),
  institution: z.string().optional(),
  answers: z.array(z.number()),
});

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the minimum age to obtain a driving license in India?",
    options: ["16 years", "18 years", "20 years", "21 years"],
    correct: 1,
  },
  {
    id: 2,
    question: "Is it mandatory to wear a helmet while riding a two-wheeler?",
    options: ["Yes, always", "Only on highways", "Only in cities", "No"],
    correct: 0,
  },
  {
    id: 3,
    question: "What should you do at a red traffic light?",
    options: ["Slow down", "Stop completely", "Speed up", "Ignore"],
    correct: 1,
  },
  {
    id: 4,
    question: "What is the maximum speed limit in residential areas?",
    options: ["30 km/h", "40 km/h", "50 km/h", "60 km/h"],
    correct: 1,
  },
  {
    id: 5,
    question: "When should you use indicators while driving?",
    options: ["Never", "Only when turning", "Before changing lanes or turning", "Only on highways"],
    correct: 2,
  },
  {
    id: 6,
    question: "What does a yellow traffic light mean?",
    options: ["Go", "Stop", "Slow down and prepare to stop", "Speed up"],
    correct: 2,
  },
  {
    id: 7,
    question: "Is it safe to use a mobile phone while driving?",
    options: ["Yes, if hands-free", "No, never", "Only for calls", "Only for messages"],
    correct: 1,
  },
  {
    id: 8,
    question: "What should pedestrians do before crossing the road?",
    options: ["Run across", "Look both ways", "Use phone", "Assume vehicles will stop"],
    correct: 1,
  },
  {
    id: 9,
    question: "What is the legal blood alcohol limit for driving in India?",
    options: ["0.03%", "0.05%", "0.08%", "Zero tolerance"],
    correct: 3,
  },
  {
    id: 10,
    question: "How much following distance should you maintain behind another vehicle?",
    options: ["1 meter", "At least a 2-second gap", "5 meters", "Doesn't matter"],
    correct: 1,
  },
  {
    id: 11,
    question: "What should you do if you see an ambulance with flashing lights?",
    options: ["Ignore it", "Give way immediately", "Slow down slightly", "Speed up"],
    correct: 1,
  },
  {
    id: 12,
    question: "Is it mandatory to wear seatbelts in the front seat?",
    options: ["Yes", "No", "Only on highways", "Only for drivers"],
    correct: 0,
  },
  {
    id: 13,
    question: "What should you do if your vehicle breaks down on a highway?",
    options: ["Leave it", "Move to the side and use hazard lights", "Stay in the middle", "Call and wait"],
    correct: 1,
  },
  {
    id: 14,
    question: "What does a zebra crossing indicate?",
    options: ["Parking area", "Pedestrian crossing", "No entry", "Speed limit"],
    correct: 1,
  },
  {
    id: 15,
    question: "What is the penalty for jumping a red light?",
    options: ["Warning", "Fine of ₹1000-5000", "No penalty", "License suspension"],
    correct: 1,
  },
];

const MERIT_CUTOFF = Math.ceil(QUIZ_QUESTIONS.length * 0.6);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 quiz submissions per minute per IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 10, 60000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many quiz submissions. Please wait before trying again." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const body = await request.json();
    const validated = submitQuizSchema.parse(body);

    // Validate answers array length
    if (validated.answers.length !== QUIZ_QUESTIONS.length) {
      return NextResponse.json(
        { error: "Invalid number of answers" },
        { status: 400 }
      );
    }

    let score = 0;
    for (let i = 0; i < QUIZ_QUESTIONS.length && i < validated.answers.length; i++) {
      if (validated.answers[i] === QUIZ_QUESTIONS[i].correct) {
        score++;
      }
    }

    const passed = score >= MERIT_CUTOFF;
    const certificateType = passed ? "QUIZ" : "PAR";

    const referenceId = generateReferenceId(certificateType);
    let attemptId: string | null = null;
    
    try {
      await connectDB();

      const attempt = new QuizAttempt({
        referenceId,
        fullName: validated.fullName,
        institution: validated.institution,
        score,
        passed,
        certificateType,
      });

      await attempt.save();
      attemptId = attempt._id.toString();
      
      // Invalidate stats cache since we have new data
      memoryCache.delete("stats:overview");
    } catch (dbError) {
      console.error("Quiz attempt storage error:", dbError);
      // Continue without persistence - don't fail the request
      // In high-traffic scenarios, we want to be resilient
    }

    return NextResponse.json({
      success: true,
      score,
      total: QUIZ_QUESTIONS.length,
      passed,
      attemptId,
      referenceId,
      certificateType,
      meritCutoff: MERIT_CUTOFF,
    }, {
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Quiz submission error:", error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}

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

    // Get language from query parameter or header
    const lang = request.nextUrl.searchParams.get("lang") || "en";
    const cacheKey = `quiz:questions:${lang}`;
    
    // Check cache (quiz questions don't change often)
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "X-Cache": "HIT",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        }
      });
    }

    const quizData = lang === "te" ? teQuiz : enQuiz;
    
    // Map translated questions to the format expected by frontend
    const translatedQuestions = quizData.questions.map((q, idx) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correct: QUIZ_QUESTIONS[idx].correct, // Keep original correct answer index
    }));
    
    const result = { questions: translatedQuestions };
    
    // Cache for 1 hour (questions rarely change)
    memoryCache.set(cacheKey, result, 3600000);
    
    return NextResponse.json(result, {
      headers: {
        "X-Cache": "MISS",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      }
    });
  } catch (error) {
    console.error("Quiz GET error:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}








