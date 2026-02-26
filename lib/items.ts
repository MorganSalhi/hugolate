// lib/items.ts
import { Shield, Search, Gavel } from "lucide-react";

export const SHOP_ITEMS = {
  VEST: {
    id: "VEST",
    name: "Gilet Pare-Balles",
    description: "Réduit vos pertes de 50% si votre pari est mauvais.",
    price: 500,
    icon: Shield,
    color: "text-blue-400",
  },
  MAGNIFIER: {
    id: "MAGNIFIER",
    name: "Loupe de Précision",
    description: "Permet de voir l'estimation moyenne des autres agents sur un cours.",
    price: 300,
    icon: Search,
    color: "text-amber-400",
  },
  WARRANT: {
    id: "WARRANT",
    name: "Mandat d'Arrêt",
    description: "Double vos gains... mais double aussi vos pertes !",
    price: 1000,
    icon: Gavel,
    color: "text-red-500",
  },
};

export type ItemType = keyof typeof SHOP_ITEMS;