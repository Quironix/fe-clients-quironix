import sgMail from "@sendgrid/mail";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";

const apiKey = process.env.NEXT_SENDGRID_API_KEY;
if (!apiKey || apiKey.length < 20) {
  throw new Error(
    "NEXT_SENDGRID_API_KEY not configured. Set it in your environment variables.",
  );
}
sgMail.setApiKey(apiKey);

const SINGLE_TEMPLATE_ID =
  process.env.NEXT_SG_SINGLE_MANAGEMENT || "d-2ab3e2439491440c951a1cf46fdec7aa";
const MULTIPLE_TEMPLATE_ID =
  process.env.NEXT_SG_MULTIPLE_MANAGEMENT ||
  "d-f3db644c64b1410f981ee7642d28aba4";

const ALLOWED_TEMPLATES = [SINGLE_TEMPLATE_ID, MULTIPLE_TEMPLATE_ID];

const emailSchema = z.object({
  to: z.string().email("Invalid email format"),
  from: z.object({
    name: z.string().min(1).max(100),
    email: z.literal("collector@quironix.com"),
  }),
  templateId: z.string().optional(),
  dynamicTemplateData: z.record(z.string(), z.any()).optional(),
});

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = 10;
  const window = 60 * 1000;

  const record = requestCounts.get(identifier);

  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + window });
    return true;
  }

  if (record.count >= limit) return false;

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await auth();
    if (!session?.token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier =
      session.user?.email ||
      request.headers.get("x-forwarded-for") ||
      "unknown";
    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 },
      );
    }

    const origin = request.headers.get("origin");
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      "http://localhost:5173",
    ].filter(Boolean);

    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = emailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { to, from, dynamicTemplateData } = validation.data;
    let templateId = validation.data.templateId || "";

    if (!templateId && dynamicTemplateData) {
      const isMultiple =
        dynamicTemplateData.managements &&
        Array.isArray(dynamicTemplateData.managements);
      templateId = isMultiple ? MULTIPLE_TEMPLATE_ID : SINGLE_TEMPLATE_ID;
    }

    if (!templateId || !ALLOWED_TEMPLATES.includes(templateId)) {
      return NextResponse.json(
        { error: "Invalid or missing template ID" },
        { status: 400 },
      );
    }

    const msg = {
      to,
      from,
      templateId,
      dynamicTemplateData,
    };

    await sgMail.send(msg);

    console.log({
      event: "email_sent",
      user: session.user?.email,
      to,
      templateId,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("SendGrid error:", {
      message: error.message,
      code: error.code,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send email",
      },
      { status: 500 },
    );
  }
}
