import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PWARegistrar } from "@/components/pwa-registrar";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "RumahKu — Sabah's Trusted Rental App",
    template: "%s · RumahKu",
  },
  description:
    "Find verified, scam-safe rooms and homes across Sabah. Compare fair prices, match with compatible housemates, and rent with confidence.",
  applicationName: "RumahKu",
  keywords: [
    "Sabah rental",
    "Kota Kinabalu room rental",
    "bilik sewa Sabah",
    "verified rental",
    "scam-safe rental",
    "RumahKu",
  ],
};

export const viewport: Viewport = {
  themeColor: "#1e5cad",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delay={200}>
          {children}
          <PWARegistrar />
          <Toaster richColors position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}
