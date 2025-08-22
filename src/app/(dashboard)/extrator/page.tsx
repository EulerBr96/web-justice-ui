'use client';

import { useState } from 'react';
import { extractText } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ExtratorPage() {
  const { token } = useAuth();
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    setLogs([]);

    if (!token) {
      setError('Você não está autenticado.');
      setIsLoading(false);
      return;
    }

    try {
      addLog('Iniciando extração de texto para o processo: ' + numeroProcesso);
      const response = await extractText(numeroProcesso, token);
      setSuccessMessage(`Extração de texto para o processo ${numeroProcesso} iniciada com sucesso! (Job ID: ${response.job_id})`);
      addLog(`Job de extração criado: ${response.job_id}`);
      addLog('O worker irá processar a extração em segundo plano');
      addLog('Verifique os logs do Docker para acompanhar o progresso');
      setNumeroProcesso(''); // Limpar o campo após o sucesso
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      addLog(`Erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">
            Extração de Texto de Documentos
          </h1>
          <p className="mb-6 text-gray-600">
            Insira o número do processo para extrair texto de todos os documentos associados.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="numero_processo"
                className="block text-sm font-medium text-gray-700"
              >
                Número do Processo
              </label>
              <input
                id="numero_processo"
                name="numero_processo"
                type="text"
                required
                value={numeroProcesso}
                onChange={(e) => setNumeroProcesso(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0001234-56.2023.8.12.0001"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Iniciando Extração...' : 'Extrair Texto dos Documentos'}
            </button>
          </form>
        </div>

        {/* Logs */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Logs de Execução
          </h2>
          <div className="bg-gray-900 rounded-lg p-4 h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400 text-sm">
                Os logs aparecerão aqui durante a execução...
              </p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-green-400 text-xs font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Como acompanhar:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Execute: <code className="bg-blue-100 px-1 rounded">docker-compose logs -f document-extractor</code></li>
              <li>• Os textos extraídos são salvos na tabela <code className="bg-blue-100 px-1 rounded">dim_textos_documentos</code></li>
              <li>• O worker processa documentos em segundo plano</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}