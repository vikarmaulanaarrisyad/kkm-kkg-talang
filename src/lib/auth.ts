import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getOrCreateGoogleSheet } from "./google-sheets";

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
          const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
          if (!spreadsheetId) {
            throw new Error("Konfigurasi Google Spreadsheet tidak valid");
          }

          // 1. Cek tabel Admin (Users)
          const adminSheet = await getOrCreateGoogleSheet(spreadsheetId, "Users");
          const adminRows = await adminSheet.getRows();
          const adminRow = adminRows.find(row => row.get("username") === credentials.username);

          if (adminRow) {
            const storedHash = adminRow.get("password_hash");
            const isPasswordValid = await bcrypt.compare(credentials.password, storedHash);
            if (!isPasswordValid) throw new Error("Username atau password salah");

            return {
              id: adminRow.get("id") || adminRow.rowNumber.toString(),
              name: adminRow.get("name") || credentials.username,
              email: adminRow.get("username"),
              role: "admin",
              madrasahId: null,
            };
          }

          // 2. Cek tabel Madrasah
          const madrasahSheet = await getOrCreateGoogleSheet(spreadsheetId, "Madrasah", [
            "id", "nama", "nsm", "npsn", "alamat", "kecamatan", "username", "password_hash", "created_at"
          ]);
          const madrasahRows = await madrasahSheet.getRows();
          const madrasahRow = madrasahRows.find(row => row.get("username") === credentials.username);

          if (madrasahRow) {
            const storedHash = madrasahRow.get("password_hash");
            const isPasswordValid = await bcrypt.compare(credentials.password, storedHash);
            if (!isPasswordValid) throw new Error("Username atau password salah");

            const status = madrasahRow.get("status") || "active";
            if (status === "pending") {
              throw new Error("Akun Anda sedang menunggu aktivasi dari Admin KKM & KKG. Silakan coba lagi nanti.");
            }
            if (status === "rejected") {
              throw new Error("Pendaftaran Anda ditolak. Hubungi Admin KKM & KKG untuk informasi lebih lanjut.");
            }

            return {
              id: madrasahRow.get("id"),
              name: madrasahRow.get("nama"),
              email: madrasahRow.get("username"),
              role: "madrasah",
              madrasahId: madrasahRow.get("id"),
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
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
