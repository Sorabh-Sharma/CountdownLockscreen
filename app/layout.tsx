import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Nunito } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Habit & Goal Lock Screen — Cozy Companion",
  description: "Create an adorable storybook lock-screen wallpaper for your daily habits and goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${nunito.variable}`}>
      <body className="bg-[#f0f4ec] text-[#243021] font-sans antialiased selection:bg-[#688a3c] selection:text-white">
        {children}
      </body>
    </html>
  );
}
