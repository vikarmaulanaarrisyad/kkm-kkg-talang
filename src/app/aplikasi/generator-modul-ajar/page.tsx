"use client";

import { useState, useRef } from "react";
import { BookOpen, FileText, Loader2, Sparkles, Download, FileDown, Copy, Check, Printer } from "lucide-react";

export default function GeneratorModulPage() {
  const [loading, setLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    faseKelas: "Fase A - Kelas 1",
    mapel: "",
    topik: "",
    waktu: "2 x 35 Menit",
    modelPembelajaran: "Problem Based Learning (PBL)",
    tujuanPembelajaran: ""
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
      const res = await fetch("/api/generate-modul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan modul ajar");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportWord = () => {
    try {
      if (!resultRef.current) {
        alert("Mohon tunggu, dokumen belum siap.");
        return;
      }
      const content = resultRef.current.innerHTML;
      const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Modul Ajar</title></head><body>${content}</body></html>`;
      
      const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Modul_Ajar_${formData.mapel}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal mendownload Word.");
    }
  };

  const copyToClipboard = async () => {
    if (!resultRef.current) {
      alert("Konten belum siap.");
      return;
    }
    try {
      const text = resultRef.current.innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      alert("Gagal menyalin teks.");
    }
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <main className="flex-grow flex flex-col w-full bg-slate-50 min-h-screen pb-20 print:bg-white print:pb-0">
      
      {/* Header Section */}
      <section className="w-full bg-gradient-to-br from-blue-50 via-white to-blue-100/50 pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-indigo-100/40 blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center text-slate-800">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-blue-600">AI Generator</span> Modul Ajar
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Susun Modul Ajar (RPP) Kurikulum Merdeka secara praktis dan otomatis.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 w-full space-y-8 print:space-y-0 print:mt-0 print:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
          
          {/* Form */}
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Data Modul
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fase / Kelas</label>
                  <select 
                    name="faseKelas" 
                    value={formData.faseKelas} 
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="Fase A - Kelas 1">Fase A - Kelas 1</option>
                    <option value="Fase A - Kelas 2">Fase A - Kelas 2</option>
                    <option value="Fase B - Kelas 3">Fase B - Kelas 3</option>
                    <option value="Fase B - Kelas 4">Fase B - Kelas 4</option>
                    <option value="Fase C - Kelas 5">Fase C - Kelas 5</option>
                    <option value="Fase C - Kelas 6">Fase C - Kelas 6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input 
                    type="text" 
                    name="mapel"
                    placeholder="Contoh: Fikih, IPAS, Bahasa Arab..."
                    value={formData.mapel} 
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Topik / Materi Pokok</label>
                  <input 
                    type="text" 
                    name="topik"
                    placeholder="Contoh: Rukun Islam, Fotosintesis..."
                    value={formData.topik} 
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Alokasi Waktu</label>
                  <input 
                    type="text" 
                    name="waktu"
                    placeholder="Contoh: 2 x 35 Menit"
                    value={formData.waktu} 
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Model Pembelajaran</label>
                  <select 
                    name="modelPembelajaran" 
                    value={formData.modelPembelajaran} 
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="Problem Based Learning (PBL)">Problem Based Learning (PBL)</option>
                    <option value="Project Based Learning (PjBL)">Project Based Learning (PjBL)</option>
                    <option value="Discovery / Inquiry Learning">Discovery / Inquiry Learning</option>
                    <option value="Konvensional / Ceramah Interaktif">Konvensional / Ceramah Interaktif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tujuan Pembelajaran (Opsional)</label>
                  <textarea 
                    name="tujuanPembelajaran"
                    placeholder="Contoh: Siswa dapat menjelaskan rukun Islam dengan benar."
                    value={formData.tujuanPembelajaran} 
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all bg-white resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Isi jika Anda memiliki target spesifik. Kosongkan agar AI menyesuaikan secara otomatis.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 shadow-sm hover:shadow-md"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {loading ? "Menyusun Modul..." : "Generate Modul Ajar"}
                </button>
              </form>
            </div>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-2 print:col-span-1 print:w-full">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 min-h-[500px] flex flex-col print:border-none print:shadow-none print:p-0 print:m-0">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 print:hidden">
                <h2 className="text-xl font-bold text-slate-800">Hasil Modul Ajar</h2>
                
                {result && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      type="button"
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm text-sm"
                    >
                      {copied ? <Check className="w-4 h-4 text-blue-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Tersalin!" : "Copy Teks"}
                    </button>
                    <button 
                      type="button"
                      onClick={exportWord}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      Download Word
                    </button>
                    <button 
                      type="button"
                      disabled={isGeneratingPdf}
                      onClick={exportPDF}
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
                  <BookOpen className="w-20 h-20 mb-6 opacity-20" />
                  <p className="text-center px-4 font-medium text-slate-500">
                    Lengkapi formulir di samping dan klik <strong className="text-blue-600">"Generate Modul Ajar"</strong><br/>untuk mendapatkan susunan modul secara otomatis.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20 space-y-6 print:hidden">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="font-bold animate-pulse text-blue-600 text-lg">AI sedang merangkai Modul Ajar untuk Anda...</p>
                </div>
              )}

              {result && (
                <div className="flex-1 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
                 <div className="bg-white relative print:bg-white text-black" ref={resultRef}>
                  
                  {/* Kop Surat Modul Ajar */}
                  <div className="text-center mb-8 pb-4 border-b-2 border-black">
                    <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-widest text-slate-900 print:text-black">MODUL AJAR KURIKULUM MERDEKA</h1>
                    <h2 className="text-md sm:text-lg font-bold uppercase tracking-widest text-slate-800 print:text-black mt-1">MADRASAH IBTIDAIYAH</h2>
                  </div>

                  <div 
                    className="prose prose-slate max-w-none 
                               prose-h2:text-slate-900 prose-h2:font-extrabold prose-h2:border-b-2 prose-h2:border-slate-300 prose-h2:pb-2 prose-h2:mt-10
                               prose-h3:text-slate-800 prose-h3:font-bold prose-h3:mt-6
                               prose-h4:text-slate-800 prose-h4:font-semibold
                               prose-ol:text-slate-800 prose-ol:pl-6 prose-ol:font-medium
                               prose-ul:text-slate-800 prose-ul:pl-6
                               prose-li:my-2 prose-li:leading-relaxed
                               prose-p:text-slate-800 prose-p:my-3 prose-p:font-medium prose-p:leading-relaxed
                               prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-slate-300 prose-th:bg-slate-100 prose-th:p-2 prose-td:border prose-td:border-slate-300 prose-td:p-2
                               prose-strong:text-slate-900
                               print:prose-h2:text-black print:prose-h2:border-black
                               print:prose-h3:text-black print:prose-h4:text-black print:prose-ol:text-black print:prose-ul:text-black print:prose-li:text-black print:prose-p:text-black print:prose-strong:text-black print:prose-th:border-black print:prose-td:border-black print:prose-th:bg-gray-200
                               px-2 sm:px-4"
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
