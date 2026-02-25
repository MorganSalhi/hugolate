"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Coins, TrendingUp, Loader2 } from "lucide-react";
import { TimeInputSchema } from "@/lib/validations";
import { getPoliceRank } from "@/lib/ranks";

export default function LobbyDeParis() {
    const [course, setCourse] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [betting, setBetting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(TimeInputSchema),
    });

    // Chargement des données (Cours + Utilisateur)
    useEffect(() => {
        async function fetchData() {
            try {
                const [courseRes, userRes] = await Promise.all([
                    fetch("/api/courses/live"),
                    fetch("/api/bets") // On triche un peu : l'API de pari nous renverra l'utilisateur test par défaut
                ]);

                if (courseRes.ok) setCourse(await courseRes.json());
                // Note: On pourrait créer une API /api/me plus tard pour le profil
            } catch (e) {
                console.error("Erreur de synchronisation");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const onSubmit = async (data: any) => {
        if (!course) return;
        setBetting(true);
        try {
            const res = await fetch("/api/bets", {
                method: "POST",
                body: JSON.stringify({ ...data, courseId: course.id }),
            });

            if (res.ok) {
                const result = await res.json();
                alert(`Pari enregistré ! Nouveau solde : ${result.newBalance} ₪`);
                reset();
            } else {
                const err = await res.json();
                alert(err.error || "Erreur lors du pari");
            }
        } catch (error) {
            alert("Problème de connexion au serveur");
        } finally {
            setBetting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-24 font-sans">
            <header className="mb-8 mt-4">
                <h1 className="text-3xl font-black tracking-tighter text-indigo-500 uppercase italic">HugoLate</h1>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Unité d'Investigation • ₪</p>
            </header>

            {/* Portefeuille Dynamique */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Coins className="text-indigo-400" size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Budget disponible</p>
                        <p className="text-xl font-mono font-bold">1 000 ₪</p> {/* On dynamisera l'utilisateur après l'Auth */}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Grade</p>
                    <p className="text-indigo-400 font-bold italic text-sm">Gardien de la Paix</p>
                </div>
            </div>

            {/* Cours Réel issu de la base de données */}
            {course ? (
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">Enquête en cours</span>
                        </div>

                        <h2 className="text-2xl font-bold leading-tight">{course.subject}</h2>
                        <p className="text-indigo-300 text-sm mb-8">{course.professor} • Début : {new Date(course.scheduledStartTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Estimation de l'arrivée</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                    <input {...register("time")} type="text" placeholder="HH:mm" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-5 pl-12 pr-4 text-3xl font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-800" />
                                </div>
                                {errors.time && <p className="text-red-400 text-xs mt-2 font-medium">{errors.time.message as string}</p>}
                            </div>

                            <button disabled={betting} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase">
                                {betting ? <Loader2 className="animate-spin" /> : <TrendingUp size={20} />}
                                Mizer 100 ₪
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                    <p className="text-slate-600 font-bold uppercase text-xs tracking-widest">Aucun cours actif</p>
                    <p className="text-slate-700 text-[10px] mt-2 italic text-balance">Hugo est peut-être déjà en classe... ou encore sous sa couette.</p>
                </div>
            )}
        </div>
    );
}