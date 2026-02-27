"use client";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Crosshair } from 'lucide-react';

export default function ProfileStats({ bets }: { bets: any[] }) {
  // 1. Préparation des données pour la "Courbe de Fortune" (Profit par mission)
  const fortuneData = bets
    .filter(b => b.course.status === "FINISHED")
    .reverse()
    .map((b, index) => ({
      name: `Mission ${index + 1}`,
      profit: b.pointsEarned - b.amount
    }));

  // 2. Préparation des données pour le "Radar de Précision"
  // On regarde si l'agent parie trop tôt ou trop tard
  let tooEarly = 0;
  let tooLate = 0;
  let perfect = 0;

  bets.filter(b => b.course.status === "FINISHED").forEach(b => {
    const actual = new Date(b.course.actualArrivalTime);
    const guessed = new Date(b.guessedTime);
    const diff = (guessed.getTime() - actual.getTime()) / 60000; // diff en minutes

    if (Math.abs(diff) <= 2) perfect++;
    else if (diff < 0) tooEarly++;
    else tooLate++;
  });

  const radarData = [
    { subject: 'Trop Tôt', A: tooEarly, fullMark: bets.length },
    { subject: 'Précis', A: perfect, fullMark: bets.length },
    { subject: 'Trop Tard', A: tooLate, fullMark: bets.length },
  ];

  // 3. Taux de Succès
  const successCount = bets.filter(b => b.pointsEarned > b.amount).length;
  const failCount = bets.length - successCount;
  const pieData = [
    { name: 'Succès', value: successCount },
    { name: 'Échecs', value: failCount },
  ];
  const COLORS = ['#6366f1', '#1e293b'];

  return (
    <div className="space-y-8 mt-10">
      {/* Graphique de Fortune */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-indigo-500" size={18} />
          <h3 className="text-xs font-black uppercase tracking-widest">Évolution des Profits</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fortuneData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" hide />
              <YAxis stroke="#475569" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar de Précision */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Crosshair className="text-indigo-500" size={18} />
            <h3 className="text-xs font-black uppercase tracking-widest">Radar de Profiling</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                <Radar name="Agent" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Taux de Succès */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-center">
            <div className="flex items-center gap-2 mb-6 text-left">
                <PieIcon className="text-indigo-500" size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Verdict des Missions</h3>
            </div>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <p className="text-2xl font-black text-white mt-2">
                {Math.round((successCount / bets.length) * 100) || 0}%
            </p>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Taux de Réussite</p>
        </div>
      </div>
    </div>
  );
}