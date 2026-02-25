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
            const res = await fetch("/api/courses/live?all=true");
            if (res.ok) {
                const data = await res.json();
                // Si l'API renvoie un seul objet, on le met dans un tableau
                setActiveCourses(Array.isArray(data) ? data : [data]);
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
                body: JSON.stringify(data),
            });
            if (res.ok) {
                alert("Session de surveillance créée !");
                reset();
                fetchOpenCourses(); // Actualiser la liste de clôture
            }
        } catch (error) {
            alert("Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    };

    const onResolveCourse = async (courseId: string) => {
        const actualTime = actualTimes[courseId];
        if (!actualTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(actualTime)) {
            return alert("Format d'heure invalide (HH:mm requis)");
        }

        setLoading(true);
        try {
            const res = await fetch("/api/resolve", {
                method: "POST",
                body: JSON.stringify({ courseId, actualTime }),
            });
            if (res.ok) {
                alert("Verdict enregistré ! Les Shekels ont été distribués.");
                fetchOpenCourses();
            }
        } catch (error) {
            alert("Erreur lors de la résolution");
        } finally {
            setLoading(false);
        }
    };

    const handleTimeChange = (courseId: string, value: string) => {
        setActualTimes(prev => ({ ...prev, [courseId]: value }));
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 pb-32 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="text-red-500" size={32} />
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Poste de Commandement</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Accès restreint • Administrateur</p>
                    </div>
                </div>
                <button
                    onClick={fetchOpenCourses}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors"
                >
                    <RefreshCcw size={18} className={fetching ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* SECTION 1 : CRÉER UN COURS */}
                <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <PlusCircle className="text-indigo-400" size={20} />
                        <h2 className="text-lg font-bold">Ouvrir une Session de Pari</h2>
                    </div>

                    <form onSubmit={handleSubmit(onCreateCourse)} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Matière / Cours</label>
                            <input
                                {...register("subject")}
                                placeholder="Ex: Analyse Financière"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                            {errors.subject && <p className="text-red-500 text-[10px] mt-1">{errors.subject.message as string}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Professeur</label>
                                <input
                                    {...register("professor")}
                                    placeholder="Ex: M. Dupont"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                                {errors.professor && <p className="text-red-500 text-[10px] mt-1">{errors.professor.message as string}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Heure Officielle</label>
                                <input
                                    {...register("startTime")}
                                    placeholder="08:30"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                                />
                                {errors.startTime && <p className="text-red-500 text-[10px] mt-1">{errors.startTime.message as string}</p>}
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Gavel size={20} />}
                            LANCER LA SURVEILLANCE
                        </button>
                    </form>
                </section>

                {/* SECTION 2 : VALIDER UN COURS */}
                <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <CheckCircle2 className="text-green-400" size={20} />
                        <h2 className="text-lg font-bold text-white">Clôturer et Payer</h2>
                    </div>

                    {fetching ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-slate-700" size={32} />
                        </div>
                    ) : activeCourses.length > 0 ? (
                        <div className="space-y-4">
                            {activeCourses.map((course) => (
                                <div key={course.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-indigo-400">{course.subject}</h3>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                                            Prévu à {new Date(course.scheduledStartTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    <div className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Arrivée réelle d'Hugo</label>
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
                                            className="bg-green-600 hover:bg-green-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl">
                            <Clock className="mx-auto text-slate-800 mb-2" size={40} />
                            <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                                Aucune enquête en cours
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {/* Note de bas de page */}
            <div className="mt-8 text-center opacity-30">
                <p className="text-[9px] uppercase font-black tracking-[0.3em]">Justice Expéditive • HugoLate OS v1.0</p>
            </div>
        </div>
    );
}