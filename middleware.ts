import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cette fonction est obligatoire et doit être exportée
export function middleware(request: NextRequest) {
  // Par défaut, on laisse passer la requête
  return NextResponse.next();
}

// Optionnel : vous pouvez définir les routes concernées ici
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};