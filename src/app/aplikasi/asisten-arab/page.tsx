"use client";

import { useState, useRef } from "react";
import { MessageCircle, FileText, Loader2, Sparkles, Copy, Check, Printer, FileDown } from "lucide-react";

export default function AsistenArabPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    topik: "",
    tingkatKesulitan: "Kelas 1-3 MI (Dasar)",
    jenisKonten: "Percakapan (Hiwar)"
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
      const res = await fetch("/api/generate-arab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan konten Bahasa Arab");
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
    const prompt = `Anda adalah seorang ahli Bahasa Arab dan guru untuk siswa Madrasah Ibtidaiyah (MI).
Buatkan ${formData.jenisKonten} dalam Bahasa Arab dengan topik: "${formData.topik}".
Tingkat kesulitan: ${formData.tingkatKesulitan}.

Aturan:
1. Wajib memberikan tulisan Arab lengkap dengan harakat (syakal) agar mudah dibaca oleh anak MI.
2. Berikan terjemahan Bahasa Indonesia di bawah setiap kalimat atau kata.
3. Gunakan kosa kata dasar yang umum diajarkan di tingkat SD/MI.
4. Format hasil output menggunakan elemen HTML standar (<br>, <h3>, <h4>, <ul>, <ol>, <li>, <strong>, <p>, <table>) tanpa membungkus dengan backtick markdown (\`\`\`html).
5. Jangan berikan kalimat pembuka, langsung berikan kode HTML-nya.
6. Untuk teks bahasa Arab, gunakan tag <p dir="rtl" lang="ar" style="font-size: 1.7rem; line-height: 2.5; font-family: 'Amiri', 'Lateef', 'Traditional Arabic', serif; margin-bottom: 0.5rem; text-align: right;"> agar tampilannya besar dan jelas dari kanan ke kiri.
7. Format jika Percakapan: Buat dalam tabel dengan kolom: Pembicara (Arab/Indo), Teks Arab, Teks Terjemahan. Atau pakai format p yang rapi.`;

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
    <head><meta charset='utf-8'><title>Teks Bahasa Arab</title>
    <style>
      p[lang="ar"] { font-size: 24pt; line-height: 2; text-align: right; direction: rtl; }
    </style>
    </head><body>${content}</body></html>`;
    
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bahasa_Arab_${formData.jenisKonten}.doc`;
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
      <section className="w-full bg-gradient-to-br from-amber-50 via-white to-orange-100/50 pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-orange-200/40 blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center text-slate-800">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <MessageCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-amber-600">Asisten Khusus</span> Bahasa Arab
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Buat percakapan, kosakata, cerita pendek, atau soal Bahasa Arab berharakat lengkap dengan mudah untuk siswa MI.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 w-full space-y-8 print:space-y-0 print:mt-0 print:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
          
          {/* Form Configuration */}
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Pengaturan Konten
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Konten</label>
                  <select 
                    name="jenisKonten" 
                    value={formData.jenisKonten} 
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-amber-500 focus:ring-amber-500 outline-none transition-all bg-white"
                  >
                    <option value="Percakapan (Hiwar)">Percakapan (Hiwar)</option>
                    <option value="Daftar Kosakata (Mufrodat)">Daftar Kosakata (Mufrodat)</option>
                    <option value="Cerita Pendek (Qishoh)">Cerita Pendek (Qishoh)</option>
                    <option value="Soal Latihan (Tadribat)">Soal Latihan (Tadribat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Topik / Tema</label>
                  <textarea 
                    name="topik"
                    placeholder="Contoh: Perkenalan di kelas, Anggota Tubuh, Nama Buah-buahan..."
                    value={formData.topik} 
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-amber-500 focus:ring-amber-500 outline-none transition-all bg-white resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tingkat Kesulitan</label>
                  <select 
                    name="tingkatKesulitan" 
                    value={formData.tingkatKesulitan} 
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-amber-500 focus:ring-amber-500 outline-none transition-all bg-white"
                  >
                    <option value="Kelas 1-3 MI (Sangat Dasar/Pemula)">Kelas 1-3 MI (Sangat Dasar)</option>
                    <option value="Kelas 4-6 MI (Menengah)">Kelas 4-6 MI (Menengah)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 shadow-sm hover:shadow-md"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {loading ? "Menyusun Teks..." : "Generate Bahasa Arab"}
                  </button>
                  <button 
                    type="button" 
                    onClick={copyPrompt}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                  >
                    {promptCopied ? <Check className="w-5 h-5 text-amber-500" /> : <Copy className="w-5 h-5" />}
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
                <h2 className="text-xl font-bold text-slate-800">Hasil Teks Bahasa Arab</h2>
                
                {result && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm text-sm"
                    >
                      {copied ? <Check className="w-4 h-4 text-amber-500" /> : <Copy className="w-4 h-4" />}
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
                  <MessageCircle className="w-20 h-20 mb-6 opacity-20" />
                  <p className="text-center px-4 font-medium text-slate-500">
                    Pilih jenis konten dan topik yang Anda inginkan,<br/> lalu klik <strong className="text-amber-600">"Generate Bahasa Arab"</strong>.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20 space-y-6 print:hidden">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="font-bold animate-pulse text-amber-600 text-lg">AI sedang merangkai bahasa Arab berharakat...</p>
                </div>
              )}

              {result && (
                <div className="flex-1 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
                 <div className="bg-white p-2 relative print:bg-white text-black" ref={resultRef}>
                  
                  {/* Kop Surat untuk Print - Hanya Muncul di Kertas / atau Preview */}
                  <div className="hidden print:block text-center mb-10 pb-5 border-b-4 border-black">
                    <h1 className="text-2xl font-extrabold uppercase tracking-widest text-black mt-1">{formData.jenisKonten}</h1>
                    <p className="text-lg font-semibold text-black mt-2">Topik : {formData.topik}</p>
                  </div>

                  {/* Styling Hasil HTML AI */}
                  <div 
                    className="prose prose-slate max-w-none 
                               prose-p:text-slate-800 prose-p:my-3 prose-p:font-medium
                               prose-h3:text-slate-800 prose-h3:font-bold prose-h3:mt-6
                               prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-slate-300 prose-th:bg-slate-50 prose-th:p-3 prose-td:border prose-td:border-slate-300 prose-td:p-3
                               prose-strong:text-slate-900
                               print:prose-h3:text-black print:prose-p:text-black print:prose-td:text-black print:prose-th:text-black print:prose-strong:text-black"
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
