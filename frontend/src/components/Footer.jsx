import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Instagram, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produto: [
      { label: 'Funcionalidades', path: '/funcionalidades' },
      { label: 'Preços', path: '/precos' },
      { label: 'App Mobile (PWA)', path: '/funcionalidades#mobile' },
    ],
    suporte: [
      { label: 'FAQ', path: '/precos#faq' },
      { label: 'Contato', href: 'mailto:contato@fotiva.app' },
      { label: 'Status', href: '#' },
    ],
    legal: [
      { label: 'Termos de Uso', href: '#' },
      { label: 'Privacidade', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-[#1A1A2E] text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#4A9B6E] rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FOTIVA</span>
            </Link>
            <p className="text-[#9CA3AF] text-sm leading-relaxed mb-6 max-w-xs">
              A plataforma completa para fotógrafos profissionais gerenciarem seus negócios com eficiência.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#4A9B6E] transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Produto */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/80">
              Produto
            </h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-[#9CA3AF] hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/80">
              Suporte
            </h4>
            <ul className="space-y-3">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  {link.path ? (
                    <Link
                      to={link.path}
                      className="text-[#9CA3AF] hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-[#9CA3AF] hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/80">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[#9CA3AF] hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#9CA3AF] text-sm">
            © {currentYear} FOTIVA. Todos os direitos reservados.
          </p>
          <a
            href="mailto:contato@fotiva.app"
            className="flex items-center gap-2 text-[#9CA3AF] hover:text-white text-sm transition-colors"
          >
            <Mail className="w-4 h-4" />
            contato@fotiva.app
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
