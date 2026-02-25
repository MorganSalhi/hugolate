"use client"; // <--- ABSOLUMENT NÉCESSAIRE ICI

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, GraduationCap, Coins, TrendingUp } from "lucide-react";
import { TimeInputSchema } from "@/lib/validations";

export default function LobbyDeParis() {
  // Initialisation du formulaire avec validation Zod
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(TimeInputSchema),
  });

  const onSubmit = async (data: any) => {
    console.log("Données envoyées :", data);
    alert("Pari enregistré ! Hugo est peut-être déjà en retard.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-20 font-sans">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-black tracking-tighter text-indigo-500 uppercase">HugoLate</h1>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
          L'art de prédire l'imprévisible.
        </p>
      </header>

      {/* Portefeuille */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Coins className="text-amber-500" size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Mon Solde</p>
            <p className="text-xl font-mono font-bold">1 250 ₪</p>
          </div>
        </div>
        <div className="h-10 w-[1px] bg-slate-800"></div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Rang</p>
          <p className="text-indigo-400 font-bold italic text-sm">L'Oracle</p>
        </div>
      </div>

      {/* Cours Actif */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden shadow-indigo-900/10 shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <GraduationCap size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">Paris Ouverts</span>
          </div>

          <h2 className="text-2xl font-bold leading-tight">Micro-Économie Appliquée</h2>
          <p className="text-indigo-300 text-sm mb-8">Prof. Fontaine • Début : 08:30</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                Estimation de l'arrivée d'Hugo
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  {...register("time")}
                  type="text"
                  placeholder="08:42"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-5 pl-12 pr-4 text-3xl font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-800"
                />
              </div>
              {errors.time && <p className="text-red-400 text-xs mt-2 font-medium">{errors.time.message as string}</p>}
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <TrendingUp size={20} />
              MIZER 100 ₪
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}