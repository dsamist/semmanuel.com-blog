"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "error",
        event: "app.unhandled_error",
        fields: {
          message: error.message,
          errorType: error.name,
          stack: error.stack,
          digest: error.digest,
        },
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-sm text-red-400 mb-3">{'// error'}</p>
        <h1 className="text-2xl font-bold text-slate-100 mb-3">Something went wrong</h1>
        <p className="text-slate-400 mb-2 text-sm">
          An unexpected error occurred. It has been logged.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-slate-600 mb-6">ref: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="text-sm text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 px-5 py-2.5 rounded-lg transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-slate-300 border border-slate-700 px-5 py-2.5 rounded-lg transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
