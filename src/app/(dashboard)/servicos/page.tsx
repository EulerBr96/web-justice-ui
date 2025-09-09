'use client';

import { useState } from 'react';
import { 
  createSearch, 
  createBulkDocumentsSearch, 
  createBulkProcessSearch, 
  createDirectProcessSearch 
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FileUpload } from '@/components/FileUpload';

export default function ServicosPage() {
  const { token } = useAuth();
  
  // Estados para busca individual de documento
  const [document, setDocument] = useState('');
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
  
  // Estados para busca direta de processo
  const [processNumber, setProcessNumber] = useState('');
  const [isProcessLoading, setIsProcessLoading] = useState(false);
  
  // Estados para uploads em lote
  const [isBulkDocumentsLoading, setIsBulkDocumentsLoading] = useState(false);
  const [isBulkProcessLoading, setIsBulkProcessLoading] = useState(false);
  
  // Estados gerais
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Handler para busca individual de documento
  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsDocumentLoading(true);

    if (!token) {
      setError('Você não está autenticado.');
      setIsDocumentLoading(false);
      return;
    }

    try {
      const response = await createSearch(document, token);
      setSuccessMessage(`Busca para o documento ${document} iniciada com sucesso! (Job ID: ${response.job_id})`);
      setDocument('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsDocumentLoading(false);
    }
  };

  // Handler para busca direta de processo
  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsProcessLoading(true);

    if (!token) {
      setError('Você não está autenticado.');
      setIsProcessLoading(false);
      return;
    }

    try {
      const response = await createDirectProcessSearch(processNumber, token);
      setSuccessMessage(`Busca direta do processo ${processNumber} iniciada com sucesso! (Job ID: ${response.job_id})`);
      setProcessNumber('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsProcessLoading(false);
    }
  };

  // Handler para upload de planilha de documentos
  const handleBulkDocuments = async (documents: string[]) => {
    clearMessages();
    setIsBulkDocumentsLoading(true);

    if (!token) {
      setError('Você não está autenticado.');
      setIsBulkDocumentsLoading(false);
      return;
    }

    try {
      const response = await createBulkDocumentsSearch(documents, token);
      const failedText = response.failed_items ? ` (${response.failed_items.length} falharam)` : '';
      setSuccessMessage(`🎉 ${response.total_jobs} buscas de documentos iniciadas com sucesso!${failedText} Acompanhe o progresso em "Minhas Buscas".`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsBulkDocumentsLoading(false);
    }
  };

  // Handler para upload de planilha de processos
  const handleBulkProcesses = async (processNumbers: string[]) => {
    clearMessages();
    setIsBulkProcessLoading(true);

    if (!token) {
      setError('Você não está autenticado.');
      setIsBulkProcessLoading(false);
      return;
    }

    try {
      const response = await createBulkProcessSearch(processNumbers, token);
      const failedText = response.failed_items ? ` (${response.failed_items.length} falharam)` : '';
      setSuccessMessage(`🚀 ${response.total_jobs} buscas de processos iniciadas com sucesso!${failedText} Acompanhe o progresso em "Minhas Buscas".`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsBulkProcessLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Nova Busca - Processos Judiciais
          </h1>
          <p className="mt-2 text-gray-600">
            Escolha o tipo de busca que deseja realizar
          </p>
        </div>

        {/* Mensagens de erro e sucesso globais */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          
          {/* Busca Individual por Documento */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Busca Individual por Documento
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Insira um CNPJ ou CPF para buscar processos associados.
            </p>
            
            <form onSubmit={handleDocumentSubmit} className="space-y-4">
              <div>
                <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                  CNPJ/CPF
                </label>
                <input
                  id="document"
                  type="text"
                  required
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="00.000.000/0001-00"
                  disabled={isDocumentLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isDocumentLoading}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isDocumentLoading ? 'Iniciando Busca...' : 'Buscar Processos'}
              </button>
            </form>
          </div>

          {/* Busca Direta por Processo */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Busca Direta por Processo
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Insira o número de um processo específico para obter seus detalhes.
            </p>
            
            <form onSubmit={handleProcessSubmit} className="space-y-4">
              <div>
                <label htmlFor="process" className="block text-sm font-medium text-gray-700">
                  Número do Processo
                </label>
                <input
                  id="process"
                  type="text"
                  required
                  value={processNumber}
                  onChange={(e) => setProcessNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="0000000-00.0000.0.00.0000"
                  disabled={isProcessLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isProcessLoading}
                className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isProcessLoading ? 'Processando...' : 'Buscar Detalhes do Processo'}
              </button>
            </form>
          </div>

          {/* Upload em Lote - Documentos */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Upload em Lote - Documentos
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Faça upload de uma planilha com documentos (CNPJ/CPF) na coluna A para buscar processos em lote.
            </p>
            
            <FileUpload
              title="Upload de Documentos"
              description="Planilha com documentos na coluna A"
              onFileProcessed={handleBulkDocuments}
              isLoading={isBulkDocumentsLoading}
            />
          </div>

          {/* Upload em Lote - Processos */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Upload em Lote - Processos
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Faça upload de uma planilha com números de processo na coluna A para buscar detalhes em lote.
            </p>
            
            <FileUpload
              title="Upload de Processos"
              description="Planilha com números de processo na coluna A"
              onFileProcessed={handleBulkProcesses}
              isLoading={isBulkProcessLoading}
            />
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 text-lg font-medium text-blue-800">
            Como usar os uploads em lote:
          </h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• <strong>Documentos:</strong> Upload de CNPJ/CPF passará pelo processo completo de busca</li>
            <li>• <strong>Processos:</strong> Upload de números de processo vai direto para coleta de detalhes</li>
            <li>• <strong>Formato:</strong> Aceita arquivos Excel (.xlsx, .xls) e CSV</li>
            <li>• <strong>Coluna A:</strong> Todos os dados devem estar na primeira coluna da planilha</li>
            <li>• <strong>Acompanhamento:</strong> Vá até a página &quot;Minhas Buscas&quot; para acompanhar o progresso</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
