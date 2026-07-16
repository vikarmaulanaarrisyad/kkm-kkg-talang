"use client";

import { useState, useRef } from "react";
import { MessageSquareHeart, PenTool, Loader2, Sparkles, Copy, Check } from "lucide-react";

export default function GeneratorRaportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    namaSiswa: "",
    nilaiRata: "",
    predikat: "Baik",
    kelebihan: "",
    kelemahan: "",
    gayaBahasa: "Memotivasi & Menginspirasi"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate-raport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan narasi raport");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!resultRef.current) return;
    try {
      const text = resultRef.current.innerText;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <main className="flex-grow flex flex-col w-full bg-slate-50 min-h-screen pb-20">
      
      {/* Header Section */}
      <section className="w-full bg-gradient-to-br from-indigo-50 via-white to-purple-100/50 pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-purple-200/40 blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center text-slate-800">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <MessageSquareHeart className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-indigo-600">AI Generator</span> Narasi Raport
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Susun catatan wali kelas yang personal, memotivasi, dan bermakna untuk setiap siswa dalam hitungan detik.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 w-full space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Configuration */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-600" />
                Data Profil Siswa
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Siswa / Panggilan</label>
                  <input 
                    type="text"
                    name="namaSiswa"
                    placeholder="Contoh: Ahmad, Budi, Siti..."
                    value={formData.namaSiswa} 
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nilai Rata-rata</label>
                    <input 
                      type="text"
                      name="nilaiRata"
                      placeholder="Contoh: 85"
                      value={formData.nilaiRata} 
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Predikat</label>
                    <select 
                      name="predikat" 
                      value={formData.predikat} 
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all bg-white"
                    >
                      <option value="Sangat Baik">Sangat Baik</option>
                      <option value="Baik">Baik</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Perlu Bimbingan">Perlu Bimbingan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kelebihan / Pencapaian Siswa</label>
                  <textarea 
                    name="kelebihan"
                    placeholder="Contoh: Aktif bertanya, selalu mengerjakan tugas tepat waktu, sopan kepada guru."
                    value={formData.kelebihan} 
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all bg-white resize-none text-sm"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Area yang Perlu Ditingkatkan</label>
                  <textarea 
                    name="kelemahan"
                    placeholder="Contoh: Kurang teliti dalam berhitung, sering mengobrol saat pelajaran."
                    value={formData.kelemahan} 
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all bg-white resize-none text-sm"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Gaya Bahasa Narasi</label>
                  <select 
                    name="gayaBahasa" 
                    value={formData.gayaBahasa} 
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all bg-white"
                  >
                    <option value="Memotivasi & Menginspirasi">Memotivasi & Menginspirasi</option>
                    <option value="Formal & Profesional">Formal & Profesional</option>
                    <option value="Hangat & Penuh Empati">Hangat & Penuh Empati</option>
                    <option value="Fokus pada Akademik">Fokus pada Akademik</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 shadow-sm hover:shadow-md"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {loading ? "Merangkai Kata..." : "Generate Narasi"}
                </button>
              </form>
            </div>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 min-h-[500px] flex flex-col">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Hasil Catatan Wali Kelas</h2>
                
                {result && (
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm text-sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-indigo-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Tersalin!" : "Copy Teks"}
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
                  <MessageSquareHeart className="w-20 h-20 mb-6 opacity-20" />
                  <p className="text-center px-4 font-medium text-slate-500">
                    Silakan isi profil dan evaluasi siswa di samping, lalu klik <strong className="text-indigo-600">"Generate Narasi"</strong><br/>untuk mendapatkan kalimat deskripsi raport secara otomatis.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20 space-y-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="font-bold animate-pulse text-indigo-600 text-lg">AI sedang merangkai kata-kata terbaik...</p>
                </div>
              )}

              {result && (
                <div className="flex-1 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
                 <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 relative" ref={resultRef}>
                  
                  {/* Styling Hasil HTML AI */}
                  <div 
                    className="prose prose-slate max-w-none 
                               prose-p:text-slate-700 prose-p:my-3 prose-p:font-medium prose-p:leading-relaxed prose-p:text-lg
                               prose-strong:text-indigo-900"
                    dangerouslySetInnerHTML={{ __html: result }}
                  />
                  
                 </div>
                 
                 <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-sm">
                   <strong>💡 Tips:</strong> Anda dapat mengklik tombol <strong>"Copy Teks"</strong> di atas dan langsung menempelkannya (Paste) ke aplikasi e-Raport, ARD, atau dokumen raport Anda.
                 </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
