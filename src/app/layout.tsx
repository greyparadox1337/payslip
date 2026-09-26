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
  title: "Payslip — Botchain Payments",
  description: "Send payslips and ETH payments on the Botchain",
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
      
        <footer style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid #eaeaea', textAlign: 'center', fontSize: '0.875rem', zIndex: 10, position: 'relative', backgroundColor: 'inherit', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span>Ecosystem Partner Botchain</span>
            <img src="https://botchain.ai/favicon.ico" alt="Botchain Logo" width={20} height={20} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <a href="https://botchain.ai" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>BOT Chain Official Website</a>
            <a href="https://scan.botchain.ai" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>BOT Chain Explorer</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
