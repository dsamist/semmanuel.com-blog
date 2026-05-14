"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { BrevoClient } from "@getbrevo/brevo";
import { logger, formatError } from "@/lib/logger";

export async function login(formData: FormData) {
  const key = formData.get("key") as string;
  const success = !!(key && key === process.env.ADMIN_KEY);

  if (success) {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", key, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    logger.info("admin.login.success");
  } else {
    logger.warn("admin.login.failed", { reason: "wrong_key" });
  }

  await logger.flush();
  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  logger.info("admin.logout");
  await logger.flush();
  redirect("/admin");
}

export async function approvePost(postId: number) {
  const start = Date.now();
  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: { published: true, rejectionReason: null },
      select: { title: true },
    });
    logger.info("post.approved", {
      postId,
      title: post.title,
      durationMs: Date.now() - start,
    });
  } catch (err) {
    logger.error("post.approve.error", {
      postId,
      ...formatError(err),
      durationMs: Date.now() - start,
    });
    await logger.flush();
    throw err;
  }
  await logger.flush();
  redirect("/admin");
}

export async function rejectPost(postId: number, formData: FormData) {
  const start = Date.now();
  const reason = (formData.get("reason") as string)?.trim() || "No reason provided.";

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: { select: { email: true, name: true } } },
  });

  if (!post) {
    logger.warn("post.reject.not_found", { postId });
    await logger.flush();
    redirect("/admin");
  }

  try {
    await prisma.post.update({
      where: { id: postId },
      data: { rejectionReason: reason },
    });
  } catch (err) {
    logger.error("post.reject.db_error", {
      postId,
      ...formatError(err),
      durationMs: Date.now() - start,
    });
    await logger.flush();
    throw err;
  }

  const submitterEmail = post!.author?.email;
  const isPlaceholder = submitterEmail?.endsWith("@blog-submission.internal");
  let emailSent = false;

  if (submitterEmail && !isPlaceholder && process.env.BREVO_API_KEY) {
    try {
      const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.semmanuel.com";
      const editUrl = `${siteUrl}/posts/${postId}/edit`;
      const authorName = post!.author?.name || "there";

      await brevo.transactionalEmails.sendTransacEmail({
        subject: `Your post "${post!.title}" needs some changes`,
        sender: {
          name: "semmanuel.com blog",
          email: process.env.BREVO_SENDER_EMAIL || "noreply@semmanuel.com",
        },
        to: [{ email: submitterEmail, name: authorName }],
        htmlContent: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
            <h2 style="color:#0891b2">Hi ${authorName},</h2>
            <p>Thanks for submitting <strong>"${post!.title}"</strong> to the blog. After review, it needs a few changes before it can be published.</p>
            <div style="background:#f1f5f9;border-left:4px solid #0891b2;padding:12px 16px;margin:20px 0;border-radius:4px">
              <strong>Feedback:</strong><br/>${reason.replace(/\n/g, "<br/>")}
            </div>
            <p>You can update your post using the link below — no account needed:</p>
            <a href="${editUrl}" style="display:inline-block;background:#0891b2;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Edit your post →</a>
            <p style="margin-top:24px;color:#64748b;font-size:13px">Once you resubmit, it'll go back into the review queue.</p>
          </div>
        `,
      });

      emailSent = true;
      logger.info("email.rejection.sent", { postId, to: submitterEmail });
    } catch (err) {
      logger.error("email.rejection.failed", { postId, to: submitterEmail, ...formatError(err) });
    }
  }

  logger.info("post.rejected", {
    postId,
    title: post!.title,
    emailSent,
    hasSubmitterEmail: !isPlaceholder,
    durationMs: Date.now() - start,
  });

  await logger.flush();
  redirect("/admin");
}
