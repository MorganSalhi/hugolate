import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Clock, CheckCircle2, XCircle, TrendingUp, NotebookTabs } from "lucide-react";

export default async function HistoryPage() {
  const session = await getServerSession();

  // Sécurité : Redirection vers login si non connecté
  if (!session?.user?.email) {
    redirect("/login");
  }

  // Récupération des paris uniquement pour l'agent connecté
  const bets = await prisma.bet.findMany({
    where: {
      user: { email: session.user.email }
    },
    include: {
      course: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32 font-sans">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <NotebookTabs className="text-indigo-500" size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            Archives Centrales HugoLate
          </span>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter text-white">MES DOSSIERS</h1>
        <p className="text-slate-500 text-sm">Rapports d'interventions de l'agent {session.user.name}.</p>
      </header>

      <div className="space-y-4">
        {bets.length > 0 ? (
          bets.map((bet) => {
            const isResolved = bet.course.status === "FINISHED";
            const won = (bet.pointsEarned ?? 0) > bet.amount; // Succès si on gagne plus que la mise

            return (
              <div key={bet.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="font-bold text-lg leading-tight text-slate-100">{bet.course.subject}</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                      {bet.course.professor}
                    </p>
                  </div>
                  
                  {isResolved ? (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${won ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {won ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {won ? 'Profit' : 'Perte'}
                    </div>
                  ) : (
                    <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                      <Clock size={12} className="animate-pulse" />
                      En cours
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-800/50 pt-4 relative z-10">
                  <div>
                    <p className="text-[9px] text-slate-600 uppercase font-black mb-1 tracking-tighter">Mise / Est. Arrivée</p>
                    <p className="font-mono text-sm text-indigo-300">
                      {bet.amount} ₪ • {new Date(bet.guessedTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-600 uppercase font-black mb-1 tracking-tighter">Retour Mission</p>
                    <p className={`font-mono text-lg font-black ${won ? 'text-green-400' : 'text-slate-500'}`}>
                      {isResolved ? `+${bet.pointsEarned} ₪` : '-- ₪'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-slate-900 rounded-3xl opacity-20">
            <TrendingUp size={40} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Aucune mission archivée</p>
          </div>
        )}
      </div>
    </div>
  );
}