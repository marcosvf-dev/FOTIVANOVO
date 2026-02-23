import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ID único do dispositivo (gerado uma vez e salvo)
function getDeviceId() {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substr(2, 16) + Date.now();
    localStorage.setItem('device_id', id);
  }
  return id;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    iniciarSessao();
  }, []);

  const iniciarSessao = async () => {
    const savedToken = localStorage.getItem('token');

    if (!savedToken) {
      setLoading(false);
      return;
    }

    // Tenta auto-login com token salvo
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      
      // Primeiro tenta o endpoint /auth/me normal
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data);
      setToken(savedToken);
      setLoading(false);
      return;
    } catch (error) {
      // Token expirado, tenta renovar via auto-login
      if (error.response?.status === 401) {
        try {
          const deviceId = getDeviceId();
          const renewResponse = await axios.post(`${API_URL}/auth/auto-login`, {
            device_id: deviceId,
            token: savedToken
          });
          
          const { access_token, user: userData } = renewResponse.data;
          
          // Salva novo token renovado
          localStorage.setItem('token', access_token);
          setToken(access_token);
          setUser(userData);
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          setLoading(false);
          return;
        } catch (renewError) {
          // Token inválido mesmo, precisa logar novamente
          console.log('Auto-login falhou, redirecionando para login');
        }
      }
    }

    // Se chegou aqui, limpa tudo
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('device_id', getDeviceId());
    setToken(access_token);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    return userData;
  };

  const register = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    const { access_token, user: newUser } = response.data;
    
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(newUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
