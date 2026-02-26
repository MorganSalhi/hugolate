export { default } from "next-auth/middleware";

export const config = { 
  // On protège toutes les routes sauf le login et les fichiers statiques
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};