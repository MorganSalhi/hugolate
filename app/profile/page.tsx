import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getPoliceRank, getRankProgress } from "@/lib/ranks";
import { User, Wallet, Shield, TrendingUp, Award } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { _count: { select: { bets: true } } }
  });

  if (!user) redirect("/login");

  const rank = getPoliceRank(user.walletBalance);
  const progress = getRankProgress(user.walletBalance);
  const RankIcon = rank.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32">
      <header className="mb-10 text-center">
        <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 mb-4 shadow-2xl">
          <User size={48} className="text-indigo-500" />
        </div>
        <h1 className="text-3xl font-black italic tracking-tighter uppercase">{user.name}</h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{user.email}</p>
      </header>

      {/* Carte du Grade Actuel */}
      <div className={`mb-8 p-6 rounded-3xl bg-slate-900/50 border-2 ${rank.border} relative overflow-hidden`}>
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 ${rank.color}`}>
            <RankIcon size={32} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Grade Actuel</p>
            <h2 className={`text-xl font-black uppercase italic ${rank.color}`}>{rank.label}</h2>
          </div>
        </div>

        {/* Barre de Progression */}
        {!progress.isMax ? (
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-2">
              <p className="text-[10px] font-black uppercase text-slate-400">Progression vers {progress.nextLabel}</p>
              <p className="text-xs font-mono font-bold text-indigo-400">-{progress.needed.toLocaleString()} ₪</p>
            </div>
            <div className="h-4 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 font-mono text-[9px] text-slate-600 uppercase">
              <span>{rank.min.toLocaleString()} ₪</span>
              <span>{progress.nextMin?.toLocaleString()} ₪</span>
            </div>
          </div>
        ) : (
          <p className="text-amber-400 text-xs font-bold uppercase italic text-center">Échelon Maximum Atteint</p>
        )}

        <TrendingUp className="absolute -right-8 -bottom-8 opacity-5 text-white" size={150} />
      </div>

      {/* Statistiques rapides */}
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
    </div>
  );
}