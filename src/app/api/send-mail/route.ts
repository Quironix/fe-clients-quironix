import sgMail from "@sendgrid/mail";
import { NextRequest, NextResponse } from "next/server";

sgMail.setApiKey(process.env.NEXT_SENDGRID_API_KEY || "");

const DEFAULT_TEMPLATE_ID = process.env.NEXT_SG_SINGLE_MANAGEMENT || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.to || !body.from) {
      return NextResponse.json(
        { error: "Missing required fields: to, from" },
        { status: 400 }
      );
    }

    let msg: any;

    if (body.dynamicTemplateData) {
      const templateId = body.templateId || DEFAULT_TEMPLATE_ID;

      if (!templateId) {
        return NextResponse.json(
          { error: "Template ID not configured" },
          { status: 500 }
        );
      }

      msg = {
        to: body.to,
        from: body.from,
        templateId: templateId,
        dynamicTemplateData: body.dynamicTemplateData,
      };
    } else {
      msg = body;
    }

    await sgMail.send(msg);

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("SendGrid error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send email",
        details: error.response?.body?.errors || error.message,
      },
      { status: 500 }
    );
  }
}
