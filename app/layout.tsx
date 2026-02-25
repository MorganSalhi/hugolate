import "./global.css";
import Navbar from "@/components/Navbar"; // Importation de la barre
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
        <main className="pb-24"> {/* Padding en bas pour ne pas cacher le contenu sous la Navbar */}
          {children}
        </main>
        <Navbar /> {/* La barre est ici ! */}
      </body>
    </html>
  );
}