import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@barberia.club" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        // For MVP, simple plain text comparison as set in seed. 
        // In production, use bcrypt: await bcrypt.compare(credentials.password, user.password)
        if (user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Custom login page later
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-barberia-club-key",
};

/**
 * Devuelve la sesión actual del servidor, memoizada durante el render
 * para evitar consultas duplicadas en una misma petición.
 */
export const getSession = cache(() => getServerSession(authOptions));

/**
 * Exige una sesión autenticada con rol ADMIN.
 * Redirige a /login si no hay sesión y a /admin si el rol no es ADMIN.
 * Úsala para proteger el panel God Mode (/godmode).
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if ((session.user as { role?: string } | undefined)?.role !== "ADMIN") {
    redirect("/admin");
  }
  return session;
}
