"use server";

import prisma from "@/lib/prisma";
import { sendConfirmationEmail } from "@/lib/newsletter";
import { logger } from "@/lib/logger";

export type SubscribeState = {
  status: "idle" | "success" | "error" | "already_confirmed";
  message: string;
};

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  try {
    const existing = await prisma.subscriber.findUnique({ where: { email } });

    if (existing?.confirmed) {
      return { status: "already_confirmed", message: "You're already subscribed!" };
    }

    let token: string;
    if (existing) {
      token = existing.token;
    } else {
      token = crypto.randomUUID();
      await prisma.subscriber.create({ data: { email, token } });
    }

    await sendConfirmationEmail(email, token);
    logger.info("newsletter.confirmation_sent", { email });
    await logger.flush();

    return {
      status: "success",
      message: "Check your inbox — we sent you a confirmation email.",
    };
  } catch (err) {
    logger.error("newsletter.subscribe_error", { email, error: String(err) });
    await logger.flush();
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}
