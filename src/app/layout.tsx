import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://santiagoramirez.dev"),
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Locale layout handles <html>/<body> tags
  return children;
}
