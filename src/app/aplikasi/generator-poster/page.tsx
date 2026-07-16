"use client";

import { useState } from "react";
import { Image as ImageIcon, Copy, Check, Sparkles, RefreshCcw } from "lucide-react";

export default function GeneratorPosterPage() {
  const [formData, setFormData] = useState({
    namaKegiatan: "",
    temaVisual: "3D Pixar / Disney Style",
    objekUtama: "",
    nuansaWarna: "",
    orientasi: "Potret (Vertical)"
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generatePrompt = (e: React.FormEvent) => {
    e.preventDefault();

    let styleDescription = "";
    switch (formData.temaVisual) {
      case "3D Pixar / Disney Style":
        styleDescription = "3D animation style, cute and expressive like Pixar or Disney, soft lighting, highly detailed, octane render, 8k";
        break;
      case "Realistis & Elegan":
        styleDescription = "Ultra-realistic photography, elegant, cinematic lighting, highly detailed, 8k resolution, masterpiece, professional";
        break;
      case "Desain Datar (Flat Design) Modern":
        styleDescription = "Modern vector flat design, clean lines, vibrant colors, minimalist, corporate illustration style, dribbble style";
        break;
      case "Cat Air (Watercolor) Hangat":
        styleDescription = "Beautiful watercolor illustration, warm and inviting, soft brush strokes, artistic, dreamy, aesthetic";
        break;
      case "Islamic Geometric / Arabian Nights":
        styleDescription = "Islamic art style, intricate geometric patterns, Arabian nights aesthetic, magical lighting, golden accents, highly detailed";
        break;
    }

    let orientation = "";
    if (formData.orientasi === "Potret (Vertical)") orientation = "--ar 9:16";
    else if (formData.orientasi === "Lanskap (Horizontal)") orientation = "--ar 16:9";
    else orientation = "--ar 1:1"; // Persegi

    const prompt = `A highly detailed and creative poster background illustration for a Madrasah (Islamic school) event called "${formData.namaKegiatan}". 
The main subject/focus: ${formData.objekUtama || "cheerful Indonesian Madrasah students and festive decorations"}. 
${formData.nuansaWarna ? `Color palette: ${formData.nuansaWarna}.` : ''} 
Ensure there is plenty of negative space (empty space) at the top and bottom to add text later. Do NOT include any real text or words in the image. 
Style: ${styleDescription}. ${orientation}`;

    setGeneratedPrompt(prompt.replace(/\s+/g, ' ').trim());
  };

  const copyToClipboard = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const resetForm = () => {
    setFormData({
      namaKegiatan: "",
      temaVisual: "3D Pixar / Disney Style",
      objekUtama: "",
      nuansaWarna: "",
      orientasi: "Potret (Vertical)"
    });
    setGeneratedPrompt(null);
  };

  return (
    <main className="flex-grow flex flex-col w-full bg-slate-50 min-h-screen pb-20">
      {/* Header Section */}
      <section className="w-full bg-gradient-to-br from-indigo-50 via-white to-purple-100/50 pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-indigo-200/40 blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center text-slate-800">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <ImageIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-indigo-600">Generator Prompt</span> Poster AI
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Buat prompt (perintah teks) berkualitas tinggi berbahasa Inggris untuk di-copy paste ke Bing Image Creator, Midjourney, Canva AI, atau generator gambar lainnya.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20 w-full space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Detail Acara / Poster
            </h2>
            
            <form onSubmit={generatePrompt} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Kegiatan / Acara <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="namaKegiatan"
                  placeholder="Contoh: Peringatan Maulid Nabi, Lomba 17 Agustus..."
                  value={formData.namaKegiatan} 
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tema / Gaya Visual</label>
                <select 
                  name="temaVisual" 
                  value={formData.temaVisual} 
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                >
                  <option value="3D Pixar / Disney Style">3D Pixar / Disney Style (Karakter Animasi Lucu)</option>
                  <option value="Realistis & Elegan">Realistis & Elegan (Fotografi Kualitas Tinggi)</option>
                  <option value="Desain Datar (Flat Design) Modern">Desain Datar Modern (Kartun Vektor Simpel)</option>
                  <option value="Cat Air (Watercolor) Hangat">Cat Air (Watercolor Hangat & Estetik)</option>
                  <option value="Islamic Geometric / Arabian Nights">Nuansa Islami (Ornamen Geometris / Arabian)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Fokus Objek (Opsional)</label>
                <input 
                  type="text" 
                  name="objekUtama"
                  placeholder="Contoh: Masjid besar, anak-anak madrasah membawa piala..."
                  value={formData.objekUtama} 
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nuansa Warna</label>
                  <input 
                    type="text" 
                    name="nuansaWarna"
                    placeholder="Contoh: Hijau emas"
                    value={formData.nuansaWarna} 
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Orientasi Poster</label>
                  <select 
                    name="orientasi" 
                    value={formData.orientasi} 
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                  >
                    <option value="Potret (Vertical)">Potret (Vertical 9:16)</option>
                    <option value="Persegi (Square)">Persegi (Square 1:1)</option>
                    <option value="Lanskap (Horizontal)">Lanskap (Horizontal 16:9)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="flex items-center justify-center p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                  title="Reset Form"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
                <button 
                  type="submit" 
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Buat Prompt AI
                </button>
              </div>
            </form>
          </div>

          {/* Result */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Hasil Prompt (Bahasa Inggris)</h2>
              {generatedPrompt && (
                <button 
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    copied ? "bg-green-100 text-green-700" : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Tersalin!" : "Copy Teks"}
                </button>
              )}
            </div>

            {!generatedPrompt ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-medium px-4">
                  Isi formulir dan klik "Buat Prompt AI" untuk memunculkan teks perintah (prompt) di sini.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-700 font-mono text-sm leading-relaxed overflow-y-auto custom-scrollbar">
                  {generatedPrompt}
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-auto">
                  <p className="text-sm text-blue-800 font-medium flex items-start gap-2">
                    <span className="text-xl leading-none">💡</span>
                    <span>
                      <strong>Tips:</strong> Buka <a href="https://bing.com/create" target="_blank" rel="noreferrer" className="text-blue-600 underline">Bing Image Creator</a> atau Canva AI, lalu <em>Paste</em> teks di atas. AI sengaja diminta mengosongkan area teks agar Anda bisa menambahkan tulisan judul acara dengan rapi menggunakan Canva.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
