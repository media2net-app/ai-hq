import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-HQ - Agentic Workflow Platform",
  description: "Automate your projects with AI agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
