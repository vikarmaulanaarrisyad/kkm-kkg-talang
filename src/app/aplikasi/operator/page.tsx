import prisma from "@/lib/prisma";
import { AppWindow, Database, Globe, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Perkumpulan Aplikasi Operator - KKM KKG Talang",
  description: "Daftar seluruh aplikasi dan tautan sistem informasi bagi operator",
};

export default async function AplikasiOperatorPage() {
  const linkOperators = await prisma.linkOperator.findMany({
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/#aplikasi-operator" className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Semua Aplikasi Operator</h1>
            <p className="mt-4 text-slate-600 text-lg max-w-2xl">
              Berikut adalah daftar lengkap seluruh tautan sistem informasi, portal web, dan aplikasi yang sering digunakan oleh operator madrasah.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {linkOperators.length > 0 ? (
              linkOperators.map((link: any) => {
                let IconComponent = Globe;
                let colorClass = "text-blue-600";
                let bgClass = "bg-blue-50";
                let borderClass = "border-blue-100";

                switch(link.icon_type) {
                  case 'AppWindow':
                    IconComponent = AppWindow;
                    colorClass = "text-emerald-600"; bgClass = "bg-emerald-50"; borderClass = "border-emerald-100";
                    break;
                  case 'Database':
                    IconComponent = Database;
                    colorClass = "text-purple-600"; bgClass = "bg-purple-50"; borderClass = "border-purple-100";
                    break;
                  case 'Globe':
                  default:
                    IconComponent = Globe;
                    colorClass = "text-indigo-600"; bgClass = "bg-indigo-50"; borderClass = "border-indigo-100";
                    break;
                }

                return (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex flex-col bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${bgClass} ${colorClass} border ${borderClass} group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">{link.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-auto">
                      {link.url}
                    </p>
                  </a>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
                <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-lg text-slate-600 font-medium">Belum ada tautan aplikasi yang ditambahkan.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
