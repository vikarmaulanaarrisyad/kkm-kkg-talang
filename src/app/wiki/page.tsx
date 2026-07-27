import { BookOpen, Search } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Pusat Pengetahuan (Wiki & SOP) - KKM KKG Talang",
  description: "Bank Pengetahuan, Panduan, dan SOP Pendataan untuk Operator Madrasah",
};

export default async function WikiPage() {
  const sops = await (prisma as any).wikiSOP.findMany({
    orderBy: { updated_at: 'desc' }
  });

  // Grouping by category for the initial view
  const categorized: Record<string, any[]> = {};
  sops.forEach((sop: any) => {
    if (!categorized[sop.category]) {
      categorized[sop.category] = [];
    }
    categorized[sop.category].push(sop);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      <section className="w-full bg-linear-to-br from-slate-900 to-slate-800 pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center text-white">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <BookOpen className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Pusat Pengetahuan <span className="text-emerald-400">Operator</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
            Temukan berbagai panduan teknis, SOP pendataan, dan solusi dari masalah yang sering terjadi.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 -mt-12 relative z-20 pb-20">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-12">
          {Object.keys(categorized).length > 0 ? (
            <div className="space-y-12">
              {Object.entries(categorized).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                    <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(sop => (
                      <Link key={sop.id} href={`/wiki/${sop.slug}`} className="group block bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all">
                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {sop.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                          {sop.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                          <span>Oleh {sop.author_name}</span>
                          <span>{new Date(sop.updated_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">Belum Ada Panduan</h3>
              <p className="text-slate-500">SOP dan panduan teknis akan segera ditambahkan oleh admin.</p>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
