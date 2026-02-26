"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Coins, TrendingUp, Loader2, ShieldAlert } from "lucide-react";
import { BetSchema } from "@/lib/validations";
import { getPoliceRank } from "@/lib/ranks";

export default function LobbyDeParis() {
    const [course, setCourse] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [betting, setBetting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(BetSchema), // Utilise le nouveau BetSchema
    });

    // 1. Charger les données réelles au démarrage
    useEffect(() => {
        async function initLobby() {
            try {
                const [courseRes, betRes] = await Promise.all([
                    fetch("/api/courses/live"),
                    fetch("/api/bets") // Cette API renvoie l'utilisateur par défaut pour l'instant
                ]);

                if (courseRes.ok) setCourse(await courseRes.json());

                // On récupère les infos de l'utilisateur (solde, etc.)
                const betData = await betRes.json();
                if (betData.user) setUser(betData.user);
            } catch (e) {
                console.error("Erreur de synchro Lobby");
            } finally {
                setLoading(false);
            }
        }
        initLobby();
    }, []);

    // 2. Envoyer le pari en base de données
    const onSubmit = async (data: any) => {
        if (!course) return;
        setBetting(true);
        try {
            const res = await fetch("/api/bets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, courseId: course.id }),
            });

            const result = await res.json();

            if (res.ok) {
                alert(`Pari validé ! Nouveau solde : ${result.newBalance} ₪`);
                // On met à jour le solde affiché localement
                setUser((prev: any) => ({ ...prev, walletBalance: result.newBalance }));
                reset();
            } else {
                alert(result.error || "Erreur lors du pari");
            }
        } catch (error) {
            alert("Serveur injoignable");
        } finally {
            setBetting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
    );

    // Calcul du grade dynamique basé sur le solde réel
    const currentRank = user ? getPoliceRank(user.walletBalance) : getPoliceRank(0);
    const RankIcon = currentRank.icon;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-24 font-sans">
            <header className="mb-8 mt-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-indigo-500 uppercase italic">HugoLate</h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Police des Horaires • ₪</p>
                </div>
                <ShieldAlert className="text-indigo-900/30" size={40} />
            </header>

            {/* Portefeuille et Grade RÉELS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <Coins size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Budget Saisi</p>
                        <p className="text-xl font-mono font-bold text-white">
                            {user?.walletBalance?.toLocaleString() || "0"} ₪
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Grade</p>
                    <div className={`flex items-center gap-1 justify-end font-bold italic text-sm ${currentRank.color}`}>
                        <RankIcon size={14} />
                        <span>{currentRank.label}</span>
                    </div>
                </div>
            </div>

            {/* Affichage dynamique du cours ouvert */}
            {course ? (
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-green-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Enquête en cours</span>
                        </div>

                        <h2 className="text-2xl font-bold leading-tight">{course.subject}</h2>
                        <p className="text-indigo-300 text-sm mb-8">{course.professor} • Début : {new Date(course.scheduledStartTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                {/* CHAMP HEURE */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Arrivée estimée</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input {...register("time")} type="text" placeholder="HH:mm" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 font-mono text-xl" />
                                    </div>
                                    {errors.time && <p className="text-red-400 text-[10px] mt-1">{errors.time.message as string}</p>}
                                </div>

                                {/* CHAMP MISE */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Mise (₪)</label>
                                    <div className="relative">
                                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input {...register("amount")} type="number" placeholder="100" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 font-mono text-xl" />
                                    </div>
                                    {errors.amount && <p className="text-red-400 text-[10px] mt-1">{errors.amount.message as string}</p>}
                                </div>
                            </div>

                            <button disabled={betting} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest">
                                {betting ? <Loader2 className="animate-spin" /> : <TrendingUp size={18} />}
                                CONFIRMER L'INVESTIGATION
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl opacity-40">
                    <p className="text-slate-500 font-bold uppercase text-xs">Aucune session active</p>
                    <p className="text-slate-600 text-[10px] mt-2">En attente d'ouverture par le Commissariat.</p>
                </div>
            )}
        </div>
    );
}