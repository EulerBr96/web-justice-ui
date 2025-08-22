'use client';

import { useEffect, useState } from 'react';
import { getSearches } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Search {
  id: string;
  document: string;
  created_at: string;
  status: string;
  progress: number;
  result_count: number;
  current_phase?: string;
  total_detail_jobs?: number;
  completed_detail_jobs?: number;
  download_url?: string;
}

// Função para determinar mensagem da fase atual
const getPhaseMessage = (search: Search) => {
  if (search.status === 'PENDING') return 'Aguardando início...';
  if (search.current_phase === 'STARTING') return 'Iniciando busca...';
  if (search.current_phase === 'PAGINATING') return 'Coletando processos...';
  if (search.current_phase === 'COLLECTING_DETAILS') {
    const completed = search.completed_detail_jobs || 0;
    const total = search.total_detail_jobs || 0;
    return `Processando detalhes (${completed}/${total})`;
  }
  if (search.status === 'COMPLETED') {
    return search.result_count === 0 ? 'Nenhum processo encontrado' : 'Concluído';
  }
  if (search.status === 'FAILED') return 'Falhou';
  return 'Processando...';
};

// Função para determinar cor da barra de progresso
const getProgressColor = (search: Search) => {
  if (search.status === 'FAILED') return 'bg-red-500';
  if (search.progress === 100) return 'bg-green-500';
  if (search.current_phase === 'COLLECTING_DETAILS') return 'bg-yellow-500';
  return 'bg-blue-500';
};

export default function BuscasPage() {
  const { token } = useAuth();
  const [searches, setSearches] = useState<Search[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para lidar com o download - movida para dentro do componente
  const handleDownload = async (searchJobId: string) => {
    if (!token) {
      alert('Token de autenticação não encontrado');
      return;
    }

    try {
      const downloadUrl = `/api/searches/download?search_job_id=${searchJobId}`;
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro no download:', errorData);
        alert('Erro ao fazer download do arquivo');
        return;
      }

      // Criar blob e fazer download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Extrair nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      const fileName = contentDisposition 
        ? contentDisposition.split('filename="')[1]?.replace('"', '') 
        : `processos_${searchJobId}.xlsx`;
      
      // Criar link temporário para download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Erro inesperado no download:', error);
      alert('Erro inesperado ao fazer download');
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchSearches = async () => {
      try {
        // O "token" do nosso AuthContext é na verdade o user_id
        const data = await getSearches(token);
        setSearches(data);
        setIsLoading(false);
        return data; // Retorna os dados para verificar o status
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setIsLoading(false);
        return null;
      }
    };

    // Função para iniciar o polling
    const startPolling = async () => {
      const initialData = await fetchSearches();
      if (initialData && initialData.every((s: Search) => s.status === 'COMPLETED' || s.status === 'FAILED')) {
        // Se todas as buscas já estiverem em estado final, não inicia o polling
        return null;
      }

      const intervalId = setInterval(async () => {
        const updatedData = await fetchSearches();
        if (updatedData && updatedData.every((s: Search) => s.status === 'COMPLETED' || s.status === 'FAILED')) {
          // Se todas as buscas estiverem em estado final, para o polling
          clearInterval(intervalId);
        }
      }, 5000); // Polling a cada 5 segundos

      return intervalId; // Retorna o ID do intervalo para limpeza
    };

    let cleanupInterval: NodeJS.Timeout | null = null;
    
    const initializePolling = async () => {
      const intervalId = await startPolling();
      if (intervalId) {
        cleanupInterval = intervalId;
      }
    };
    
    initializePolling();
    
    // Cleanup function para limpar o intervalo quando o componente desmonta ou token muda
    return () => {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
    };
  }, [token]);

  if (isLoading) {
    return <div className="text-center">Carregando buscas...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Minhas Buscas</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Documento
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Data da Busca
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Processos Encontrados
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Progresso
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Download</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {searches.map((search) => (
              <tr key={search.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {search.document}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(search.created_at).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {search.status === 'COMPLETED' && search.result_count === 0 ? 'Nenhum' : search.result_count}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center">
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(search)}`}
                          style={{ width: `${search.progress}%` }}
                        ></div>
                      </div>
                      <span className="ml-3 font-medium">{search.progress}%</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {getPhaseMessage(search)}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => handleDownload(search.id)}
                    disabled={search.status !== 'COMPLETED'}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
