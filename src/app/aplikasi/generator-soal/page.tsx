"use client";

import { useState, useRef } from "react";
import { Bot, FileText, Download, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function GeneratorSoalPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    kelas: "1",
    mapel: "",
    topik: "",
    jumlahSoal: "10",
    kesulitan: "Sedang",
    jenisSoal: "Pilihan Ganda"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate-soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan soal");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    if (typeof window !== "undefined" && resultRef.current) {
      // Import html2pdf dynamically to avoid SSR issues
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt: any = {
        margin:       15,
        filename:     `Soal_${formData.mapel}_Kelas_${formData.kelas}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(resultRef.current).save();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl">
              <Bot className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                AI Generator Soal MI
              </h1>
              <p className="text-slate-500 mt-1">
                Buat soal ujian secara otomatis dan instan untuk siswa Madrasah Ibtidaiyah.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Configuration */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Konfigurasi Soal
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kelas</label>
                  <select 
                    name="kelas" 
                    value={formData.kelas} 
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                  >
                    {[1,2,3,4,5,6].map(k => (
                      <option key={k} value={k}>Kelas {k} MI</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input 
                    type="text" 
                    name="mapel"
                    placeholder="Contoh: Akidah Akhlak, Matematika..."
                    value={formData.mapel} 
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Topik / Materi Pokok</label>
                  <input 
                    type="text" 
                    name="topik"
                    placeholder="Contoh: Sifat Wajib Allah, Penjumlahan Pecahan..."
                    value={formData.topik} 
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Jumlah</label>
                    <select 
                      name="jumlahSoal" 
                      value={formData.jumlahSoal} 
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                    >
                      <option value="5">5 Soal</option>
                      <option value="10">10 Soal</option>
                      <option value="15">15 Soal</option>
                      <option value="20">20 Soal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Kesulitan</label>
                    <select 
                      name="kesulitan" 
                      value={formData.kesulitan} 
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                    >
                      <option value="Mudah">Mudah</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Sulit">Sulit</option>
                      <option value="HOTS">HOTS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Soal</label>
                  <select 
                    name="jenisSoal" 
                    value={formData.jenisSoal} 
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                  >
                    <option value="Pilihan Ganda">Pilihan Ganda</option>
                    <option value="Isian Singkat">Isian Singkat</option>
                    <option value="Uraian">Uraian / Esai</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {loading ? "Menyusun Soal..." : "Generate Soal AI"}
                </button>
              </form>
            </div>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 min-h-[500px] flex flex-col">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Hasil Generate</h2>
                
                {result && (
                  <button 
                    onClick={exportPDF}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Cetak PDF
                  </button>
                )}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                  <p className="font-semibold">Terjadi Kesalahan</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}

              {!result && !loading && !error && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                  <Bot className="w-16 h-16 mb-4 opacity-50" />
                  <p>Silakan isi form di samping dan klik "Generate Soal AI"</p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12 space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="font-medium animate-pulse text-emerald-600">AI sedang merangkai soal untuk Anda...</p>
                </div>
              )}

              {result && (
                <div className="flex-1 bg-white relative">
                  <div 
                    ref={resultRef}
                    className="prose prose-slate max-w-none prose-h3:text-slate-800 prose-ol:text-slate-700 prose-li:my-1 prose-hr:my-8 px-2"
                    dangerouslySetInnerHTML={{ __html: result }}
                  />
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
