"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react"; // Importation de signOut
import { LayoutDashboard, Trophy, UserCog, History, LogOut, ShieldAlert } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Lobby", href: "/lobby", icon: LayoutDashboard },
    { name: "Hiérarchie", href: "/leaderboard", icon: Trophy },
    { name: "Archives", href: "/history", icon: History },
    { name: "Profil", href: "/profile", icon: UserCog }, // On change UserCog de l'Admin vers Profil
    { name: "Admin", href: "/admin", icon: ShieldAlert }, // On change l'icône Admin
  ];

  // On ne montre pas la Navbar sur la page de login
  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800 px-4 py-3 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-tighter">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Bouton de déconnexion */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex flex-col items-center gap-1 text-red-500/70 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Quitter</span>
        </button>
      </div>
    </nav>
  );
}