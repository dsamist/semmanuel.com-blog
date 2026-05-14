"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [dbConfigured, setDbConfigured] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
    if (!databaseUrl || databaseUrl === "prisma+postgres://accelerate.prisma-data.net/?api_key=API_KEY") {
      setDbConfigured(false);
    }
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/95 backdrop-blur-md border-b border-slate-800 py-3"
          : "bg-slate-950 py-4"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="font-mono text-base font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
          <span className="text-slate-500">&lt;</span>semmanuel.com<span className="text-slate-500">/&gt;</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="https://semmanuel.com"
            target="_blank"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Portfolio
          </Link>
          {dbConfigured && (
            <>
              <Link href="/posts" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                All Posts
              </Link>
              <Link
                href="/posts/new"
                className="text-sm px-4 py-1.5 border border-cyan-500/40 text-cyan-400 rounded-md hover:bg-cyan-500/10 transition-colors"
              >
                Write
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
