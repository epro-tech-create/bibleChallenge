import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DITSCF BibleChallenge",
  description: "Read. Compete. Grow.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
