import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@barberia.club" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        if (!user.password) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!passwordMatches) {
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
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
        (session.user as { id?: string }).id = token.id as string | undefined;
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
  // Sin fallback: NextAuth exige NEXTAUTH_SECRET en producción y lo genera
  // automáticamente en desarrollo. Nunca embeber un secreto en el repo.
  secret: process.env.NEXTAUTH_SECRET,
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
