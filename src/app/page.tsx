export const revalidate = 60;

import Link from "next/link";
import { ArrowRight, BookOpen, Users, Newspaper, Calendar } from "lucide-react";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import BeritaTabs from "@/components/landing/BeritaTabs";
import { getCachedSiteName } from "@/lib/settings";

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

export default async function Home() {
  const [latestNews, categories, siteName, upcomingAgendas] = await Promise.all([
    getLatestNews(),
    getCategories(),
    getCachedSiteName(),
    getUpcomingAgendas(),
  ]);

  // Strip HTML from content for snippet
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-madrasah-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-400 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="bg-madrasah-800 p-4 rounded-full mb-6 border border-madrasah-700 shadow-xl">
            <BookOpen className="w-8 h-8 text-gold-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            {siteName} <br />
            <span className="text-gold-400">Berkemajuan</span>
          </h1>
          <p className="text-lg md:text-xl text-madrasah-100 max-w-2xl mb-10 leading-relaxed">
            Wadah kolaborasi dan peningkatan kompetensi tenaga pendidik untuk mewujudkan madrasah hebat, bermartabat, dan berakhlak mulia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="#berita" 
              className="bg-gold-500 hover:bg-gold-400 text-madrasah-900 px-8 py-3 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Baca Berita Terbaru <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section id="berita" className="w-full py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-madrasah-900 mb-4">Berita & Pengumuman Terbaru</h2>
              <div className="w-24 h-1 bg-gold-500 rounded-full"></div>
            </div>
            <Link href="/berita" className="hidden sm:flex items-center text-madrasah-700 font-bold hover:text-madrasah-900 transition-colors">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <BeritaTabs news={latestNews} categories={categories} />

          <div className="mt-10 text-center sm:hidden">
            <Link href="/berita" className="inline-flex items-center justify-center bg-madrasah-100 text-madrasah-800 font-bold px-6 py-3 rounded-full hover:bg-madrasah-200 transition-colors">
              Lihat Semua Berita <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Rundown Agenda Section */}
      {upcomingAgendas.length > 0 && (
        <section className="w-full py-20 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-madrasah-900 mb-4 flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-gold-500" />
                  Rundown Agenda
                </h2>
                <div className="w-24 h-1 bg-gold-500 rounded-full"></div>
                <p className="mt-4 text-gray-600">Jadwal kegiatan terdekat KKM & KKG.</p>
              </div>
              <Link href="/agenda" className="hidden sm:flex items-center text-emerald-600 font-bold hover:text-emerald-800 transition-colors">
                Lihat Seluruh Agenda <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingAgendas.map((agenda) => (
                <div key={agenda.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-100 p-6 transition-all group relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110 duration-500" />
                  
                  <div className="mb-4">
                    <span className="inline-block bg-emerald-100 text-emerald-800 font-bold text-sm px-3 py-1 rounded-full mb-3">
                      {new Date(agenda.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors leading-tight">{agenda.title}</h3>
                  </div>

                  <div className="space-y-2 mt-auto pt-4 border-t border-slate-50 text-sm text-slate-600">
                    {agenda.time && (
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 mt-0.5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></div>
                        <span>{agenda.time}</span>
                      </div>
                    )}
                    {agenda.location && (
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 mt-0.5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /></div>
                        <span className="line-clamp-2">{agenda.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center sm:hidden">
              <Link href="/agenda" className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold px-6 py-3 rounded-full hover:bg-emerald-100 transition-colors">
                Seluruh Agenda <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="w-full py-20 px-4 bg-madrasah-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-madrasah-900 mb-4">Program & Kegiatan Kami</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-madrasah-100 group">
              <div className="bg-madrasah-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-madrasah-200 transition-colors">
                <Users className="w-8 h-8 text-madrasah-700" />
              </div>
              <h3 className="text-xl font-bold text-madrasah-900 mb-3">Kelompok Kerja Guru</h3>
              <p className="text-gray-600 leading-relaxed">
                Forum diskusi dan pengembangan metode pembelajaran yang inovatif bagi para guru MI.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-madrasah-100 group">
              <div className="bg-madrasah-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-madrasah-200 transition-colors">
                <BookOpen className="w-8 h-8 text-madrasah-700" />
              </div>
              <h3 className="text-xl font-bold text-madrasah-900 mb-3">Peningkatan Mutu</h3>
              <p className="text-gray-600 leading-relaxed">
                Pelatihan, workshop, dan bimbingan teknis untuk standar pendidikan madrasah yang lebih baik.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-madrasah-100 group">
              <div className="bg-madrasah-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-madrasah-200 transition-colors">
                <Newspaper className="w-8 h-8 text-madrasah-700" />
              </div>
              <h3 className="text-xl font-bold text-madrasah-900 mb-3">Informasi & Berita</h3>
              <p className="text-gray-600 leading-relaxed">
                Portal informasi terpadu yang menyajikan berita dan pengumuman terbaru seputar madrasah.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
