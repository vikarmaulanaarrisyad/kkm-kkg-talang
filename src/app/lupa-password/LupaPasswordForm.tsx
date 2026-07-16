"use client";

import { useState } from "react";
import Link from "next/link";
import { User, MessageCircle, AlertCircle } from "lucide-react";

export default function LupaPasswordForm({ adminPhone }: { adminPhone: string }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    // Bersihkan nomor telepon dari karakter non-numerik, kecuali '+'
    let phone = adminPhone.replace(/[^\d+]/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    
    // Pesan template WhatsApp
    const message = `Halo Admin KKM/KKG, saya mengalami kendala login dan ingin mereset password saya. 

*Username / Identitas saya:* ${username}

Mohon bantuannya untuk mereset akun tersebut. Terima kasih.`;
    
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    // Buka WhatsApp di tab baru
    window.open(waUrl, '_blank');
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      
      <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm font-medium flex gap-3 border border-amber-100">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Karena alasan keamanan, pengaturan ulang sandi harus melalui verifikasi Admin KKM/KKG. Masukkan username Anda untuk menghubungi Admin via WhatsApp.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-bold text-slate-700">
            Username / PegID / NUPTK
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
              <User className="h-5 w-5" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-300"
              placeholder="Masukkan identitas login Anda"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!username.trim()}
          className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Hubungi Admin (WhatsApp)
        </button>
      </div>

      <div className="mt-8 text-center pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-500 font-medium">
          Teringat password Anda?{" "}
          <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-bold underline decoration-2 underline-offset-4 transition-colors">
            Kembali ke Login
          </Link>
        </p>
      </div>
    </form>
  );
}
