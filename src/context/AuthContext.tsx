'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Definindo a estrutura do objeto de usuário
interface User {
  id: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null; // O token ainda pode ser útil para as chamadas de API
  login: (userId: string, userRole: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Tenta carregar os dados do usuário do localStorage ao iniciar
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setToken(userData.id); // Usamos o ID do usuário como token de autenticação
    }
  }, []);

  const login = (userId: string, userRole: string) => {
    const userData = { id: userId, role: userRole };
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setToken(userId);
    router.push('/buscas'); // Redireciona para a página de buscas após o login
  };

  const logout = () => {
    localStorage.removeItem('user_data');
    setUser(null);
    setToken(null);
    router.push('/'); // Redireciona para a página inicial
  };

  const value = {
    isAuthenticated: !!user,
    user,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
