import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const Agenda = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  useEffect(() => { fetchEventos(); }, []);

  const fetchEventos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEventos(response.data);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventosNoDia = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return eventos.filter(ev => {
      const d = new Date(ev.event_date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const handleDayClick = (day) => {
    const evs = getEventosNoDia(day);
    setSelectedDay(day);
    setSelectedEvents(evs);
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Calcular dias do mês
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1">Visualize seus eventos no calendário</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Cabeçalho navegação */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {MESES[month]} {year}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid de dias */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="h-16 border-b border-r border-gray-50" />;

                const eventsOnDay = getEventosNoDia(day);
                const hasEvents = eventsOnDay.length > 0;
                const isToday = isCurrentMonth && today.getDate() === day;
                const isSelected = selectedDay === day;

                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`h-16 border-b border-r border-gray-50 p-1 cursor-pointer transition-colors relative
                      ${isSelected ? 'bg-[#4A9B6E]/10' : 'hover:bg-gray-50'}
                    `}
                  >
                    {/* Número do dia */}
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mx-auto
                      ${isToday ? 'bg-[#4A9B6E] text-white' : 'text-gray-700'}
                    `}>
                      {day}
                    </div>

                    {/* X vermelho se tem evento */}
                    {hasEvents && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative mt-4">
                          {/* X vermelho */}
                          <svg width="20" height="20" viewBox="0 0 20 20" className="text-red-500 opacity-80">
                            <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                            <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                          {eventsOnDay.length > 1 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                              {eventsOnDay.length}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="p-4 border-t border-gray-100 flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#4A9B6E] rounded-full flex items-center justify-center text-white text-xs font-bold">H</div>
                <span>Hoje</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 20 20" className="text-red-500">
                  <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <span>Dia ocupado</span>
              </div>
            </div>
          </div>

          {/* Painel lateral - detalhes do dia */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {selectedDay ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedDay} de {MESES[month]}
                </h3>
                {selectedEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Dia livre!</p>
                    <p className="text-gray-400 text-xs mt-1">Nenhum evento nesta data</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedEvents.map(ev => {
                      const d = new Date(ev.event_date);
                      return (
                        <div key={ev.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="font-semibold text-gray-900 text-sm">{ev.event_type}</span>
                          </div>
                          <div className="space-y-2">
                            {ev.client_name && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <User size={13} className="text-gray-400" />
                                <span>{ev.client_name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Clock size={13} className="text-gray-400" />
                              <span>{d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {ev.location && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin size={13} className="text-gray-400" />
                                <span className="truncate">{ev.location}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <span className="text-xs font-medium text-red-600">🔴 Data ocupada</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Selecione um dia</p>
                <p className="text-gray-400 text-xs mt-1">Clique em uma data para ver os eventos</p>
              </div>
            )}

            {/* Resumo do mês */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Resumo de {MESES[month]}</h4>
              {eventos.filter(ev => {
                const d = new Date(ev.event_date);
                return d.getFullYear() === year && d.getMonth() === month;
              }).length === 0 ? (
                <p className="text-xs text-gray-400">Sem eventos este mês</p>
              ) : (
                <div className="space-y-2">
                  {eventos
                    .filter(ev => {
                      const d = new Date(ev.event_date);
                      return d.getFullYear() === year && d.getMonth() === month;
                    })
                    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                    .map(ev => (
                      <div key={ev.id} className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-500">{new Date(ev.event_date).getDate()}/{month+1}</span>
                        <span className="text-gray-700 font-medium truncate">{ev.event_type}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Agenda;
