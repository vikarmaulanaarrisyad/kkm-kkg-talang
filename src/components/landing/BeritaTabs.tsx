"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Newspaper, Clock } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  created_at: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
}

interface BeritaTabsProps {
  news: NewsItem[];
  categories: Category[];
}

export default function BeritaTabs({ news, categories }: BeritaTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("Semua");

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  const filteredNews = activeTab === "Semua" 
    ? news 
    : news.filter(item => (item.category || 'Umum') === activeTab);

  return (
    <div className="w-full">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10 pb-2 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("Semua")}
          className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === "Semua" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"}`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.name)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === cat.name ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* News Grid */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((item) => (
            <Link href={`/berita/${item.slug}`} key={item.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 hover:border-emerald-200 flex flex-col h-full transform hover:-translate-y-2">
              <div className="w-full h-56 relative overflow-hidden bg-slate-50">
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-slate-200" />
                  </div>
                )}
                <div className="absolute top-4 left-4 z-20 bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                  {item.category || "Umum"}
                </div>
              </div>
              
              <div className="p-6 sm:p-8 flex flex-col flex-1 relative bg-white">
                <div className="flex items-center text-xs font-semibold text-slate-500 mb-4 gap-2">
                  <span className="flex items-center gap-1.5 text-emerald-600"><Calendar className="w-3.5 h-3.5" /> {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">{item.title}</h3>
                
                <p className="text-slate-600 line-clamp-3 mb-6 flex-1 text-sm leading-relaxed">
                  {stripHtml(item.content)}
                </p>
                
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="inline-flex items-center text-slate-700 font-bold text-sm group-hover:text-emerald-600 transition-colors">
                    Baca Selengkapnya 
                    <div className="ml-2 w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                      <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
            <Newspaper className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada berita</h3>
          <p className="text-slate-500">Kategori ini masih kosong, silakan cek kategori lainnya.</p>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
