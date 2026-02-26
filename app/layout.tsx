// app/layout.tsx
import "./global.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers"; // Import de notre nouveau fichier
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HugoLate",
  description: "Le betting haute précision sur le retard d'Hugo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased bg-slate-950 text-slate-100">
        <Providers> {/* On enveloppe tout ici */}
          <main className="pb-24">
            {children}
          </main>
          <Navbar />
        </Providers>
      </body>
    </html>
  );
}