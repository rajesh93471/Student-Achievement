import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Student Achievement and Profile Management System",
  description: "Centralized academic profiles, achievements, analytics, and reporting",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
