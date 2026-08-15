import { z } from "zod";

const PHONE_CHANNELS = ["phone", "whatsapp", "sms"] as const;

export const contactSchema = z
  .object({
    name: z.string().min(1),
    role: z.string().min(1),
    function: z.string().min(1),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    channel: z.string().min(1),
    default: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    const channel = data.channel.toLowerCase().trim();
    const email = data.email?.trim() ?? "";
    const phone = data.phone?.trim() ?? "";

    if (PHONE_CHANNELS.includes(channel as (typeof PHONE_CHANNELS)[number])) {
      if (!phone || phone.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "validation.phoneRequiredForChannel",
        });
      }
    } else if (channel === "email") {
      if (!email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "validation.emailRequiredForChannel",
        });
      }
    }
  });

export type ContactFormValues = z.infer<typeof contactSchema>;
