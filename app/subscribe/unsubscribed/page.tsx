import Link from "next/link";

export default function Unsubscribed() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-sm text-cyan-400 mb-3">{"// unsubscribed"}</p>
        <h1 className="text-2xl font-bold text-slate-100 mb-3">You&apos;ve been unsubscribed</h1>
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
          You won&apos;t receive any more emails from us. If you change your mind, you can always subscribe again.
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
