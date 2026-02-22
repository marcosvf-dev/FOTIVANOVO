import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Megaphone, Plus, Lock } from 'lucide-react';

const Novidades = () => {
  const [anuncios, setAnuncios] = useState([]);

  useEffect(() => {
    // Futuramente carregará anúncios do backend
    setAnuncios([]);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novidades</h1>
            <p className="text-gray-600 mt-1">Anúncios e novidades da comunidade FOTIVA</p>
          </div>
        </div>

        {/* Banner principal - Anuncie aqui */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4A9B6E] to-[#2d6e4a] p-8 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-3">Anuncie Aqui!</h2>
              <p className="text-white/90 text-lg mb-2">
                Alcance fotógrafos de todo o Brasil diretamente no FOTIVA.
              </p>
              <p className="text-white/75 text-sm mb-6">
                Equipamentos, cursos, estúdios, serviços — seu anúncio visto por quem realmente importa.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button
                  onClick={() => window.open('mailto:contato@fotiva.com.br?subject=Quero anunciar no FOTIVA', '_blank')}
                  className="inline-flex items-center gap-2 bg-white text-[#4A9B6E] px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-md"
                >
                  <Megaphone className="w-5 h-5" />
                  Quero Anunciar
                </button>
                <button
                  onClick={() => window.open('https://wa.me/5500000000000?text=Olá! Quero anunciar no FOTIVA', '_blank')}
                  className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
                >
                  Falar pelo WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de benefícios */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🎯', title: 'Público Segmentado', desc: 'Fotógrafos profissionais e amadores ativos no app' },
            { icon: '📱', title: 'Mobile First', desc: 'Anúncios vistos direto no celular dos fotógrafos' },
            { icon: '💰', title: 'Custo Acessível', desc: 'Planos flexíveis para todos os tamanhos de negócio' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Área de anúncios (vazia por enquanto) */}
        {anuncios.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Espaço reservado para anúncios</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Em breve os primeiros anúncios estarão aqui. Seja um dos primeiros a anunciar!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {anuncios.map((anuncio, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <img src={anuncio.image} alt={anuncio.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{anuncio.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{anuncio.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Novidades;
