"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Plus, Search, Trash2, User, Clock, ArrowRight, MessageSquare } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DiskusiList({ basePath, role }: { basePath: string, role: string }) {
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/diskusi");
      const json = await res.json();
      if (res.ok) {
        setTopics(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleCreateTopic = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Buat Topik Diskusi Baru',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Judul Topik (Singkat & Jelas)" style="width:80%">' +
        '<textarea id="swal-input2" class="swal2-textarea" placeholder="Deskripsikan kendala atau pertanyaan Anda..." style="width:80%; height:150px;"></textarea>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Posting Topik',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#059669', // emerald-600
      preConfirm: () => {
        const title = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const content = (document.getElementById('swal-input2') as HTMLTextAreaElement).value;
        if (!title || !content) {
          Swal.showValidationMessage('Judul dan Konten wajib diisi!');
          return false;
        }
        return { title, content };
      }
    });

    if (formValues) {
      try {
        Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await fetch('/api/diskusi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues)
        });
        const json = await res.json();
        
        if (res.ok) {
          Swal.fire({ title: 'Berhasil', text: 'Topik berhasil diposting', icon: 'success' });
          fetchTopics();
        } else {
          Swal.fire({ title: 'Gagal', text: json.error, icon: 'error' });
        }
      } catch (error) {
        Swal.fire({ title: 'Error', text: 'Terjadi kesalahan sistem', icon: 'error' });
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: 'Hapus Diskusi?',
      text: `Anda yakin ingin menghapus topik "${title}" beserta seluruh balasannya?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/diskusi/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (res.ok) {
          Swal.fire('Terhapus!', 'Diskusi berhasil dihapus.', 'success');
          fetchTopics();
        } else {
          Swal.fire('Gagal', json.error, 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
      }
    }
  };

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-linear-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-sm shrink-0">
              <MessageSquare className="w-8 h-8 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Forum Diskusi & FAQ</h1>
              <p className="text-emerald-100 text-sm mt-1">Tanya jawab interaktif antar Madrasah dan Guru</p>
            </div>
          </div>
          <button 
            onClick={handleCreateTopic}
            className="bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" /> Buat Topik
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
            placeholder="Cari topik diskusi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">Memuat diskusi...</p>
          </div>
        ) : filteredTopics.length > 0 ? (
          <div className="space-y-4">
            {filteredTopics.map((topic) => (
              <div key={topic.id} className="group border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all bg-white relative">
                {role === 'admin' && (
                  <button onClick={() => handleDelete(topic.id, topic.title)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex shrink-0 w-12 h-12 bg-emerald-100 rounded-full items-center justify-center text-emerald-600 font-bold text-lg">
                    {topic.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 pr-10">
                    <Link href={`${basePath}/${topic.id}`}>
                      <h3 className="text-lg font-bold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1 cursor-pointer">
                        {topic.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {topic.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                        <User className="w-3.5 h-3.5" />
                        <span className="max-w-30 truncate">{topic.author_name}</span>
                        <span className="text-[10px] uppercase bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 ml-1">{topic.author_role}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(topic.created_at)}
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md ml-auto sm:ml-0">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {topic._count?.replies || 0} Balasan
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Tidak ada diskusi ditemukan</h3>
            <p className="mt-1 text-slate-500">Jadilah yang pertama untuk memulai percakapan!</p>
          </div>
        )}
      </div>
    </div>
  );
}
