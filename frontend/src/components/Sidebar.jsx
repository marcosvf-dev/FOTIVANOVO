import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  DollarSign, 
  Image, 
  Settings,
  LogOut,
  Camera,
  Megaphone
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/eventos', icon: Calendar, label: 'Eventos' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/pagamentos', icon: DollarSign, label: 'Pagamentos' },
    { path: '/galeria', icon: Image, label: 'Galeria' },
    { path: '/novidades', icon: Megaphone, label: 'Novidades' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white w-64 z-50
          border-r border-gray-100 shadow-lg
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4A9B6E] rounded-xl flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1D1D1F]">FOTIVA</h2>
                  <p className="text-xs text-[#6E6E73]">Gestão Fotográfica</p>
                </div>
              </div>
              {/* Botão fechar (mobile) */}
              <button
                onClick={onClose}
                className="lg:hidden text-[#6E6E73] hover:text-[#1D1D1F] p-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-[#4A9B6E] text-white shadow-md'
                            : 'text-[#6E6E73] hover:bg-[#E8F5EE] hover:text-[#4A9B6E]'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.label === 'Novidades' && (
                        <span className="ml-auto bg-[#4A9B6E] text-white text-xs px-2 py-0.5 rounded-full group-[.active]:bg-white group-[.active]:text-[#4A9B6E]">
                          Novo
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section & Logout */}
          <div className="p-4 border-t border-gray-100">
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-[#F5F5F7] rounded-xl">
                <div className="w-10 h-10 bg-[#4A9B6E] rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1D1D1F] truncate">{user.name || 'Usuário'}</p>
                  <p className="text-xs text-[#6E6E73] truncate">{user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#6E6E73] hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
