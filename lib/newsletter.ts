import { BrevoClient } from "@getbrevo/brevo";

const SENDER = {
  name: "semmanuel.com blog",
  email: process.env.BREVO_SENDER_EMAIL || "noreply@semmanuel.com",
};
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.semmanuel.com";

export async function sendConfirmationEmail(email: string, token: string) {
  if (!process.env.BREVO_API_KEY) return;
  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
  const confirmUrl = `${SITE_URL}/api/subscribe/confirm?token=${token}`;

  await brevo.transactionalEmails.sendTransacEmail({
    subject: "Confirm your subscription to semmanuel.com",
    sender: SENDER,
    to: [{ email }],
    htmlContent: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b;padding:32px 24px">
        <p style="font-family:monospace;font-size:12px;color:#0891b2;margin:0 0 16px">// newsletter</p>
        <h2 style="color:#0f172a;margin:0 0 16px">One click to confirm</h2>
        <p style="color:#475569">You asked to subscribe to new posts on <strong>semmanuel.com</strong>. Click below to confirm your subscription:</p>
        <a href="${confirmUrl}" style="display:inline-block;background:#0891b2;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0">Confirm subscription →</a>
        <p style="margin-top:24px;color:#94a3b8;font-size:13px">If you didn't request this, just ignore this email — nothing will happen.</p>
      </div>
    `,
  });
}

export async function sendNewsletterNotifications(
  subscribers: { email: string; token: string }[],
  post: { id: number; title: string; content: string | null }
) {
  if (!process.env.BREVO_API_KEY || subscribers.length === 0) return;
  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
  const postUrl = `${SITE_URL}/posts/${post.id}`;
  const excerpt = post.content
    ? post.content.replace(/[#*`_>\[\]]/g, "").trim().slice(0, 220) + "…"
    : "";

  await Promise.allSettled(
    subscribers.map(({ email, token }) => {
      const unsubscribeUrl = `${SITE_URL}/api/subscribe/unsubscribe?token=${token}`;
      return brevo.transactionalEmails.sendTransacEmail({
        subject: `New post: ${post.title}`,
        sender: SENDER,
        to: [{ email }],
        htmlContent: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b;padding:32px 24px">
            <p style="font-family:monospace;font-size:12px;color:#0891b2;margin:0 0 16px">// new post</p>
            <h2 style="color:#0f172a;margin:0 0 12px">${post.title}</h2>
            <p style="color:#475569;line-height:1.6">${excerpt}</p>
            <a href="${postUrl}" style="display:inline-block;background:#0891b2;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;margin:20px 0">Read post →</a>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0"/>
            <p style="color:#94a3b8;font-size:12px;margin:0">
              You're receiving this because you subscribed to new posts on semmanuel.com.<br/>
              <a href="${unsubscribeUrl}" style="color:#94a3b8">Unsubscribe</a>
            </p>
          </div>
        `,
      });
    })
  );
}
