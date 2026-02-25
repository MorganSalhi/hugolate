"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCourseSchema } from "@/lib/validations";
import {
    ShieldAlert,
    PlusCircle,
    CheckCircle2,
    Clock,
    Loader2,
    Gavel,
    RefreshCcw
} from "lucide-react";

export default function AdminPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [activeCourses, setActiveCourses] = useState<any[]>([]);
    const [actualTimes, setActualTimes] = useState<{ [key: string]: string }>({});

    // Formulaire pour créer un cours
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(CreateCourseSchema),
    });

    // Récupérer les cours ouverts pour la résolution
    const fetchOpenCourses = async () => {
        setFetching(true);
        try {
            // On demande tous les cours ouverts
            const res = await fetch("/api/courses/live?all=true");
            if (res.ok) {
                const data = await res.json();
                // On s'assure d'avoir un tableau pour le .map
                setActiveCourses(Array.isArray(data) ? data : data.id ? [data] : []);
            } else {
                setActiveCourses([]);
            }
        } catch (error) {
            console.error("Erreur de récupération des cours");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchOpenCourses();
    }, []);

    const onCreateCourse = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                alert("Session de surveillance créée ! Les paris sont ouverts.");
                reset();
                fetchOpenCourses();
            }
        } catch (error) {
            alert("Erreur lors de la création du cours");
        } finally {
            setLoading(false);
        }
    };

    const onResolveCourse = async (courseId: string) => {
        const actualTime = actualTimes[courseId];
        // Validation simple du format HH:mm avant envoi
        if (!actualTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(actualTime)) {
            return alert("Format d'heure invalide (HH:mm requis)");
        }

        setLoading(true);
        try {
            const res = await fetch("/api/resolve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId, actualTime }),
            });
            if (res.ok) {
                alert("Verdict enregistré ! Les Shekels ont été distribués aux agents.");
                fetchOpenCourses();
            }
        } catch (error) {
            alert("Erreur lors de la distribution des gains");
        } finally {
            setLoading(false);
        }
    };

    const handleTimeChange = (courseId: string, value: string) => {
        setActualTimes(prev => ({ ...prev, [courseId]: value }));
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 pb-32 text-slate-100">
            {/* Header Poste de Commandement */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="text-red-500" size={32} />
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter italic">Poste de Commandement</h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Zone d'administration sécurisée</p>
                    </div>
                </div>
                <button
                    onClick={fetchOpenCourses}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-all active:rotate-180"
                >
                    <RefreshCcw size={18} className={fetching ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* SECTION 1 : CRÉATION */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <PlusCircle className="text-indigo-400" size={20} />
                        <h2 className="text-lg font-bold">Nouvelle Surveillance</h2>
                    </div>

                    <form onSubmit={handleSubmit(onCreateCourse)} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Matière</label>
                            <input
                                {...register("subject")}
                                placeholder="Ex: Finance de Marché"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                            {errors.subject && <p className="text-red-500 text-[10px] mt-1 italic">{errors.subject.message as string}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Professeur</label>
                                <input
                                    {...register("professor")}
                                    placeholder="Ex: M. Cohen"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                                {errors.professor && <p className="text-red-500 text-[10px] mt-1 italic">{errors.professor.message as string}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Début Officiel</label>
                                <input
                                    {...register("startTime")}
                                    placeholder="08:30"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                                />
                                {errors.startTime && <p className="text-red-500 text-[10px] mt-1 italic">{errors.startTime.message as string}</p>}
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Gavel size={20} />}
                            OUVRIR LE DOSSIER
                        </button>
                    </form>
                </section>

                {/* SECTION 2 : RÉSOLUTION */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                    <div className="flex items-center gap-2 mb-6 text-green-400">
                        <CheckCircle2 size={20} />
                        <h2 className="text-lg font-bold">Verdict HugoLate</h2>
                    </div>

                    {fetching ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-slate-700" size={32} />
                        </div>
                    ) : activeCourses.length > 0 ? (
                        <div className="space-y-4">
                            {activeCourses.map((course) => (
                                <div key={course.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 group hover:border-indigo-500/50 transition-all">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-indigo-400">{course.subject}</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">
                                            Prévu à {new Date(course.scheduledStartTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    <div className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Heure d'arrivée Hugo</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="08:42"
                                                    value={actualTimes[course.id] || ""}
                                                    onChange={(e) => handleTimeChange(course.id, e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 outline-none focus:ring-1 focus:ring-green-500 font-mono text-sm"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onResolveCourse(course.id)}
                                            disabled={loading}
                                            className="bg-green-600 hover:bg-green-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-green-900/20"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl opacity-20">
                            <Clock className="mx-auto mb-2" size={40} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Aucune surveillance active</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}