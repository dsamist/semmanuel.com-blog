import Link from "next/link";

export default function SubmittedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-3">Post Submitted!</h1>
        <p className="text-slate-400 mb-8">
          Thanks for your submission. It will be reviewed and published once approved.
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
