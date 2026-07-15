"use client";

import Link from "next/link";
import { BookOpen, LogIn, Menu } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar({ siteName = "KKM & KKG MI TALANG" }: { siteName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm text-slate-700" : "bg-transparent text-slate-700"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-emerald-50 p-2 rounded-xl group-hover:bg-emerald-100 transition-colors border border-emerald-100">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-800 group-hover:text-emerald-600 transition-colors">
                {siteName}
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-slate-600 hover:text-emerald-600 font-semibold transition-colors">
              Beranda
            </Link>
            <Link href="/profil" className="text-slate-600 hover:text-emerald-600 font-semibold transition-colors">
              Profil
            </Link>
            <Link href="/berita" className="text-slate-600 hover:text-emerald-600 font-semibold transition-colors">
              Berita
            </Link>
            <Link href="/agenda" className="text-slate-600 hover:text-emerald-600 font-semibold transition-colors">
              Agenda
            </Link>
            <Link href="/#unduhan" className="text-slate-600 hover:text-emerald-600 font-semibold transition-colors">
              Unduhan
            </Link>
            <Link href="/kontak" className="text-slate-600 hover:text-emerald-600 font-semibold transition-colors">
              Hubungi Kami
            </Link>

            {/* Aplikasi Dropdown Desktop */}
            <div className="relative group h-full flex items-center">
              <button className="flex items-center gap-1 text-slate-600 hover:text-emerald-600 font-semibold transition-colors focus:outline-none py-2">
                Aplikasi
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden transform origin-top scale-95 group-hover:scale-100">
                  <div className="py-2">
                    <Link href="/aplikasi/generator-soal" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                      Generator Soal MI
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="pl-4 border-l border-slate-200">
              <Link
                href="/login"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-emerald-600 focus:outline-none p-2"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white px-4 pt-4 pb-6 space-y-2 border-b border-slate-100 shadow-xl absolute w-full left-0 top-full">
          <Link href="/" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600">
            Beranda
          </Link>
          <Link href="/profil" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600">
            Profil
          </Link>
          <Link href="/berita" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600">
            Berita
          </Link>
          <Link href="/agenda" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600">
            Agenda
          </Link>
          <Link href="/#unduhan" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600">
            Unduhan
          </Link>
          <Link href="/kontak" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600">
            Hubungi Kami
          </Link>
          
          <div className="pt-2 pb-1 border-t border-slate-50 mt-2">
            <span className="block px-3 py-1.5 text-xs font-bold text-emerald-600/70 uppercase tracking-wider">Aplikasi</span>
            <Link href="/aplikasi/generator-soal" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 pl-4 border-l-2 border-transparent hover:border-emerald-500 transition-colors">
              Generator Soal MI
            </Link>
          </div>

          <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-3 py-3 mt-4 w-full text-center rounded-xl text-base font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm">
            <LogIn className="w-4 h-4" />
            Login Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
