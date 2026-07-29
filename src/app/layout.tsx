import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/app/Providers";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CursorSpotlight } from "@/components/CursorSpotlight";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  weight: ["400", "500", "600"]
});
const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains-mono", 
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "Payslip — Robinhood Chain Payments",
  description: "Send payslips and ETH payments on the Robinhood Chain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", inter.variable, jetbrains.variable)}>
      <body className="font-sans antialiased bg-[#0a0a1a] text-white">
        <LoadingScreen />
        <CursorSpotlight />
        <Providers>
          <div className="animate-page-enter">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
