import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

// Pages - Public
import LandingPage from '@/pages/LandingPage';
import Funcionalidades from '@/pages/Funcionalidades';
import Precos from '@/pages/Precos';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import RecuperarSenha from '@/pages/RecuperarSenha';

// Pages - Dashboard (Protected)
import Dashboard from '@/pages/Dashboard';
import Eventos from '@/pages/Eventos';
import NovoEvento from '@/pages/NovoEvento';
import EditarEvento from '@/pages/EditarEvento';
import Clientes from '@/pages/Clientes';
import NovoCliente from '@/pages/NovoCliente';
import Pagamentos from '@/pages/Pagamentos';
import Galeria from '@/pages/Galeria';
import Configuracoes from '@/pages/Configuracoes';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#4A9B6E] border-r-transparent"></div>
          <p className="mt-4 text-[#6E6E73]">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas - Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/funcionalidades" element={<Funcionalidades />} />
          <Route path="/precos" element={<Precos />} />
          
          {/* Rotas Públicas - Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          
          {/* Rotas Privadas - Dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          
          {/* Rotas Privadas - Eventos */}
          <Route path="/eventos" element={<PrivateRoute><Eventos /></PrivateRoute>} />
          <Route path="/eventos/novo" element={<PrivateRoute><NovoEvento /></PrivateRoute>} />
          <Route path="/eventos/editar/:id" element={<PrivateRoute><EditarEvento /></PrivateRoute>} />
          
          {/* Rotas Privadas - Clientes */}
          <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
          <Route path="/clientes/novo" element={<PrivateRoute><NovoCliente /></PrivateRoute>} />
          
          {/* Rotas Privadas - Outras */}
          <Route path="/pagamentos" element={<PrivateRoute><Pagamentos /></PrivateRoute>} />
          <Route path="/galeria" element={<PrivateRoute><Galeria /></PrivateRoute>} />
          <Route path="/configuracoes" element={<PrivateRoute><Configuracoes /></PrivateRoute>} />
          
          {/* Redirect para home se rota não existir */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster position="top-right" />
        <PWAInstallPrompt />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
