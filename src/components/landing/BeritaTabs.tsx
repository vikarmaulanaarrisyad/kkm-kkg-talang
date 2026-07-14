"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";

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
      <div className="flex flex-wrap items-center gap-2 mb-10 pb-2 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("Semua")}
          className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "Semua" ? "bg-madrasah-700 text-white shadow-md" : "bg-madrasah-50 text-madrasah-700 hover:bg-madrasah-100 border border-madrasah-100"}`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.name)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === cat.name ? "bg-madrasah-700 text-white shadow-md" : "bg-madrasah-50 text-madrasah-700 hover:bg-madrasah-100 border border-madrasah-100"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* News Grid */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredNews.map((item) => (
            <Link href={`/berita/${item.slug}`} key={item.id} className="group bg-madrasah-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-madrasah-100 flex flex-col h-full transform hover:-translate-y-1">
              <div className="w-full h-56 relative overflow-hidden bg-madrasah-200">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-madrasah-400" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-gold-500 text-madrasah-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {item.category || "Umum"}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center text-sm text-gray-500 mb-3 gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <h3 className="text-xl font-bold text-madrasah-900 mb-3 line-clamp-2 group-hover:text-madrasah-700 transition-colors">{item.title}</h3>
                <p className="text-gray-600 line-clamp-3 mb-4 flex-1 text-sm">
                  {stripHtml(item.content)}
                </p>
                <div className="mt-auto pt-4 border-t border-madrasah-200 text-madrasah-700 font-semibold flex items-center text-sm">
                  Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-madrasah-50 rounded-2xl border border-madrasah-100">
          <Newspaper className="w-12 h-12 text-madrasah-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Belum ada berita di kategori ini.</p>
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
