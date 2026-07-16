"use client";

import React, { useState } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

const faqs = [
  {
    question: "Apa itu portal KKM-KKG MI Talang?",
    answer: "Portal ini adalah wadah silaturahmi, informasi, dan pusat sumber daya digital terpadu bagi seluruh guru dan tenaga kependidikan Madrasah Ibtidaiyah di bawah naungan KKM Kecamatan Talang."
  },
  {
    question: "Bagaimana cara mengakses menu-menu AI Generator?",
    answer: "Fitur AI (seperti Generator Modul Ajar, Soal, ATP, dsb) dapat diakses langsung oleh Bapak/Ibu guru melalui menu 'Aplikasi AI' yang tersedia di situs ini, tanpa perlu registrasi tambahan. Semuanya dirancang gratis untuk membantu meringankan beban administrasi mengajar Anda."
  },
  {
    question: "Siapa yang dapat mengunduh dokumen di Pojok Unduhan?",
    answer: "Seluruh dokumen publik seperti surat edaran Kemenag, template administrasi, atau POS kegiatan dapat diunduh bebas oleh semua pengunjung situs."
  },
  {
    question: "Bagaimana cara saya mendaftar untuk mengikuti kegiatan KKG?",
    answer: "Informasi pendaftaran dan absensi kegiatan biasanya akan diumumkan melalui WhatsApp grup resmi dan tautannya akan ditambahkan pada detail masing-masing agenda di menu 'Agenda'."
  },
  {
    question: "Aplikasi AI mengeluarkan pesan error atau batas kuota habis, apa yang harus dilakukan?",
    answer: "Hal ini terjadi apabila batas maksimal penggunaan harian API gratis dari pusat telah tercapai, atau server Google AI sedang sangat sibuk (High Demand). Silakan coba kembali beberapa saat kemudian atau keesokan harinya."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-20 px-4 bg-white relative border-t border-slate-100">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-sm font-bold mb-4 shadow-sm">
            <MessageCircleQuestion className="w-4 h-4 text-emerald-600" /> FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Pertanyaan yang Sering Diajukan</h2>
          <p className="mt-4 text-slate-600 text-lg">Temukan jawaban cepat untuk pertanyaan umum seputar layanan website KKM-KKG MI Talang.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${isOpen ? 'border-emerald-300 shadow-md bg-emerald-50/20' : 'border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm'}`}
              >
                <button
                  onClick={() => toggleOpen(index)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  <span className={`font-bold text-lg pr-4 ${isOpen ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 shrink-0 ${isOpen ? 'bg-emerald-100 text-emerald-600 rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-slate-600 leading-relaxed border-t border-slate-100 pt-4 pb-5 px-5">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
