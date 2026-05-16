"use client";

import { useActionState } from "react";
import { subscribe, SubscribeState } from "@/app/actions/subscribe";

const initialState: SubscribeState = { status: "idle", message: "" };

export default function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, initialState);

  if (state.status === "success" || state.status === "already_confirmed") {
    return (
      <p className="text-sm font-mono text-cyan-400">{state.message}</p>
    );
  }

  return (
    <div className="space-y-3">
      <form action={action} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="your@email.com"
          className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-semibold text-sm rounded-lg transition-colors"
        >
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {state.status === "error" && (
        <p className="text-xs text-red-400">{state.message}</p>
      )}
    </div>
  );
}
