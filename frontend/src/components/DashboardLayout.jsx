import React, { useState } from 'react';
import Sidebar from './Sidebar';
import VoiceChatbot from './VoiceChatbot';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64 overflow-y-auto">
        {/* Mobile Header com botão de menu */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#4A9B6E] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">F</span>
            </div>
            <span className="font-bold text-[#1D1D1F]">FOTIVA</span>
          </div>
        </div>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>

      {/* Voice Chatbot */}
      <VoiceChatbot />
    </div>
  );
};

export default DashboardLayout;
