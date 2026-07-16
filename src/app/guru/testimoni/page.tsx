"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Quote, Send, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";

export default function TulisTestimoniPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quote.trim().length < 10) {
      Swal.fire("Peringatan", "Testimoni terlalu singkat. Mohon tuliskan pengalaman yang lebih detail.", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/testimoni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim testimoni");

      setSubmitted(true);
      Swal.fire("Berhasil", "Terima kasih! Testimoni Anda telah tersimpan dan akan ditampilkan di Halaman Utama.", "success");
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-24 px-4 pb-10 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Testimoni Terkirim!</h2>
        <p className="text-slate-600 mb-8 max-w-md">
          Terima kasih atas kontribusi Anda. Suara Anda sangat berharga bagi perkembangan KKM-KKG Talang.
        </p>
        <Link 
          href="/guru/dashboard" 
          className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 pb-10 max-w-3xl mx-auto">
      <Link href="/guru/dashboard" className="inline-flex items-center text-slate-500 hover:text-emerald-600 mb-6 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Dashboard
      </Link>

      <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-slate-100 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
              <Quote className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">Tulis Testimoni</h1>
              <p className="text-slate-500 text-sm mt-1">Bagikan pengalaman Anda menggunakan platform KKG ini.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Pesan & Kesan Anda</label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Ceritakan bagaimana platform ini membantu Anda dalam mengajar atau berkolaborasi..."
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none text-slate-700 leading-relaxed"
                required
              />
              <div className="text-right mt-2 text-xs font-medium text-slate-400">
                {quote.length} karakter (minimal 10)
              </div>
            </div>

            {/* Preview Section */}
            {quote.length > 0 && (
              <div className="mt-8 pt-8 border-t border-dashed border-slate-200">
                <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Pratinjau Testimoni</h3>
                <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                  <Quote className="w-8 h-8 text-emerald-400/30 absolute top-6 left-6 rotate-180" />
                  <p className="text-white text-lg font-medium leading-relaxed mb-6 pt-10 px-2 italic">
                    "{quote}"
                  </p>
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                      {session?.user?.name?.substring(0, 2).toUpperCase() || "GU"}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{session?.user?.name || "Nama Anda"}</h4>
                      <p className="text-emerald-400 text-xs">Guru Madrasah</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || quote.trim().length < 10}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-8"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? "Mengirim..." : "Kirim Testimoni"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
