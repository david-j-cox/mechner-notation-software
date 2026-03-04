import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mechner Notation",
  description: "Conversational AI tool for creating Mechner notation diagrams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
