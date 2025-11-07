import sgMail from "@sendgrid/mail";
import { NextResponse } from "next/server";

sgMail.setApiKey(process.env.NEXT_SENDGRID_API_KEY || "");

export async function GET() {
  try {
    const apiKey = process.env.NEXT_SENDGRID_API_KEY;
    console.log(apiKey);

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "NEXT_SENDGRID_API_KEY is not configured",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    const msg = {
      to: "ignacionorambuenag@gmail.com",
      from: {
        name: "Birdxlab SPA",
        email: "contacto@birdxlab.com",
      },
      subject: "SendGrid API Key Test",
      text: "This is a test email to validate SendGrid API key",
      html: "<strong>This is a test email to validate SendGrid API key</strong>",
    };

    await sgMail.send(msg);

    return NextResponse.json({
      success: true,
      message: "SendGrid API key is valid and email was sent successfully",
      timestamp: new Date().toISOString(),
      apiKeyPrefix: apiKey.substring(0, 10) + "...",
    });
  } catch (error: any) {
    console.error("SendGrid validation error:", error);

    const errorDetails = error.response?.body?.errors || [
      { message: error.message },
    ];

    return NextResponse.json(
      {
        success: false,
        error: "SendGrid API key validation failed",
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }
}
