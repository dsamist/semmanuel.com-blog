export const dynamic = "force-dynamic";

import { logger, getRequestContext, isMonitoringBot } from "@/lib/logger";
import Link from "next/link";

export default async function NotFound() {
  const ctx = await getRequestContext();
  if (!isMonitoringBot((ctx.userAgent as string | undefined) ?? "")) {
    logger.warn("page.not_found", { ...ctx });
    await logger.flush();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-sm text-cyan-400 mb-3">{'// 404'}</p>
        <h1 className="text-2xl font-bold text-slate-100 mb-3">Page not found</h1>
        <p className="text-slate-400 mb-8 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/"
          className="text-sm text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 px-5 py-2.5 rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
