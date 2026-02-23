import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Topic News - Curated Intelligence",
  description: "A premium, topic-based news aggregator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
