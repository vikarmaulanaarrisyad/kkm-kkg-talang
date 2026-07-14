export default function Footer({ siteName = "KKM & KKG MI TALANG" }: { siteName?: string }) {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 border-t-4 border-emerald-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-extrabold text-white mb-4 tracking-tight">{siteName}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Kelompok Kerja Madrasah (KKM) dan Kelompok Kerja Guru (KKG) Madrasah Ibtidaiyah Kecamatan Talang. Berdedikasi untuk memajukan pendidikan madrasah yang berkualitas dan berakhlak mulia.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/berita" className="hover:text-emerald-400 transition-colors">Berita Terkini</a>
              </li>
              <li>
                <a href="/profil" className="hover:text-emerald-400 transition-colors">Profil KKG/KKM</a>
              </li>
              <li>
                <a href="/kontak" className="hover:text-emerald-400 transition-colors">Hubungi Kami</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Kontak</h3>
            <p className="text-sm text-slate-400 mb-2">
              Kecamatan Talang, Kabupaten Tegal<br />
              Jawa Tengah, Indonesia
            </p>
            <p className="text-sm text-slate-400">
              Email: info@kkmtalang.id
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} {siteName}. Hak Cipta Dilindungi.</p>
          <p className="mt-2 md:mt-0">Dikelola oleh Tim KKM & KKG</p>
        </div>
      </div>
    </footer>
  );
}
