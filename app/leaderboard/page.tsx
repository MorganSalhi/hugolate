import { prisma } from "@/lib/prisma";
import { POLICE_RANKS } from "@/lib/ranks";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Shield, Target, Flame, Trophy, TrendingUp, Skull } from "lucide-react"; // Ajout de Skull

export default async function LeaderboardPage() {
    const session = await getServerSession();
    if (!session) redirect("/login");

    const allUsers = await prisma.user.findMany({
        orderBy: { walletBalance: 'desc' },
        include: {
            _count: {
                select: { bets: true }
            }
        }
    });

    // Le n°1 au classement est la cible (Wanted)
    const wantedTarget = allUsers[0];
    const BOUNTY_AMOUNT = 5000;

    const reversedRanks = [...POLICE_RANKS].reverse();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32 font-sans">
            <header className="mb-10">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="text-indigo-500" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        Organigramme de la Brigade
                    </span>
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Hiérarchie</h1>
                <p className="text-slate-500 text-sm font-medium">Positionnement des effectifs selon le mérite et la régularité.</p>
            </header>

            <div className="space-y-8">
                {reversedRanks.map((rank, idx) => {
                    const nextRank = reversedRanks[idx - 1];
                    const usersInRank = allUsers.filter(u => 
                        u.walletBalance >= rank.min && (nextRank ? u.walletBalance < nextRank.min : true)
                    );

                    const Icon = rank.icon;

                    return (
                        <div key={rank.label} className="relative">
                            <div className={`flex items-center gap-3 mb-4 p-4 rounded-2xl bg-slate-900/30 border-l-4 ${rank.border} ${rank.color} backdrop-blur-sm shadow-xl shadow-slate-950/50`}>
                                <Icon size={20} />
                                <div>
                                    <h2 className="font-black uppercase tracking-widest text-[10px]">{rank.label}</h2>
                                    <p className="text-[9px] opacity-50 font-mono">Requis : {rank.min.toLocaleString()} ₪</p>
                                </div>
                                <div className="ml-auto bg-slate-950/50 px-2 py-1 rounded text-[10px] font-mono font-bold">
                                    {usersInRank.length} Agent{usersInRank.length > 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="grid gap-2 pl-6">
                                {usersInRank.length > 0 ? (
                                    usersInRank.map((user) => {
                                        const isWanted = user.id === wantedTarget?.id;

                                        return (
                                            <div 
                                                key={user.id} 
                                                className={`relative flex justify-between items-center p-4 rounded-xl border transition-all ${
                                                    isWanted 
                                                    ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                                                    : 'bg-slate-900/60 border-slate-800/50'
                                                } ${user.email === session.user?.email ? 'ring-1 ring-indigo-500 bg-indigo-500/10' : ''}`}
                                            >
                                                {/* Badge WANTED si c'est le n°1 */}
                                                {isWanted && (
                                                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 animate-bounce z-10">
                                                        <Skull size={8} /> WANTED : {BOUNTY_AMOUNT} ₪
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4">
                                                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                        {user.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-xs text-slate-200 block">
                                                            {user.name} {user.email === session.user?.email && " (Toi)"}
                                                        </span>
                                                        
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <div className={`flex items-center gap-0.5 text-[9px] font-black uppercase ${user.currentStreak > 0 ? 'text-orange-500' : 'text-slate-700'}`}>
                                                                <Flame size={10} className={user.currentStreak >= 5 ? 'animate-bounce' : ''} />
                                                                {user.currentStreak}
                                                            </div>

                                                            {user.bestStreak > 0 && (
                                                                <div className="flex items-center gap-0.5 text-[9px] font-black text-amber-500 uppercase">
                                                                    <Trophy size={10} />
                                                                    {user.bestStreak}
                                                                </div>
                                                            )}

                                                            <div className="flex items-center gap-0.5 text-[9px] font-black text-slate-600 uppercase">
                                                                <TrendingUp size={10} />
                                                                {user._count.bets} <span className="text-[7px] ml-0.5">Rapports</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <span className={`font-mono font-bold text-sm block tracking-tighter ${isWanted ? 'text-red-400' : 'text-indigo-400'}`}>
                                                        {user.walletBalance.toLocaleString()} ₪
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-[9px] text-slate-700 uppercase font-black tracking-widest pl-2 italic">
                                        Échelon vacant
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}