// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // On redirige automatiquement vers le lobby
  redirect('/lobby');
}