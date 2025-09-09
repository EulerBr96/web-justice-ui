'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
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
    <div className="h-screen overflow-hidden">
      {children}
    </div>
  );
}