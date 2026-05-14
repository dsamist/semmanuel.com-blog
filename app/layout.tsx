// app/layout.tsx
import "./globals.css";
import Header from "./Header";
import WebVitals from "./WebVitals";

export const metadata = {
  title: "Samuel Emmanuel | Cloud & DevOps Blog",
  description: "Cloud & DevOps insights from Samuel Ene-ojo Emmanuel — a Cloud Platform Engineer at ARHS Group (Accenture), Luxembourg. Writing about AWS, Kubernetes, Terraform, and platform engineering.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <WebVitals />
        </div>
      </body>
    </html>
  );
}
