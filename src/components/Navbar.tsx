"use client";

import Link from "next/link";
import { BookOpen, LogIn, Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar({ siteName = "KKM & KKG" }: { siteName?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-madrasah-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-madrasah-50 p-1.5 rounded-lg group-hover:bg-gold-400 transition-colors">
                <BookOpen className="w-6 h-6 text-madrasah-800" />
              </div>
              <span className="font-bold text-xl tracking-tight text-madrasah-50 group-hover:text-gold-400 transition-colors">
                {siteName}
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-madrasah-100 hover:text-white hover:underline decoration-gold-400 underline-offset-4 font-medium transition-all">
              Beranda
            </Link>
            <Link href="/berita" className="text-madrasah-100 hover:text-white hover:underline decoration-gold-400 underline-offset-4 font-medium transition-all">
              Berita
            </Link>
            <Link href="/tentang" className="text-madrasah-100 hover:text-white hover:underline decoration-gold-400 underline-offset-4 font-medium transition-all">
              Tentang Kami
            </Link>
            <Link 
              href="/login" 
              className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-madrasah-900 px-4 py-2 rounded-full font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <LogIn className="w-4 h-4" />
              Login Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-madrasah-100 hover:text-white focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-madrasah-900 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-madrasah-700">
            Beranda
          </Link>
          <Link href="/berita" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-madrasah-700">
            Berita
          </Link>
          <Link href="/tentang" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-madrasah-700">
            Tentang Kami
          </Link>
          <Link href="/login" className="block px-3 py-2 mt-4 text-center rounded-md text-base font-bold bg-gold-500 text-madrasah-900 hover:bg-gold-400">
            Login Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
