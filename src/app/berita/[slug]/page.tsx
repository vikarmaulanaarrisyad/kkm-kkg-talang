import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

async function getNewsBySlug(slug: string) {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return null;
  
  try {
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Berita", ['id', 'title', 'slug', 'content', 'image_url', 'author', 'status', 'created_at', 'category']);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('slug') === slug && r.get('status') === 'Published');
    
    if (!row) return null;

    return {
      id: row.get('id'),
      title: row.get('title'),
      slug: row.get('slug'),
      content: row.get('content') || '',
      image_url: row.get('image_url'),
      author: row.get('author'),
      created_at: row.get('created_at'),
      category: row.get('category') || 'Umum'
    };
  } catch (error) {
    console.error("Gagal mengambil berita", error);
    return null;
  }
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  // Create a nice avatar initals
  const authorInitials = (news.author || "Admin").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-white font-sans pb-24">
      <div className="pt-24 md:pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link 
          href="/berita" 
          className="inline-flex items-center text-sm font-semibold text-madrasah-600 hover:text-madrasah-800 mb-10 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Berita
        </Link>

        {/* Header Section */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-bold text-madrasah-700 tracking-widest uppercase">
              {news.category}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span className="text-sm text-gray-500 font-medium">
              {new Date(news.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-8">
            {news.title}
          </h1>

          {/* Author Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-gray-100 py-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-madrasah-700 font-bold text-lg">
                {authorInitials}
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{news.author || "Administrator"}</p>
                <p className="text-sm text-gray-500">Tim Redaksi KKM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-600 rounded-full text-sm font-bold transition-colors">
                <Share2 className="w-4 h-4" /> Bagikan
              </button>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        {news.image_url && (
          <figure className="mb-12">
            <div className="w-full rounded-2xl overflow-hidden bg-gray-50">
              <img 
                src={news.image_url} 
                alt={news.title} 
                className="w-full h-auto max-h-[600px] object-cover"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-gray-400 italic font-medium">
              Ilustrasi: {news.title}
            </figcaption>
          </figure>
        )}

        {/* Article Content */}
        <div className="prose-content w-full">
          <div dangerouslySetInnerHTML={{ __html: news.content }} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .prose-content {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.8;
          color: #1f2937;
          font-size: 1.125rem;
        }
        @media (min-width: 768px) {
          .prose-content {
            font-size: 1.25rem;
          }
        }
        .prose-content p {
          margin-bottom: 1.75em;
        }
        .prose-content h1, .prose-content h2, .prose-content h3, .prose-content h4 {
          font-weight: 800;
          color: #111827;
          margin-top: 2em;
          margin-bottom: 0.75em;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }
        .prose-content h2 { font-size: 1.875em; }
        .prose-content h3 { font-size: 1.5em; }
        .prose-content ul { 
          list-style-type: none; 
          margin-left: 0; 
          margin-bottom: 1.75em; 
          padding-left: 1.25em;
        }
        .prose-content ul li {
          position: relative;
          margin-bottom: 0.75em;
          padding-left: 0.5em;
        }
        .prose-content ul li::before {
          content: "";
          position: absolute;
          left: -1em;
          top: 0.6em;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #15803d;
        }
        .prose-content ol { 
          list-style-type: decimal; 
          margin-left: 1.5em; 
          margin-bottom: 1.75em; 
        }
        .prose-content ol li::marker {
          font-weight: 700;
          color: #15803d;
        }
        .prose-content li { margin-bottom: 0.75em; }
        .prose-content blockquote {
          border-left: 4px solid #15803d;
          font-style: italic;
          color: #374151;
          background: #f0fdf4;
          padding: 1.5em 2em;
          border-radius: 0 1rem 1rem 0;
          margin: 2.5em 0;
        }
        .prose-content a { 
          color: #15803d; 
          text-decoration: none; 
          font-weight: 600;
          border-bottom: 2px solid #bbf7d0;
          transition: all 0.2s;
        }
        .prose-content a:hover {
          background-color: #bbf7d0;
          color: #166534;
        }
        .prose-content img {
          border-radius: 1rem;
          margin: 2.5em auto;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          width: 100%;
          height: auto;
        }
      `}} />
    </div>
  );
}
