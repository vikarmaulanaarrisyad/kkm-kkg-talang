import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-grow flex items-center justify-center bg-madrasah-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-madrasah-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-madrasah-900">
            Login KKM & KKG
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Silakan masukkan kredensial Anda untuk mengakses sistem
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-gray-500 mt-4">
          Belum terdaftar?{" "}
          <a href="/daftar" className="font-bold text-madrasah-700 hover:underline">Daftarkan Madrasah Anda</a>
        </p>
      </div>
    </div>
  );
}
