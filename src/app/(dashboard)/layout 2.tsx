'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver autenticado, redireciona para a página de login
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Renderiza um placeholder ou nada enquanto verifica a autenticação
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white text-gray-800 shadow-md">
        <div className="p-6">
          <Link href="/servicos" className="text-2xl font-bold text-indigo-600">
            WebJustice
          </Link>
        </div>
        <nav className="mt-6">
          <Link
            href="/servicos"
            className="block px-6 py-3 text-lg font-medium hover:bg-gray-200"
          >
            <span className="mr-3">🔍</span>
            Nova Busca
          </Link>
          <Link
            href="/buscas"
            className="block px-6 py-3 text-lg font-medium hover:bg-gray-200"
          >
            <span className="mr-3">📊</span>
            Minhas Buscas
          </Link>
          <Link
            href="/extrator"
            className="block px-6 py-3 text-lg font-medium hover:bg-gray-200"
          >
            <span className="mr-3">📄</span>
            Extrator de Texto
          </Link>
          {/* Link Condicional para Admin */}
          {user?.role === 'developer' && (
            <Link
              href="/admin/users"
              className="block px-6 py-3 text-lg font-medium text-purple-700 hover:bg-gray-200"
            >
              <span className="mr-3">⚙️</span>
              Admin
            </Link>
          )}
        </nav>
        <div className="absolute bottom-0 w-full p-6">
            <button 
                onClick={logout}
                className="w-full rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                Sair
            </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
