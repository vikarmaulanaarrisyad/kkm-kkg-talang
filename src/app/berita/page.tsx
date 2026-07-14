import Link from "next/link";
import { ArrowRight, Calendar, Newspaper, ChevronLeft, ChevronRight } from "lucide-react";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

async function getAllNews() {
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
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return data;
  } catch (error) {
    console.error("Gagal mengambil berita", error);
    return [];
  }
}

export default async function BeritaPublicPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const allNews = await getAllNews();
  const sp = await searchParams;
  const currentPage = parseInt(sp.page || '1') || 1;
  const itemsPerPage = 9;
  const totalPages = Math.ceil(allNews.length / itemsPerPage);
  
  const paginatedNews = allNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-madrasah-900 mb-4 tracking-tight">Semua Berita & Pengumuman</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Temukan informasi terbaru seputar kegiatan, pengumuman, dan prestasi di lingkungan KKM & KKG Madrasah Ibtidaiyah Kecamatan Talang.
          </p>
        </div>

        {paginatedNews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {paginatedNews.map((news) => (
                <Link href={`/berita/${news.slug}`} key={news.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full transform hover:-translate-y-1">
                  <div className="w-full h-56 relative overflow-hidden bg-gray-100">
                    {news.image_url ? (
                      <img src={news.image_url} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-gold-500 text-madrasah-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {news.category || "Umum"}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center text-sm text-gray-500 mb-3 gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(news.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-madrasah-700 transition-colors">{news.title}</h3>
                    <p className="text-gray-600 line-clamp-3 mb-4 flex-1 text-sm">
                      {stripHtml(news.content)}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-100 text-madrasah-700 font-semibold flex items-center text-sm">
                      Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Link 
                  href={currentPage > 1 ? `/berita?page=${currentPage - 1}` : '#'}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  const isActive = page === currentPage;
                  return (
                    <Link
                      key={page}
                      href={`/berita?page=${page}`}
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${isActive ? 'bg-madrasah-700 text-white shadow-md' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      {page}
                    </Link>
                  );
                })}

                <Link 
                  href={currentPage < totalPages ? `/berita?page=${currentPage + 1}` : '#'}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada berita</h3>
            <p className="text-gray-500 font-medium">Berita dan pengumuman akan segera hadir di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
