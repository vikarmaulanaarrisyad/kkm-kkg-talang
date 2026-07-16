export const revalidate = 60;

import Link from "next/link";
import { ArrowRight, BookOpen, Users, Newspaper, Calendar, Download, FileText, FileSignature, Brain, Heart, Lightbulb, Sparkles, Map, Languages } from "lucide-react";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import BeritaTabs from "@/components/landing/BeritaTabs";
import { getCachedSiteName, getAllSettings } from "@/lib/settings";
import { TypewriterEffect } from "@/components/ui/TypewriterEffect";
import TestimonialCarousel from "@/components/landing/TestimonialCarousel";
import PartnerLogos from "@/components/landing/PartnerLogos";
import FAQSection from "@/components/landing/FAQSection";

async function getCategories() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return [];
  try {
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Kategori", ['id', 'name', 'slug']);
    const rows = await sheet.getRows();
    return rows.map(r => ({ id: r.get('id'), name: r.get('name') }));
  } catch (error) {
    console.error("Gagal mengambil kategori", error);
    return [];
  }
}

async function getUnduhan() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return [];
  try {
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Unduhan", ['id', 'title', 'url', 'icon_type', 'created_at']);
    const rows = await sheet.getRows();
    const data = rows.map(r => ({ 
      id: r.get('id'), 
      title: r.get('title'), 
      url: r.get('url'), 
      icon_type: r.get('icon_type') || 'FileText' 
    }));
    return data.slice(0, 8); // Batasi maksimal 8 agar tidak terlalu penuh
  } catch (error) {
    console.error("Gagal mengambil unduhan", error);
    return [];
  }
}


async function getPengurus() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return [];
  try {
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Pengurus", ['id', 'name', 'role', 'image_url', 'order', 'created_at']);
    const rows = await sheet.getRows();
    const data = rows.map(row => ({
      id: row.get('id'),
      name: row.get('name'),
      role: row.get('role'),
      image_url: row.get('image_url'),
      order: parseInt(row.get('order') || "99", 10),
    }));
    data.sort((a, b) => a.order - b.order);
    return data;
  } catch (error) {
    return [];
  }
}


async function getTotalGuru() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return 0;
  try {
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Guru", ['id', 'nama', 'nuptk']);
    const rows = await sheet.getRows();
    return rows.length;
  } catch (error) {
    console.error("Gagal mengambil total guru", error);
    return 0;
  }
}

async function getLatestNews() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return [];
  
  try {
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Berita", ['id', 'title', 'slug', 'content', 'image_url', 'author', 'status', 'created_at', 'category']);
    const rows = await sheet.getRows();
    const data = rows
      .map(r => ({
        id: r.get('id'),
        title: r.get('title'),
        slug: r.get('slug'),
        content: r.get('content') || '',
        image_url: r.get('image_url'),
        status: r.get('status'),
        created_at: r.get('created_at'),
        category: r.get('category')
      }))
      .filter(b => b.status === 'Published')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 9); // Ambil 9 terbaru untuk ditampilkan di tab

    return data;
  } catch (error) {
    console.error("Gagal mengambil berita untuk landing page", error);
    return [];
  }
}

async function getUpcomingAgendas() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return [];

  try {
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Agenda", [
      "id", "title", "date", "time", "location", "description", "status"
    ]);
    const rows = await sheet.getRows();
    const data = rows.map(r => ({
      id: r.get("id"),
      title: r.get("title"),
      date: r.get("date"),
      time: r.get("time"),
      location: r.get("location"),
      status: r.get("status")
    }));

    const upcoming = data.filter(a => a.status !== "Completed" && new Date(a.date) >= new Date(new Date().setHours(0,0,0,0)));
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming.slice(0, 4); // Ambil 4 terdekat
  } catch (error) {
    console.error("Gagal mengambil agenda", error);
    return [];
  }
}

async function getTestimonials() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return [];

  try {
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Testimoni", ["id", "name", "role", "quote", "image_url", "status", "created_at"]);
    const rows = await sheet.getRows();
    const data = rows.map(r => ({
      id: r.get("id"),
      author: r.get("name"),
      role: r.get("role"),
      quote: r.get("quote"),
      image: r.get("image_url"),
      status: r.get("status")
    }));

    return data.filter(t => t.status === "Approved");
  } catch (error) {
    console.error("Gagal mengambil testimoni", error);
    return [];
  }
}

export default async function Home() {
  const [latestNews, categories, siteName, upcomingAgendas, unduhanData, profilSettings, pengurusData, totalGuru, testimonialsData] = await Promise.all([
    getLatestNews(),
    getCategories(),
    getCachedSiteName(),
    getUpcomingAgendas(),
    getUnduhan(),
    getAllSettings(),
    getPengurus(),
    getTotalGuru(),
    getTestimonials(),
  ]);

  // Strip HTML from content for snippet
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  return (
    <div className="flex flex-col items-center bg-white min-h-screen font-sans selection:bg-gold-500 selection:text-madrasah-900">
      {/* 
        ========================================================
        HERO SECTION (Clean & Responsive Light Theme)
        ========================================================
      */}
      <section className="w-full relative overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-emerald-50/50 pt-24 pb-16 lg:pt-28 lg:pb-24 px-4 sm:px-6">
        {/* Soft Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-blue-100/40 blur-3xl" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Text & CTA */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 text-emerald-700 shadow-sm lg:-ml-4 min-h-[40px]">
              <TypewriterEffect text={`✨ Selamat Datang di Website Resmi ${siteName}`} className="text-sm font-bold tracking-tight" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15]">
              <span className="block text-slate-900">
                Wadah Profesionalisme
              </span>
              <TypewriterEffect 
                text="Guru Madrasah" 
                className="block text-emerald-600 mt-1 min-h-[1.2em]" 
                loop={true} 
              />
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed">
              Membangun sinergi, meningkatkan kompetensi, dan mencetak generasi rabbani yang berprestasi melalui kolaborasi aktif Kelompok Kerja Guru.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 w-full sm:w-auto px-4 sm:px-0">
              <Link 
                href="/agenda" 
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                Lihat Kegiatan
              </Link>
              <Link 
                href="/profil" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-100 text-emerald-900 px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-sm transition-all duration-300 hover:-translate-y-0.5"
              >
                Profil Kami
              </Link>
            </div>
            
            {/* Social Proof / Stats Cards matching reference */}
            <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-stretch lg:items-start gap-4 sm:gap-6 w-full px-4 sm:px-0">
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xl sm:text-2xl font-black text-slate-800 leading-none">{totalGuru}</span>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase mt-1">Anggota Aktif</span>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4 flex-1 cursor-pointer hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-lg sm:text-xl font-black text-slate-800 leading-tight">Akses RDM</span>
                    <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">Rapor Digital</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 -rotate-45 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* Right Column: Clean Visual Image / Composition */}
          <div className="flex relative w-full justify-center items-center animate-in fade-in zoom-in-95 duration-1000 delay-200 mt-8 lg:mt-0">
            <div className="relative w-full max-w-xl lg:max-w-[600px] px-2 sm:px-0">
              {/* Decorative Glow Behind Image */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-purple-400 rounded-3xl blur-2xl opacity-40 transform translate-y-4"></div>
              
              {/* Main Image Container */}
              <div className="relative rounded-3xl transform rotate-2 overflow-hidden shadow-2xl border-4 sm:border-8 border-white group bg-emerald-50 z-0">
                <img 
                  src="/uplods/KKG-KKM.png" 
                  alt="KKM-KKG MI TALANG" 
                  className="w-full h-auto group-hover:scale-105 transition-transform duration-700 block"
                />
              </div>

              {/* Floating Badge (Unggul & Berprestasi) */}
              <div className="absolute -bottom-4 right-2 sm:-bottom-8 sm:-right-8 bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-3 sm:gap-4 animate-[bounce_5s_infinite] z-10 scale-90 sm:scale-100 origin-bottom-right">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <span className="text-xl sm:text-2xl">⭐</span>
                </div>
                <div className="shrink-0">
                  <div className="text-xs sm:text-base font-extrabold text-slate-800">Unggul & Berprestasi</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium">Komitmen Bersama</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================
        FEATURES / PILAR UTAMA SECTION
        ========================================================
      */}
      <section className="w-full -mt-10 relative z-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1 */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-emerald-100">
                <Users className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Kolaborasi Kuat</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Membangun sinergi antar pendidik melalui forum diskusi dan pertukaran ide yang konstruktif untuk kemajuan bersama.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-2 lg:-translate-y-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-blue-100">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Peningkatan Mutu</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Berfokus pada pengembangan kompetensi pedagogik dan profesional melalui pelatihan dan lokakarya berkelanjutan.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-purple-100">
                <Newspaper className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Informasi Terpadu</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Akses cepat dan mudah ke berbagai informasi penting, pengumuman, dan materi pembelajaran terkini.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================
        AI TOOLS SHOWCASE SECTION
        ========================================================
      */}
      <section className="w-full pt-32 pb-16 px-4 relative overflow-hidden bg-slate-50 border-t border-slate-100">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-blue-100/40 blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-bold mb-4 shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Senjata Rahasia Guru
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Alat AI Cerdas <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Terintegrasi</span></h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Tingkatkan produktivitas Anda dengan asisten kecerdasan buatan (AI) yang kami rancang khusus untuk kebutuhan kurikulum madrasah.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <Link href="/aplikasi/generator-modul-ajar" className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl shadow-sm transition-all duration-300 flex flex-col h-full transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">Modul Ajar KMA 1503</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">Susun RPP / Modul Ajar lengkap dengan Panca Cinta secara otomatis.</p>
              <div className="flex items-center text-sm font-bold text-blue-600 mt-auto">
                Coba Sekarang <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 2 */}
            <Link href="/aplikasi/generator-soal" className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-teal-300 hover:shadow-xl shadow-sm transition-all duration-300 flex flex-col h-full transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-teal-600 transition-colors">Generator Soal MI</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">Buat soal HOTS pilihan ganda, isian, dan esai dalam hitungan detik.</p>
              <div className="flex items-center text-sm font-bold text-teal-600 mt-auto">
                Coba Sekarang <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 3 */}
            <Link href="/aplikasi/generator-kbc" className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-rose-300 hover:shadow-xl shadow-sm transition-all duration-300 flex flex-col h-full transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 text-rose-500 fill-rose-500/20" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-rose-600 transition-colors">Skenario Panca Cinta</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">Integrasikan 5 nilai kasih sayang (KBC) ke dalam topik materi Anda.</p>
              <div className="flex items-center text-sm font-bold text-rose-600 mt-auto">
                Coba Sekarang <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 4 */}
            <Link href="/aplikasi/generator-pemantik" className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-violet-300 hover:shadow-xl shadow-sm transition-all duration-300 flex flex-col h-full transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-violet-600 transition-colors">Pemantik Deep Learning</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">Hasilkan studi kasus dan pertanyaan kritis untuk diskusi kelas aktif.</p>
              <div className="flex items-center text-sm font-bold text-violet-600 mt-auto">
                Coba Sekarang <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 5 */}
            <Link href="/aplikasi/analis-gaya-belajar" className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-xl shadow-sm transition-all duration-300 flex flex-col h-full transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors">Analis Gaya Belajar</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">Identifikasi gaya belajar anak dari perilakunya dan temukan strategi mengajar.</p>
              <div className="flex items-center text-sm font-bold text-emerald-600 mt-auto">
                Coba Sekarang <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            
            {/* Card 6 */}
            <Link href="/aplikasi/generator-raport" className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-amber-300 hover:shadow-xl shadow-sm transition-all duration-300 flex flex-col h-full transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileSignature className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-amber-600 transition-colors">Narasi Raport</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">Buat narasi perkembangan siswa yang menyentuh hati secara otomatis.</p>
              <div className="flex items-center text-sm font-bold text-amber-600 mt-auto">
                Coba Sekarang <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 7 */}
            <Link href="/aplikasi/asisten-arab" className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-xl shadow-sm transition-all duration-300 flex flex-col h-full transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Languages className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">Asisten B. Arab</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">Terjemahkan dengan Harakat dan panduan baca latin yang tepat.</p>
              <div className="flex items-center text-sm font-bold text-indigo-600 mt-auto">
                Coba Sekarang <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            
            {/* Card 8 */}
            <Link href="/aplikasi/atp" className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-orange-300 hover:shadow-xl shadow-sm transition-all duration-300 flex flex-col h-full transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Map className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-orange-600 transition-colors">Generator ATP</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">Susun Alur Tujuan Pembelajaran dengan runtut dan terstruktur.</p>
              <div className="flex items-center text-sm font-bold text-orange-600 mt-auto">
                Coba Sekarang <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* 
        ========================================================
        TESTIMONIAL CAROUSEL SECTION
        ========================================================
      */}
      {testimonialsData && testimonialsData.length > 0 && (
        <TestimonialCarousel testimonials={testimonialsData} />
      )}

      {/* 
        ========================================================
        AGENDA MENDATANG SECTION (Sleek Timeline)
        ========================================================
      */}
      {upcomingAgendas.length > 0 && (
        <section className="w-full pt-32 pb-16 px-4 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold mb-4">
                  <Calendar className="w-4 h-4" /> Agenda KKM/KKG
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Kegiatan Terdekat</h2>
                <p className="mt-4 text-slate-600 text-lg">Jangan lewatkan berbagai kegiatan menarik dan bermanfaat yang telah kami jadwalkan untuk Anda.</p>
              </div>
              <Link href="/agenda" className="group inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all flex-shrink-0">
                Lihat Seluruh Agenda
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingAgendas.map((agenda, idx) => (
                <div key={agenda.id} className="relative group perspective-1000">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-3xl transform translate-y-4 scale-95 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                        <span className="text-xs text-slate-500 font-bold uppercase">{new Date(agenda.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                        <span className="text-lg text-slate-800 font-black leading-none">{new Date(agenda.date).getDate()}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <ArrowRight className="w-4 h-4 -rotate-45" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {agenda.title}
                    </h3>
                    
                    <div className="mt-auto space-y-3 pt-4 border-t border-dashed border-slate-200">
                      {agenda.time && (
                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          {agenda.time}
                        </div>
                      )}
                      {agenda.location && (
                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          <span className="line-clamp-1">{agenda.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 
        ========================================================
        LATEST NEWS SECTION
        ========================================================
      */}
      <section id="berita" className="w-full pt-16 pb-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Informasi & Berita Terbaru</h2>
            <p className="text-lg text-slate-600">Dapatkan *update* seputar kebijakan, kegiatan, dan prestasi dari lingkungan madrasah kita.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-4 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <BeritaTabs news={latestNews} categories={categories} />
          </div>

          <div className="mt-12 text-center">
            <Link href="/berita" className="group inline-flex items-center justify-center gap-2 bg-white text-slate-800 border border-slate-200 shadow-sm px-8 py-4 rounded-full font-bold hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all">
              Lihat Arsip Berita
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 
        ========================================================
        POJOK UNDUHAN SECTION
        ========================================================
      */}
      <section id="unduhan" className="w-full py-20 px-4 bg-slate-50 relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-bold mb-4">
                <Download className="w-4 h-4" /> Pojok Unduhan
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Dokumen & Berkas Penting</h2>
              <p className="mt-4 text-slate-600 text-lg">Akses cepat untuk mengunduh berbagai format, pedoman, dan surat edaran resmi.</p>
            </div>
            <button className="group inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all flex-shrink-0 shadow-sm">
              Lihat Semua Dokumen
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {unduhanData.length > 0 ? (
              unduhanData.map((doc: any, idx: number) => {
                let IconComponent = FileText;
                let colorClass = "text-emerald-600";
                let bgClass = "bg-emerald-50";
                let borderClass = "border-emerald-100";

                switch(doc.icon_type) {
                  case 'Calendar':
                    IconComponent = Calendar;
                    colorClass = "text-blue-600"; bgClass = "bg-blue-50"; borderClass = "border-blue-100";
                    break;
                  case 'FileSignature':
                    IconComponent = FileSignature;
                    colorClass = "text-amber-600"; bgClass = "bg-amber-50"; borderClass = "border-amber-100";
                    break;
                  case 'BookOpen':
                    IconComponent = BookOpen;
                    colorClass = "text-purple-600"; bgClass = "bg-purple-50"; borderClass = "border-purple-100";
                    break;
                  case 'Download':
                    IconComponent = Download;
                    colorClass = "text-slate-600"; bgClass = "bg-slate-50"; borderClass = "border-slate-200";
                    break;
                }

                return (
                  <a key={doc.id || idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-200 hover:shadow-xl shadow-sm transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                    <div className={`w-14 h-14 rounded-2xl ${bgClass} ${borderClass} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-7 h-7 ${colorClass}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 leading-snug group-hover:text-emerald-600 transition-colors">{doc.title}</h3>
                    <div className="mt-auto flex items-center justify-between text-sm font-semibold text-slate-500 pt-4 border-t border-slate-100">
                      <span>Akses / Unduh</span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </div>
                    </div>
                  </a>
                );
              })
            ) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-12 bg-white rounded-3xl border border-slate-200 border-dashed">
                <Download className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-600">Belum Ada Dokumen</h3>
                <p className="text-slate-500 mt-2">Daftar unduhan akan segera diperbarui oleh admin.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 
        ========================================================
        FAQ SECTION
        ========================================================
      */}
      <FAQSection />

      {/* 
        ========================================================
        PARTNER LOGOS SECTION
        ========================================================
      */}
      <PartnerLogos />
    </div>
  );
}
