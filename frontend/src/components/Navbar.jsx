import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Camera } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/funcionalidades', label: 'Funcionalidades' },
    { path: '/precos', label: 'Preços' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="navbar-logo">
            <div className="w-9 h-9 bg-[#4A9B6E] rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span 
              className="text-xl font-bold text-[#1D1D1F]"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, sans-serif' }}
            >
              FOTIVA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`navbar-link-${link.label.toLowerCase()}`}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-[#4A9B6E]'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              data-testid="navbar-login-btn"
              className="text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors px-4 py-2"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              data-testid="navbar-register-btn"
              className="bg-[#4A9B6E] text-white hover:bg-[#3D8B5E] rounded-full px-6 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Começar grátis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#6E6E73] hover:text-[#1D1D1F]"
            data-testid="navbar-mobile-toggle"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg" data-testid="navbar-mobile-menu">
          <nav className="px-6 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-3 text-base font-medium ${
                  isActive(link.path)
                    ? 'text-[#4A9B6E]'
                    : 'text-[#6E6E73]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center py-3 text-base font-medium text-[#6E6E73]"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-[#4A9B6E] text-white text-center rounded-full py-3 text-base font-semibold"
              >
                Começar grátis
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
