import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Uncle Sam's Apartment",
    default: "Uncle Sam's Apartment — Management System",
  },
  description:
    "Property management system for Uncle Sam's Apartment, Nyayo Gate B, Naivas Court, Embakasi, Nairobi.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
