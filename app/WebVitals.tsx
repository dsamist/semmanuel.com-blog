"use client";

import { useReportWebVitals } from "next/web-vitals";

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
          value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
          unit: metric.name === "CLS" ? "score×1000" : "ms",
          rating: metric.rating,
          navigationType: metric.navigationType,
          id: metric.id,
        },
      }),
    }).catch(() => {});
  });

  return null;
}
