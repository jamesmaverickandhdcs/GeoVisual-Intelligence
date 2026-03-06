import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/ui/Navbar";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GeoVisual Intelligence",
  description: "AI-Powered Global Geopolitical Mapping & Stock Market Analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: "#0F1F33", color: "#fff", margin: 0, padding: 0 }}>
        <Navbar />
        <main style={{ height: "calc(100vh - 53px)", overflow: "auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
