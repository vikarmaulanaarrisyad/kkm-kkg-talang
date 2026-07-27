import { BookOpen, ArrowLeft, Calendar, User, Tag } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const sop = await (prisma as any).wikiSOP.findUnique({
    where: { slug: params.slug }
  });

  if (!sop) return { title: "Tidak Ditemukan - KKM KKG" };

  return {
    title: `${sop.title} | Pusat Pengetahuan`,
    description: sop.content.substring(0, 150),
  };
}

export default async function WikiDetailPage({ params }: { params: { slug: string } }) {
  const sop = await (prisma as any).wikiSOP.findUnique({
    where: { slug: params.slug }
  });

  if (!sop) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-32 pb-20 relative z-20">
        <Link href="/wiki" className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Pusat Pengetahuan
        </Link>
        
        <article className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
          <div className="mb-8 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                {sop.category}
              </span>
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(sop.updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {sop.author_name}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {sop.title}
            </h1>
          </div>

          <div className="prose prose-slate prose-emerald max-w-none prose-headings:font-bold prose-a:text-emerald-600 hover:prose-a:text-emerald-700">
            <ReactMarkdown>{sop.content}</ReactMarkdown>
          </div>
        </article>
      </main>

    </div>
  );
}
