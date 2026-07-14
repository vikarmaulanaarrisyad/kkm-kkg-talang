import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getOrCreateGoogleSheet } from "./google-sheets";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin KKM",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan Password harus diisi");
        }

        try {
          const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
          if (!spreadsheetId) {
            throw new Error("Konfigurasi Google Spreadsheet tidak valid");
          }

          // Hubungkan ke sheet "Users"
          const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Users");
          const rows = await sheet.getRows();

          // Cari user berdasarkan username
          const userRow = rows.find(row => row.get("username") === credentials.username);

          if (!userRow) {
            throw new Error("Username atau password salah");
          }

          const storedHash = userRow.get("password_hash");
          const isPasswordValid = await bcrypt.compare(credentials.password, storedHash);

          if (!isPasswordValid) {
            throw new Error("Username atau password salah");
          }

          // Return user object untuk NextAuth
          return {
            id: userRow.get("id") || userRow.rowNumber.toString(),
            name: userRow.get("name") || credentials.username,
            email: userRow.get("username"), // pakai username sebagai email placeholder
            role: userRow.get("role") || "admin",
          };
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
