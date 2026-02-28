import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, User, Phone, Mail, Edit2, Trash2, X, Save } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCliente, setEditingCliente] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchClientes(); }, []);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(response.data);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setEditForm({ name: cliente.name || '', phone: cliente.phone || '', email: cliente.email || '' });
  };

  const handleEditSave = async () => {
    if (!editForm.name.trim()) { toast.error('O nome é obrigatório'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/clients/${editingCliente.id}`,
        { name: editForm.name.trim(), phone: editForm.phone.trim() || null, email: editForm.email.trim() || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Cliente atualizado!');
      setEditingCliente(null);
      fetchClientes();
    } catch (error) {
      toast.error('Erro ao atualizar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId, clientName) => {
    if (!window.confirm(`Excluir o cliente "${clientName}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cliente excluído!');
      fetchClientes();
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    }
  };

  const filteredClientes = clientes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#4A9B6E] border-r-transparent"></div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">Gerencie sua carteira de clientes</p>
          </div>
          <Link to="/clientes/novo" className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A9B6E] text-white rounded-lg hover:bg-[#3d8259] transition-colors">
            <Plus size={20} /><span>Novo Cliente</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: clientes.length, icon: User, color: 'bg-[#4A9B6E]/10', iconColor: 'text-[#4A9B6E]' },
            { label: 'Com Email', value: clientes.filter(c => c.email).length, icon: Mail, color: 'bg-blue-100', iconColor: 'text-blue-600' },
            { label: 'Com Telefone', value: clientes.filter(c => c.phone).length, icon: Phone, color: 'bg-green-100', iconColor: 'text-green-600' },
          ].map(({ label, value, icon: Icon, color, iconColor }) => (
            <div key={label} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                <Icon className={iconColor} size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A9B6E] focus:border-transparent"
          />
        </div>

        {/* Lista */}
        {filteredClientes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <User className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            {!searchTerm && (
              <Link to="/clientes/novo" className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A9B6E] text-white rounded-lg hover:bg-[#3d8259] mt-4">
                <Plus size={20} /><span>Adicionar Cliente</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Cabeçalho da tabela */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Cliente</div>
              <div className="col-span-3">Telefone</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2 text-right">Ações</div>
            </div>

            {/* Linhas */}
            <div className="divide-y divide-gray-100">
              {filteredClientes.map((cliente) => (
                <div key={cliente.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                  {/* Nome */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#4A9B6E] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {cliente.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{cliente.name}</p>
                      <p className="text-xs text-gray-400">Desde {new Date(cliente.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="col-span-3">
                    {cliente.phone ? (
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Phone size={14} className="text-gray-400" />
                        <span>{cliente.phone}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">—</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-span-3">
                    {cliente.email ? (
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Mail size={14} className="text-gray-400" />
                        <span className="truncate">{cliente.email}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">—</span>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(cliente)} className="p-2 text-gray-400 hover:text-[#4A9B6E] hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(cliente.id, cliente.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Edição */}
      {editingCliente && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Editar Cliente</h2>
              <button onClick={() => setEditingCliente(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Nome *', key: 'name', type: 'text', placeholder: 'Nome completo' },
                { label: 'Telefone', key: 'phone', type: 'text', placeholder: '(37) 99999-0000' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'email@exemplo.com' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A9B6E] focus:border-transparent" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setEditingCliente(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleEditSave} disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#4A9B6E] text-white rounded-lg hover:bg-[#3d8259] disabled:opacity-60">
                {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" /> : <Save size={16} />}
                <span>{saving ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Clientes;
