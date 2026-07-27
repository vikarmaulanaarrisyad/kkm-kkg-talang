"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, User, Clock, ArrowLeft, MoreVertical } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function DiskusiDetail({ id, basePath }: { id: string, basePath: string }) {
  const [topic, setTopic] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/diskusi/${id}`);
      const json = await res.json();
      if (res.ok) {
        setTopic(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/diskusi/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent })
      });
      const json = await res.json();
      
      if (res.ok) {
        setReplyContent("");
        fetchDetail();
      } else {
        Swal.fire('Gagal', json.error, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Gagal mengirim balasan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-800">Topik tidak ditemukan</h2>
        <Link href={basePath} className="text-emerald-600 hover:underline mt-4 inline-block">Kembali ke Forum</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <Link href={basePath} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Diskusi
      </Link>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="flex items-start gap-4 mb-6">
          <div className="shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">
            {topic.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-snug">{topic.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{topic.author_name}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="uppercase text-[10px] tracking-wide font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">{topic.author_role}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>{formatDate(topic.created_at)}</span>
            </div>
          </div>
        </div>
        
        <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap mb-8 pb-8 border-b border-slate-100">
          {topic.content}
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            {topic.replies?.length || 0} Balasan
          </h3>

          <div className="space-y-4">
            {topic.replies?.map((reply: any) => (
              <div key={reply.id} className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex gap-4">
                <div className="shrink-0 w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                  {reply.author_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-800">{reply.author_name}</span>
                    <span className="uppercase text-[10px] tracking-wide font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">{reply.author_role}</span>
                    <span className="text-xs text-slate-400 ml-auto">{formatDate(reply.created_at)}</span>
                  </div>
                  <div className="text-slate-700 text-sm whitespace-pre-wrap">
                    {reply.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleReply} className="mt-8 relative">
            <textarea
              rows={4}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Tulis balasan atau solusi Anda..."
              className="w-full rounded-xl border border-slate-300 p-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors resize-none pr-14"
              required
            ></textarea>
            <button
              type="submit"
              disabled={isSubmitting || !replyContent.trim()}
              className="absolute bottom-4 right-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white p-2.5 rounded-lg transition-colors shadow-sm"
            >
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
