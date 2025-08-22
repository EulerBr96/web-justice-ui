'use client';

import { useState } from 'react';
import { createSearch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ServicosPage() {
  const { token } = useAuth();
  const [document, setDocument] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!token) {
      setError('Você não está autenticado.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await createSearch(document, token);
      setSuccessMessage(`Busca para o documento ${document} iniciada com sucesso! (Job ID: ${response.job_id})`);
      setDocument(''); // Limpar o campo após o sucesso
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">
          Busca de Processos Judiciais
        </h1>
        <p className="mb-6 text-gray-600">
          Insira o CNPJ para iniciar a busca por processos associados.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="cnpj"
              className="block text-sm font-medium text-gray-700"
            >
              CNPJ
            </label>
            <input
              id="cnpj"
              name="cnpj"
              type="text"
              required
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="00.000.000/0001-00"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Iniciando Busca...' : 'Buscar Processos'}
          </button>
        </form>
      </div>
    </div>
  );
}
