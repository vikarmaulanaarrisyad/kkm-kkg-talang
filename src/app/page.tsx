import Link from "next/link";
import { ArrowRight, BookOpen, Users, Newspaper } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-madrasah-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-400 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="bg-madrasah-800 p-4 rounded-full mb-6 border border-madrasah-700 shadow-xl">
            <BookOpen className="w-12 h-12 text-gold-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            KKM & KKG Madrasah Ibtidaiyah <br />
            <span className="text-gold-400">Kecamatan Talang</span>
          </h1>
          <p className="text-lg md:text-xl text-madrasah-100 max-w-2xl mb-10 leading-relaxed">
            Wadah kolaborasi dan peningkatan kompetensi tenaga pendidik untuk mewujudkan madrasah hebat, bermartabat, dan berakhlak mulia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/berita" 
              className="bg-gold-500 hover:bg-gold-400 text-madrasah-900 px-8 py-3 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Baca Berita Terbaru <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

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
