import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serendipity",
  description:
    "A calm experience network built to help people discover places, people, and passions that change their lives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-paper text-ink">{children}</body>
    </html>
  );
}
