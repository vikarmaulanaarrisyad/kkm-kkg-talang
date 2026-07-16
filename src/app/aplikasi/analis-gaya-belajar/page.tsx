"use client";

import { useState, useRef } from "react";
import { Brain, UserCheck, Loader2, Sparkles, Copy, Check, Printer, FileDown } from "lucide-react";

export default function AnalisGayaBelajarPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    umur: "Kelas 1-3 MI (Usia 7-9 Tahun)",
    mapelFavorit: "",
    deskripsi: ""
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
      const res = await fetch("/api/generate-gaya-belajar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan analisis gaya belajar");
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

  const copyPrompt = async () => {
    const prompt = `Anda adalah seorang ahli Psikologi Pendidikan dan Psikolog Anak berpengalaman untuk siswa tingkat Madrasah Ibtidaiyah (MI) / Sekolah Dasar.
Tugas Anda adalah menganalisis gaya belajar (Learning Style) seorang siswa berdasarkan observasi kebiasaan dan perilakunya di kelas.

Data Observasi Siswa:
- Kelas / Rentang Usia: ${formData.umur}
- Pelajaran / Aktivitas yang Disukai: ${formData.mapelFavorit || 'Tidak disebutkan'}
- Deskripsi Kebiasaan & Perilaku: "${formData.deskripsi}"

Berikan analisis komprehensif dengan struktur berikut:
1. Diagnosis Gaya Belajar Utama (Sebutkan apakah Visual, Auditori, Kinestetik, atau kombinasinya, dan persentasenya jika memungkinkan).
2. Penjelasan Psikologis (Mengapa Anda menyimpulkan gaya belajar tersebut dari perilaku di atas).
3. 5 Strategi Mengajar Praktis (Langkah konkret yang bisa dilakukan guru di kelas untuk memfasilitasi anak ini agar lebih fokus dan paham).
4. Pendekatan Komunikasi (Cara berbicara atau menegur anak ini agar merasa dihargai dan tidak tantrum/bosan).

Aturan:
1. Format hasil menggunakan elemen HTML standar (<br>, <h3>, <h4>, <ul>, <ol>, <li>, <strong>, <p>, <table>) tanpa membungkus dengan backtick markdown (\`\`\`html).
2. Gunakan gaya bahasa yang empatik, profesional, mudah dipahami, dan memberikan semangat kepada guru (rekan sejawat).
3. Jangan berikan kalimat pengantar, langsung berikan output HTML-nya.`;

    try {
      await navigator.clipboard.writeText(prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt', err);
    }
  };

  const exportWord = () => {
    if (!resultRef.current) return;
    const content = resultRef.current.innerHTML;
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Analisis Gaya Belajar</title>
    </head><body>${content}</body></html>`;
    
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Analisis_Gaya_Belajar.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <main className="flex-grow flex flex-col w-full bg-slate-50 min-h-screen pb-20 print:bg-white print:pb-0">
      
      {/* Header Section */}
      <section className="w-full bg-gradient-to-br from-teal-50 via-white to-emerald-100/50 pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-emerald-200/40 blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center text-slate-800">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Brain className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-teal-600">Analis</span> Gaya Belajar
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Deteksi kecenderungan gaya belajar siswa (Visual, Auditori, Kinestetik) dan dapatkan strategi mengajar yang paling efektif.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 w-full space-y-8 print:space-y-0 print:mt-0 print:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
          
          {/* Form Configuration */}
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                Data Observasi Siswa
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kelas / Usia</label>
                  <select 
                    name="umur" 
                    value={formData.umur} 
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-teal-500 focus:ring-teal-500 outline-none transition-all bg-white"
                  >
                    <option value="Kelas 1-3 MI (Usia 7-9 Tahun)">Kelas 1-3 MI (Usia 7-9 Tahun)</option>
                    <option value="Kelas 4-6 MI (Usia 10-12 Tahun)">Kelas 4-6 MI (Usia 10-12 Tahun)</option>
                    <option value="PAUD / RA (Usia 4-6 Tahun)">PAUD / RA (Usia 4-6 Tahun)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kegiatan / Pelajaran Favorit</label>
                  <textarea 
                    name="mapelFavorit"
                    placeholder="Contoh: Menggambar, Olahraga, Bercerita..."
                    value={formData.mapelFavorit} 
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-teal-500 focus:ring-teal-500 outline-none transition-all bg-white resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Perilaku & Kebiasaan</label>
                  <textarea 
                    name="deskripsi"
                    placeholder="Ceritakan bagaimana kebiasaan anak di kelas. Misal: 'Sering tidak fokus kalau disuruh membaca lama, tapi sangat antusias kalau ada praktik. Saat duduk tangannya suka mengetuk-ngetuk meja.'"
                    value={formData.deskripsi} 
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-teal-500 focus:ring-teal-500 outline-none transition-all bg-white resize-none text-sm leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 shadow-sm hover:shadow-md"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {loading ? "Menganalisis Psikologi..." : "Diagnosis Gaya Belajar"}
                  </button>
                  <button 
                    type="button" 
                    onClick={copyPrompt}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                  >
                    {promptCopied ? <Check className="w-5 h-5 text-teal-500" /> : <Copy className="w-5 h-5" />}
                    {promptCopied ? "Prompt Tersalin!" : "Copy Prompt AI"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-2 print:col-span-1 print:w-full">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 min-h-[500px] flex flex-col print:border-none print:shadow-none print:p-0 print:m-0">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 print:hidden">
                <h2 className="text-xl font-bold text-slate-800">Hasil Analisis & Strategi</h2>
                
                {result && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm text-sm"
                    >
                      {copied ? <Check className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Tersalin!" : "Copy Teks"}
                    </button>
                    <button 
                      onClick={exportWord}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      Download Word
                    </button>
                    <button 
                      onClick={exportPDF}
                      disabled={isGeneratingPdf}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-sm disabled:opacity-50"
                    >
                      {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                      {isGeneratingPdf ? "Menyiapkan PDF..." : "Cetak PDF"}
                    </button>
                  </div>
                )}
              </div>

              {error && (
               <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 print:hidden">
                  <p className="font-semibold">Terjadi Kesalahan</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}

              {!result && !loading && !error && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12 print:hidden">
                  <Brain className="w-20 h-20 mb-6 opacity-20" />
                  <p className="text-center px-4 font-medium text-slate-500">
                    Ceritakan kebiasaan belajar siswa di kelas,<br/> lalu klik <strong className="text-teal-600">"Diagnosis Gaya Belajar"</strong> untuk mendapatkan solusinya.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20 space-y-6 print:hidden">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-teal-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="font-bold animate-pulse text-teal-600 text-lg">Menganalisis psikologi dan perilaku belajar siswa...</p>
                </div>
              )}

              {result && (
                <div className="flex-1 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
                 <div className="bg-white p-2 relative print:bg-white text-black" ref={resultRef}>
                  
                  {/* Kop Surat untuk Print */}
                  <div className="hidden print:block text-center mb-10 pb-5 border-b-4 border-black">
                    <h1 className="text-2xl font-extrabold uppercase tracking-widest text-black mt-1">Diagnosis Gaya Belajar</h1>
                    <p className="text-lg font-semibold text-black mt-2">Kategori : {formData.umur}</p>
                  </div>

                  {/* Styling Hasil HTML AI */}
                  <div 
                    className="prose prose-slate max-w-none 
                               prose-p:text-slate-800 prose-p:my-3 prose-p:font-medium
                               prose-h3:text-slate-800 prose-h3:font-bold prose-h3:mt-6 prose-h3:pb-2 prose-h3:border-b prose-h3:border-slate-200
                               prose-ul:my-4 prose-li:my-2
                               prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-slate-300 prose-th:bg-slate-50 prose-th:p-3 prose-td:border prose-td:border-slate-300 prose-td:p-3
                               prose-strong:text-teal-800
                               print:prose-h3:text-black print:prose-h3:border-black print:prose-p:text-black print:prose-td:text-black print:prose-th:text-black print:prose-strong:text-black"
                    dangerouslySetInnerHTML={{ __html: result }}
                  />
                  
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
