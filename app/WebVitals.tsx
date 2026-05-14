"use client";

import { useReportWebVitals } from "next/web-vitals";

const VITAL_NAMES: Record<string, string> = {
  TTFB: "Time to First Byte",
  FCP: "First Contentful Paint",
  LCP: "Largest Contentful Paint",
  CLS: "Cumulative Layout Shift",
  INP: "Interaction to Next Paint",
};

export default function WebVitals() {
  useReportWebVitals((metric) => {
    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "info",
        event: "web.vital",
        fields: {
          name: metric.name,
          fullName: VITAL_NAMES[metric.name] ?? metric.name,
          value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
          unit: metric.name === "CLS" ? "score×1000" : "ms",
          rating: metric.rating,
          navigationType: metric.navigationType,
          id: metric.id,
          path: window.location.pathname,
        },
      }),
    }).catch(() => {});
  });

  return null;
}
