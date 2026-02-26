// app/leaderboard/page.tsx
import { prisma } from "@/lib/prisma";
import { getPoliceRank } from "@/lib/ranks";
import { TrendingUp, Shield, AlertCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function LeaderboardPage() {
    // Sécurité : Vérification de la session avant d'accéder aux données
    const session = await getServerSession();
    if (!session) {
        redirect("/login");
    }

    // Récupération des 20 meilleurs agents avec tri par solde décroissant
    const users = await prisma.user.findMany({
        orderBy: {
            walletBalance: 'desc'
        },
        take: 20
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32">
            <header className="mb-10">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="text-indigo-500" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        Unité d'Investigation HugoLate
                    </span>
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter">HIÉRARCHIE</h1>
                <p className="text-slate-500 text-sm">Tableau d'avancement des effectifs selon les saisies de ₪.</p>
            </header>

            <div className="space-y-3">
                {users.length > 0 ? (
                    users.map((user, index) => {
                        const rank = getPoliceRank(user.walletBalance);
                        const Icon = rank.icon;

                        return (
                            <div
                                key={user.id}
                                className={`flex items-center justify-between p-4 rounded-2xl bg-slate-900/40 border ${rank.border} backdrop-blur-sm relative overflow-hidden group`}
                            >
                                {/* Effet visuel pour le podium (Top 3) */}
                                {index < 3 && (
                                    <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none" />
                                )}

                                <div className="flex items-center gap-4 relative z-10">
                                    <span className={`text-lg font-mono font-black w-6 ${index < 3 ? 'text-indigo-400' : 'text-slate-700'}`}>
                                        #{index + 1}
                                    </span>

                                    <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${rank.color}`}>
                                        <Icon size={24} />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-slate-200">{user.name}</h3>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${rank.color}`}>
                                            {rank.label}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right relative z-10">
                                    <div className="flex items-center justify-end gap-1 text-xl font-mono font-bold text-white leading-none">
                                        {user.walletBalance.toLocaleString()}
                                        <span className="text-xs text-slate-500 italic">₪</span>
                                    </div>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter mt-1">
                                        Shekels cumulés
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-slate-900 rounded-3xl opacity-30">
                        <TrendingUp size={48} className="mx-auto mb-4" />
                        <p className="uppercase font-black text-xs tracking-widest">Aucun agent répertorié</p>
                    </div>
                )}
            </div>

            <div className="mt-12 p-5 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl flex items-start gap-4">
                <AlertCircle className="text-indigo-500 shrink-0" size={20} />
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    "Note de service : Les promotions sont automatiques et basées sur votre flair d'enquêteur. Tout retard non signalé est une faute grave."
                </p>
            </div>
        </div>
    );
}