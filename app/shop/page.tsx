// app/shop/page.tsx
"use client";

import { useState } from "react";
import { SHOP_ITEMS, ItemType } from "@/lib/items";
import { ShoppingBag, Loader2 } from "lucide-react";

export default function ShopPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const buyItem = async (itemType: ItemType) => {
    setLoading(itemType);
    const res = await fetch("/api/shop/buy", {
      method: "POST",
      body: JSON.stringify({ itemType }),
    });

    if (res.ok) {
      alert("Équipement ajouté à votre arsenal !");
    } else {
      const err = await res.json();
      alert(err.error);
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2 text-indigo-500">
          <ShoppingBag size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Armurerie de la Brigade</span>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter">L'ARSENAL</h1>
        <p className="text-slate-500 text-sm">Équipez-vous pour vos prochaines enquêtes.</p>
      </header>

      <div className="grid gap-6">
        {(Object.values(SHOP_ITEMS)).map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 ${item.color}`}>
                  <Icon size={24} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-black">{item.price} ₪</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </div>

              <button 
                onClick={() => buyItem(item.id as ItemType)}
                disabled={!!loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                {loading === item.id ? <Loader2 className="animate-spin" /> : "ACQUÉRIR"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}