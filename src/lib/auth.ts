import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "KKM & KKG",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan Password harus diisi");
        }

        try {
          // 1. Cek tabel Admin (Users)
          const admin = await prisma.user.findUnique({
            where: { username: credentials.username }
          });

          if (admin) {
            const isPasswordValid = await bcrypt.compare(credentials.password, admin.password_hash);
            if (!isPasswordValid) throw new Error("Username atau password salah");

            return {
              id: admin.id,
              name: admin.name || credentials.username,
              email: admin.username,
              role: admin.role,
              madrasahId: null,
            };
          }

          // 2. Cek tabel Madrasah
          const madrasah = await prisma.madrasah.findUnique({
            where: { username: credentials.username }
          });

          if (madrasah) {
            const isPasswordValid = await bcrypt.compare(credentials.password, madrasah.password_hash);
            if (!isPasswordValid) throw new Error("Username atau password salah");

            if (madrasah.status === "pending") {
              throw new Error("Akun Anda sedang menunggu aktivasi dari Admin KKM & KKG. Silakan coba lagi nanti.");
            }
            if (madrasah.status === "rejected") {
              throw new Error("Pendaftaran Anda ditolak. Hubungi Admin KKM & KKG untuk informasi lebih lanjut.");
            }

            return {
              id: madrasah.id,
              name: madrasah.nama,
              email: madrasah.username,
              role: "madrasah",
              madrasahId: madrasah.id,
            };
          }

          // 3. Cek tabel Guru (Login untuk E-Presensi)
          // Guru bisa login menggunakan NIP, PEG_ID, atau NUPTK
          const guru = await prisma.guru.findFirst({
            where: {
              OR: [
                { nip: credentials.username },
                { peg_id: credentials.username },
                { nuptk: credentials.username }
              ]
            }
          });

          if (guru) {
            let isValid = false;
            
            if (guru.password_hash) {
              isValid = await bcrypt.compare(credentials.password, guru.password_hash);
            } else {
              // Jika belum ada password_hash, gunakan default '123456'
              isValid = credentials.password === "123456";
            }

            if (!isValid) throw new Error("Username atau password salah");

            return {
              id: guru.id,
              name: guru.nama,
              email: credentials.username, // Using identifier as email for session
              role: "guru",
              madrasahId: guru.madrasah_id,
            };
          }

          throw new Error("Username atau password salah");
        } catch (error: any) {
          console.error("Auth error:", error.message);
          throw new Error(error.message || "Terjadi kesalahan saat login");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.madrasahId = (user as any).madrasahId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).madrasahId = token.madrasahId;
        (session.user as any).id = token.sub; // Inject user ID
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
