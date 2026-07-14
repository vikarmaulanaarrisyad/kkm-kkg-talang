import { Metadata } from "next";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import { BookOpen, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Profil | KKM - KKG MI TALANG",
  description: "Mengenal lebih dekat visi, misi, dan struktur organisasi Kelompok Kerja Guru Madrasah Ibtidaiyah Kecamatan Talang.",
};

async function getProfilSettings() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return {};
  try {
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ['key', 'value']);
    const rows = await sheet.getRows();
    const settings: Record<string, string> = {};
    rows.forEach(r => {
      const key = r.get('key');
      if (key) settings[key] = r.get('value') || "";
    });
    return settings;
  } catch (e) {
    return {};
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

export default async function ProfilPage() {
  const [profilSettings, pengurusData] = await Promise.all([
    getProfilSettings(),
    getPengurus(),
  ]);

  const siteName = profilSettings.site_name || "KKM - KKG MI TALANG";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <main className="flex-grow pt-20">
        {/* HEADER SECTION */}
        <section className="w-full bg-emerald-700 py-24 px-4 sm:px-6 relative overflow-hidden">
          {/* Subtle Background Pattern/Glow */}
          <div className="absolute inset-0 bg-emerald-800/30"></div>
          
          <div className="max-w-5xl mx-auto relative z-10 text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Profil {siteName}
            </h1>
            <p className="text-lg md:text-xl text-emerald-50 max-w-3xl mx-auto font-medium leading-relaxed">
              Mengenal lebih dekat visi, misi, dan struktur organisasi Kelompok Kerja Guru Madrasah Ibtidaiyah Kec. Talang.
            </p>
          </div>
        </section>

        {/* TENTANG KAMI SECTION (Split Layout) */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
            {/* Left Side: Image */}
            <div className="w-full md:w-5/12 min-h-[300px] bg-slate-200 relative">
              <img 
                src="/uplods/KKG-KKM.png" 
                alt="Tentang Kami" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            
            {/* Right Side: Content */}
            <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-6">Tentang Kami</h2>
              <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                {profilSettings.profil_tentang || "Informasi profil belum diatur oleh admin."}
              </div>
            </div>
          </div>
        </section>

        {/* VISI & MISI SECTION */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-24">
          {profilSettings.profil_misi_utama && (
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug">
                "{profilSettings.profil_misi_utama}"
              </h3>
              <div className="w-24 h-1 bg-emerald-500 mx-auto mt-6 rounded-full"></div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-emerald-100 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700 -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-2xl font-bold text-emerald-800 mb-6 relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-emerald-700 font-black">V</span>
                </div>
                Visi
              </h3>
              <div className="text-slate-700 leading-relaxed relative z-10 whitespace-pre-wrap text-lg">
                {profilSettings.profil_visi || "-"}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-blue-100 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700 -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-2xl font-bold text-blue-800 mb-6 relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-blue-700 font-black">M</span>
                </div>
                Misi
              </h3>
              <div className="text-slate-700 leading-relaxed relative z-10 whitespace-pre-wrap text-lg">
                {profilSettings.profil_misi || "-"}
              </div>
            </div>
          </div>
        </section>

        {/* STRUKTUR ORGANISASI SECTION */}
        <section className="w-full bg-white py-24 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Kepengurusan</h2>
              <h3 className="text-4xl font-extrabold text-slate-800">Struktur Organisasi</h3>
            </div>

            {pengurusData.length > 0 ? (
              <div className="flex flex-col items-center max-w-5xl mx-auto relative">
                {/* Garis Vertikal Tengah (Bagan) */}
                <div className="hidden lg:block absolute top-[120px] bottom-0 left-1/2 w-0.5 bg-slate-200 -translate-x-1/2 z-0" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 w-full justify-items-center">
                  {pengurusData.map((p, idx) => {
                    const isTopLevel = idx === 0 && p.order === 1;
                    return (
                      <div key={p.id} className={`bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center w-full max-w-xs relative group ${isTopLevel ? 'md:col-span-2 lg:col-span-3 mb-12' : ''}`}>
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-emerald-50 bg-slate-100 shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Users className="w-12 h-12" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 line-clamp-2 leading-tight">{p.name}</h4>
                        <p className="text-sm font-bold text-emerald-600 mt-2 uppercase tracking-wide bg-emerald-50 px-3 py-1 rounded-full">{p.role}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 border-dashed max-w-3xl mx-auto">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <p className="text-slate-500 font-medium text-lg">Struktur kepengurusan belum ditambahkan.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
