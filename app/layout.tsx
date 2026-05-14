// app/layout.tsx
import "./globals.css";
import Header from "./Header";

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
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
