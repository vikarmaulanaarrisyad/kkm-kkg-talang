"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

interface KontakInfo {
  alamat: string;
  email: string;
  telepon: string;
}

export default function KontakClient({ kontakInfo }: { kontakInfo: KontakInfo }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    subjek: "",
    pesan: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/kontak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Gagal mengirim pesan");
      Swal.fire("Berhasil! 🎉", "Pesan Anda telah berhasil dikirim. Terima kasih telah menghubungi kami!", "success");
      setFormData({ nama: "", email: "", subjek: "", pesan: "" });
    } catch (error: any) {
      Swal.fire("Error", error.message || "Terjadi kesalahan saat mengirim pesan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col w-full bg-slate-50 min-h-screen pb-20">
      {/* Header Section (Light Gradient) */}
      <section className="w-full bg-gradient-to-br from-emerald-50 via-white to-emerald-100/50 pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="max-w-4xl mx-auto relative z-10 text-center text-slate-800">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-emerald-600">Hubungi</span> Kami
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Apakah Anda memiliki pertanyaan, saran, atau masukan? Jangan ragu untuk menghubungi kami.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 relative z-20 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Contact Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
            <h3 className="text-xl font-bold text-slate-800">Informasi Kontak</h3>

            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Alamat Sekretariat</h4>
                <p className="text-slate-600 text-sm mt-1 whitespace-pre-line">{kontakInfo.alamat}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Email</h4>
                <a href={`mailto:${kontakInfo.email}`} className="text-emerald-600 text-sm mt-1 hover:underline">
                  {kontakInfo.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Telepon / WhatsApp</h4>
                <a href={`https://wa.me/${kontakInfo.telepon.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm mt-1 hover:underline">
                  {kontakInfo.telepon}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Kirim Pesan</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="nama" className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                  <input id="nama" name="nama" type="text" required value={formData.nama} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50"
                    placeholder="Masukkan nama Anda" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700">Alamat Email</label>
                  <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50"
                    placeholder="nama@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subjek" className="text-sm font-semibold text-slate-700">Subjek</label>
                <input id="subjek" name="subjek" type="text" required value={formData.subjek} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50"
                  placeholder="Subjek pesan Anda" />
              </div>
              <div className="space-y-2">
                <label htmlFor="pesan" className="text-sm font-semibold text-slate-700">Pesan</label>
                <textarea id="pesan" name="pesan" rows={5} required value={formData.pesan} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 resize-none"
                  placeholder="Tuliskan pesan Anda di sini..." />
              </div>
              <button type="submit" disabled={loading}
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Mengirim...</>
                ) : (
                  <><Send className="w-5 h-5" />Kirim Pesan</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
