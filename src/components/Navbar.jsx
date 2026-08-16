import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Events', path: '/events' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Faculty', path: '/faculty' },
  { name: 'Team', path: '/team' },
  { name: 'Contact', path: '/contact' }
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-canvas/80 backdrop-blur-xl border-b border-brand/10">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 md:px-10 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-0.5 group">
          <img src="/logo.png" alt="GFG Logo" className="h-8 w-auto object-contain" />
          <span className="text-lg font-extrabold tracking-tight text-brand uppercase">X KDKCE
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[13px] font-medium uppercase tracking-widest transition-colors duration-200 ${isActive ? 'text-brand' : 'text-brand/60 hover:text-brand'
                  }`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Mobile toggle (CTA removed as requested) */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-brand"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand/10 bg-canvas/95 backdrop-blur-xl h-screen absolute top-full left-0 right-0">
          <nav className="flex flex-col px-6 py-6 gap-1">
            {NAV_LINKS.map((link) => {
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm font-semibold uppercase tracking-widest text-brand/70 hover:text-brand border-b border-brand/5 transition-colors"
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
