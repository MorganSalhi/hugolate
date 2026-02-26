"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCourseSchema, CreateUserSchema } from "@/lib/validations";
import {
    ShieldAlert,
    PlusCircle,
    CheckCircle2,
    Clock,
    Loader2,
    Gavel,
    RefreshCcw,
    Users,
    UserPlus,
    HandCoins,
    BookOpen
} from "lucide-react";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<"courses" | "users">("courses");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    
    // États pour les cours
    const [activeCourses, setActiveCourses] = useState<any[]>([]);
    const [actualTimes, setActualTimes] = useState<{ [key: string]: string }>({});

    // États pour les utilisateurs
    const [agents, setAgents] = useState<any[]>([]);
    const [creditAmounts, setCreditAmounts] = useState<{ [key: string]: number }>({});

    // Formulaires
    const courseForm = useForm({ resolver: zodResolver(CreateCourseSchema) });
    const userForm = useForm({ resolver: zodResolver(CreateUserSchema) });

    const fetchData = async () => {
        setFetching(true);
        try {
            const [coursesRes, usersRes] = await Promise.all([
                fetch("/api/courses/live?all=true"),
                fetch("/api/admin/users")
            ]);
            
            if (coursesRes.ok) {
                const data = await coursesRes.json();
                setActiveCourses(Array.isArray(data) ? data : data.id ? [data] : []);
            }
            if (usersRes.ok) setAgents(await usersRes.json());
        } catch (error) {
            console.error("Erreur de synchro");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // LOGIQUE COURS
    const onCreateCourse = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                alert("Dossier ouvert !");
                courseForm.reset();
                fetchData();
            }
        } finally { setLoading(false); }
    };

    const onResolveCourse = async (courseId: string) => {
        const actualTime = actualTimes[courseId];
        if (!actualTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(actualTime)) return alert("Format HH:mm requis");
        setLoading(true);
        try {
            const res = await fetch("/api/resolve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId, actualTime }),
            });
            if (res.ok) { alert("Verdict rendu !"); fetchData(); }
        } finally { setLoading(false); }
    };

    // LOGIQUE AGENTS
    const onCreateUser = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                alert("Nouvel agent recruté !");
                userForm.reset();
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } finally { setLoading(false); }
    };

    const onInjectMoney = async (userId: string) => {
        const amount = creditAmounts[userId];
        if (!amount || amount <= 0) return alert("Somme invalide");
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, amount }),
            });
            if (res.ok) {
                alert("Shekels injectés !");
                setCreditAmounts(prev => ({ ...prev, [userId]: 0 }));
                fetchData();
            }
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 pb-32 text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="text-red-500" size={32} />
                    <div>
                        <h1 className="text-2xl font-black uppercase italic">Commissariat HugoLate</h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Poste de Commandement Central</p>
                    </div>
                </div>

                {/* Sélecteur d'onglets */}
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button 
                        onClick={() => setActiveTab("courses")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "courses" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <BookOpen size={14} /> DOSSIERS
                    </button>
                    <button 
                        onClick={() => setActiveTab("users")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "users" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <Users size={14} /> AGENTS
                    </button>
                </div>
            </div>

            {activeTab === "courses" ? (
                /* INTERFACE GESTION DES COURS (Ton code existant optimisé) */
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Formulaire Création Cours */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                        <div className="flex items-center gap-2 mb-6 text-indigo-400">
                            <PlusCircle size={20} />
                            <h2 className="text-lg font-bold">Nouvelle Surveillance</h2>
                        </div>
                        <form onSubmit={courseForm.handleSubmit(onCreateCourse)} className="space-y-5">
                            <input {...courseForm.register("subject")} placeholder="Matière" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            <div className="grid grid-cols-2 gap-4">
                                <input {...courseForm.register("professor")} placeholder="Professeur" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                <input {...courseForm.register("startTime")} placeholder="HH:mm" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono" />
                            </div>
                            <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" /> : <Gavel size={20} />} OUVRIR LE DOSSIER
                            </button>
                        </form>
                    </section>

                    {/* Liste Résolution */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                        <div className="flex items-center gap-2 mb-6 text-green-400">
                            <CheckCircle2 size={20} />
                            <h2 className="text-lg font-bold">Verdict HugoLate</h2>
                        </div>
                        {activeCourses.length > 0 ? (
                            <div className="space-y-4">
                                {activeCourses.map((course) => (
                                    <div key={course.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                                        <h3 className="font-bold text-indigo-400 mb-4">{course.subject}</h3>
                                        <div className="flex items-end gap-3">
                                            <input 
                                                type="text" placeholder="HH:mm"
                                                value={actualTimes[course.id] || ""}
                                                onChange={(e) => setActualTimes(prev => ({...prev, [course.id]: e.target.value}))}
                                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 outline-none font-mono"
                                            />
                                            <button onClick={() => onResolveCourse(course.id)} className="bg-green-600 p-2.5 rounded-xl"><CheckCircle2 size={20} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-center py-10 text-slate-600 italic">Rien à signaler, officier.</p>}
                    </section>
                </div>
            ) : (
                /* INTERFACE GESTION DES AGENTS */
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Formulaire Recrutement */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                        <div className="flex items-center gap-2 mb-6 text-indigo-400">
                            <UserPlus size={20} />
                            <h2 className="text-lg font-bold">Recruter un Agent</h2>
                        </div>
                        <form onSubmit={userForm.handleSubmit(onCreateUser)} className="space-y-5">
                            <input {...userForm.register("name")} placeholder="Nom de l'agent" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            <input {...userForm.register("email")} placeholder="Email (Identifiant)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            <input {...userForm.register("initialBalance")} type="number" placeholder="Budget initial (₪)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />} ENRÔLER L'AGENT
                            </button>
                        </form>
                    </section>

                    {/* Liste des Agents & Injection */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                        <div className="flex items-center gap-2 mb-6 text-amber-400">
                            <HandCoins size={20} />
                            <h2 className="text-lg font-bold">Effectifs & Budget</h2>
                        </div>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {agents.map((agent) => (
                                <div key={agent.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">{agent.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase">{agent.email}</p>
                                        </div>
                                        <p className="font-mono text-amber-400 font-bold">{agent.walletBalance} ₪</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" placeholder="+ ₪"
                                            value={creditAmounts[agent.id] || ""}
                                            onChange={(e) => setCreditAmounts(prev => ({...prev, [agent.id]: parseInt(e.target.value)}))}
                                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-sm outline-none font-mono"
                                        />
                                        <button onClick={() => onInjectMoney(agent.id)} className="bg-amber-600 hover:bg-amber-500 p-2 rounded-xl transition-all">
                                            <HandCoins size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}