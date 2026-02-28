import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { TrendingUp, Calendar, Image, DollarSign } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMetrics(); }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`);
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#4A9B6E] border-r-transparent"></div>
      </div>
    </DashboardLayout>
  );

  // Ordenar eventos por data (mais próximo primeiro)
  const sortedEvents = [...(metrics?.upcoming_events || [])].sort((a, b) => {
    return new Date(a.event_date) - new Date(b.event_date);
  });

  const metricCards = [
    { title: 'Faturamento Mensal', value: `R$ ${(metrics?.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, trend: '+0% no mês anterior', color: 'bg-[#E8F5E9]', iconColor: 'text-[#4A9B6E]' },
    { title: 'Eventos Confirmados', value: metrics?.total_events || 0, icon: Calendar, trend: 'Próximos 30 dias', color: 'bg-blue-50', iconColor: 'text-blue-600' },
    { title: 'Fotos Entregues', value: 0, icon: Image, trend: 'Este mês', color: 'bg-purple-50', iconColor: 'text-purple-600' },
    { title: 'Pagamentos Pendentes', value: `R$ ${(metrics?.pending_payments || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, trend: `${metrics?.total_clients || 0} clientes`, color: 'bg-orange-50', iconColor: 'text-orange-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#111827]">Dashboard</h1>
          <p className="mt-1 text-[#6B7280]">Visão geral do seu negócio</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-[#6B7280] mb-2">{metric.title}</p>
                    <p className="text-2xl font-semibold text-[#111827]">{metric.value}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <TrendingUp size={14} className="text-[#4A9B6E]" />
                      <span>{metric.trend}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center`}>
                    <Icon size={24} className={metric.iconColor} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Próximos Eventos - ordenados por data */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-[#111827]">Próximos Eventos</h2>
            <p className="text-sm text-[#6B7280]">Do mais próximo ao mais distante</p>
          </div>

          {sortedEvents.length > 0 ? (
            <div className="space-y-3">
              {sortedEvents.map((event, index) => {
                const eventDate = new Date(event.event_date);
                const now = new Date();
                const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
                const isToday = diffDays === 0;
                const isTomorrow = diffDays === 1;
                const isUrgent = diffDays <= 3;

                return (
                  <div key={event.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${isToday ? 'border-red-300 bg-red-50' : isUrgent ? 'border-orange-200 bg-orange-50' : 'border-gray-100 hover:border-[#4A9B6E]/20'}`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isToday ? 'bg-red-100' : isUrgent ? 'bg-orange-100' : 'bg-[#E8F5E9]'}`}>
                      <Calendar size={20} className={isToday ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-[#4A9B6E]'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[#111827] truncate">{event.event_type}</h3>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {event.client_name && <span className="font-medium">{event.client_name} · </span>}
                        {event.location || 'Local não definido'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-[#111827]">
                        {eventDate.toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {isToday ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Hoje!</span>
                      ) : isTomorrow ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Amanhã</span>
                      ) : diffDays <= 7 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Em {diffDays}d</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#4A9B6E]">{event.status}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-[#6B7280]">Nenhum evento agendado</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
