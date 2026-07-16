"use client";

import { useState, useRef } from "react";
import { Bot, FileText, Loader2, Sparkles, Printer, FileDown, Copy, Check } from "lucide-react";

export default function GeneratorSoalPage() {
  const [loading, setLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    kelas: "1",
    mapel: "",
    topik: "",
    jumlahSoal: "10",
    kesulitan: "Sedang",
    jenisSoal: "Pilihan Ganda"
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

  const exportWord = () => {
    if (!resultRef.current) return;
    const content = resultRef.current.innerHTML;
    // Basic HTML wrapper for Word export
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Export HTML to Word</title></head><body>${content}</body></html>`;
    
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Soal_${formData.mapel}_Kelas_${formData.kelas}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    const prompt = `Buatkan soal ujian berstandar Kurikulum Merdeka untuk anak Madrasah Ibtidaiyah (MI) dengan kriteria berikut:
- Kelas: ${formData.kelas}
- Mata Pelajaran: ${formData.mapel}
- Topik/Materi Pokok: ${formData.topik}
- Jumlah Soal: ${formData.jumlahSoal} soal
- Tingkat Kesulitan: ${formData.kesulitan}
- Jenis Soal: ${formData.jenisSoal}

Aturan Penulisan:
1. Jika jenis soal Pilihan Ganda, PASTIKAN setiap pilihan jawaban SELALU DITULIS dengan format huruf awalan A, B, C, D secara eksplisit (contoh: A. Jawaban pertama, B. Jawaban kedua, dst). Jangan sekadar menggunakan bullet points biasa. Ketik hurufnya secara manual di setiap pilihan.
2. Sediakan KUNCI JAWABAN lengkap di bagian paling akhir.
3. Format hasil output WAJIB menggunakan elemen HTML standar (<br>, <h3>, <h4>, <ul>, <ol>, <li>, <strong>, <p>) tanpa membungkus dengan backtick markdown (\`\`\`html).
4. Jangan berikan kalimat pembuka, langsung berikan kode HTML-nya.
5. Gunakan bahasa Indonesia yang baku, sopan, dan mudah dipahami siswa MI.`;

    try {
      await navigator.clipboard.writeText(prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt', err);
    }
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <main className="flex-grow flex flex-col w-full bg-slate-50 min-h-screen pb-20 print:bg-white print:pb-0">
      
      {/* Header Section */}
      <section className="w-full bg-gradient-to-br from-emerald-50 via-white to-emerald-100/50 pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-teal-100/40 blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center text-slate-800">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Bot className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-emerald-600">AI Generator</span> Soal MI
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Buat soal ujian secara otomatis dan instan untuk siswa Madrasah Ibtidaiyah.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 w-full space-y-8 print:space-y-0 print:mt-0 print:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
          
          {/* Form Configuration - Hidden in Print */}
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
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
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all bg-white"
                  >
                    {[1,2,3,4,5,6].map(k => (
                      <option key={k} value={k}>Kelas {k} MI</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <textarea 
                    name="mapel"
                    placeholder="Contoh: Akidah Akhlak..."
                    value={formData.mapel} 
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all bg-white resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Topik / Materi Pokok</label>
                  <textarea 
                    name="topik"
                    placeholder="Contoh: Sifat Wajib Allah..."
                    value={formData.topik} 
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all bg-white resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Jumlah</label>
                    <select 
                      name="jumlahSoal" 
                      value={formData.jumlahSoal} 
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all bg-white"
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
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all bg-white"
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
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="Pilihan Ganda">Pilihan Ganda</option>
                    <option value="Pilihan Ganda Kompleks">Pilihan Ganda Kompleks</option>
                    <option value="Isian Singkat">Isian Singkat</option>
                    <option value="Uraian">Uraian / Esai</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 shadow-sm hover:shadow-md"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {loading ? "Menyusun Soal..." : "Generate Soal AI"}
                  </button>
                  <button 
                    type="button" 
                    onClick={copyPrompt}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                  >
                    {promptCopied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
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
                <h2 className="text-xl font-bold text-slate-800">Lembar Hasil Ujian</h2>
                
                {result && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm text-sm"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
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
                  <Bot className="w-20 h-20 mb-6 opacity-20" />
                  <p className="text-center px-4 font-medium text-slate-500">
                    Silakan isi formulir di samping dan klik <strong className="text-emerald-600">"Generate Soal AI"</strong><br/>untuk mendapatkan susunan soal secara otomatis.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20 space-y-6 print:hidden">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="font-bold animate-pulse text-emerald-600 text-lg">AI sedang merangkai soal khusus untuk Anda...</p>
                </div>
              )}

              {result && (
                <div className="flex-1 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
                 <div className="bg-white relative print:bg-white text-black" ref={resultRef}>
                  
                  {/* Kop Surat untuk Print - Hanya Muncul di Kertas / atau Preview */}
                  <div className="text-center mb-10 pb-5 border-b-4 border-black">
                    <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-widest text-slate-900 print:text-black">LATIHAN SOAL UJIAN</h1>
                    <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest text-slate-800 print:text-black mt-1">MADRASAH IBTIDAIYAH</h2>
                    <div className="flex flex-col sm:flex-row justify-center sm:gap-12 mt-4 text-base font-semibold text-slate-700 print:text-black">
                      <p>Mata Pelajaran : {formData.mapel || "........................"}</p>
                      <p>Kelas : {formData.kelas}</p>
                    </div>
                    <p className="text-base font-semibold text-slate-700 print:text-black mt-1">
                      Materi / Topik : {formData.topik || "........................"}
                    </p>
                  </div>

                  {/* Wrapper khusus untuk Styling Hasil HTML AI */}
                  <div 
                    className="prose prose-slate max-w-none 
                               prose-h3:text-slate-800 prose-h3:font-extrabold prose-h3:border-b-2 prose-h3:border-slate-200 prose-h3:pb-2 prose-h3:mb-6 prose-h3:mt-8
                               prose-h4:text-slate-800 prose-h4:font-bold
                               prose-ol:text-slate-800 prose-ol:pl-6 prose-ol:font-medium
                               prose-ul:text-slate-800 prose-ul:pl-6
                               prose-li:my-3 prose-li:leading-relaxed
                               prose-p:text-slate-800 prose-p:my-3 prose-p:font-medium
                               prose-hr:my-12 prose-hr:border-slate-300 prose-hr:border-dashed
                               prose-strong:text-slate-900
                               print:prose-h3:text-black print:prose-h3:border-black
                               print:prose-h4:text-black print:prose-ol:text-black print:prose-ul:text-black print:prose-li:text-black print:prose-p:text-black print:prose-strong:text-black print:prose-hr:border-black
                               px-2 sm:px-6"
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
