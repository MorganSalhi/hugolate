import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getPoliceRank, getRankProgress } from "@/lib/ranks";
import { User, Wallet, Shield, TrendingUp, Award, Flame, Trophy } from "lucide-react";
import ProfileStats from "@/components/ProfileStats"; // <--- Import du nouveau composant

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      bets: {
        include: { course: true },
        orderBy: { createdAt: 'desc' }
      },
      _count: { select: { bets: true } } 
    }
  });

  if (!user) redirect("/login");

  const rank = getPoliceRank(user.walletBalance);
  const progress = getRankProgress(user.walletBalance);
  const RankIcon = rank.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32">
      {/* Header existant... */}
      <header className="mb-10 text-center">
        <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 mb-4 shadow-2xl">
          <User size={48} className="text-indigo-500" />
        </div>
        <h1 className="text-3xl font-black italic tracking-tighter uppercase">{user.name}</h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{user.email}</p>
      </header>

      {/* Carte du Grade Actuel... */}
      {/* (Garder ton code de la carte du grade ici) */}

      {/* Statistiques rapides de séries */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <Flame className="text-orange-500" size={24} />
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-bold">Série Actuelle</p>
            <p className="text-lg font-mono font-bold">{user.currentStreak}</p>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <Trophy className="text-amber-500" size={24} />
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-bold">Record de Série</p>
            <p className="text-lg font-mono font-bold">{user.bestStreak}</p>
          </div>
        </div>
      </div>

      {/* Statistiques rapides existantes (Solde, Missions)... */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
          <Wallet className="text-emerald-500 mb-2" size={20} />
          <p className="text-[9px] text-slate-500 uppercase font-bold">Solde Disponible</p>
          <p className="text-lg font-mono font-bold">{user.walletBalance.toLocaleString()} ₪</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
          <Award className="text-amber-500 mb-2" size={20} />
          <p className="text-[9px] text-slate-500 uppercase font-bold">Missions Saisies</p>
          <p className="text-lg font-mono font-bold">{user._count.bets} Rapports</p>
        </div>
      </div>

      {/* NOUVEAU : Le Bureau des Statistiques (Graphiques) */}
      <ProfileStats bets={user.bets} />
    </div>
  );
}