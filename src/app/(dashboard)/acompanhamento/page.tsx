'use client';

import React, { useState, useEffect } from 'react';

interface TrackedProcess {
  id: number;
  numero_processo: string;
  data_inicio: string;
  ultima_consulta: string | null;
  data_ultima_movimentacao: string | null;
  ativo: boolean;
}

interface TrackingStats {
  total_acompanhamentos: number;
  com_consultas: number;
  com_movimentacoes: number;
  consultados_hoje: number;
}

export default function AcompanhamentoPage() {
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [processosAcompanhados, setProcessosAcompanhados] = useState<TrackedProcess[]>([]);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Função para mostrar notificações
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Carregar lista de processos acompanhados
  const loadTrackedProcesses = async () => {
    try {
      const response = await fetch('/api/tracking/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProcessosAcompanhados(data.processos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const response = await fetch('/api/tracking/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Iniciar acompanhamento de processo
  const startTracking = async () => {
    if (!numeroProcesso.trim()) {
      showNotification('error', 'Por favor, digite um número de processo');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/tracking/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          numero_processo: numeroProcesso,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', data.message || 'Acompanhamento iniciado com sucesso!');
        setNumeroProcesso('');
        loadTrackedProcesses();
        loadStats();
      } else {
        showNotification('error', data.detail || 'Erro ao iniciar acompanhamento');
      }
    } catch (error) {
      console.error('Erro ao iniciar acompanhamento:', error);
      showNotification('error', 'Erro ao iniciar acompanhamento');
    } finally {
      setLoading(false);
    }
  };

  // Parar acompanhamento de processo
  const stopTracking = async (numeroProcesso: string) => {
    try {
      const response = await fetch(`/api/tracking/stop/${numeroProcesso}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', data.message || 'Acompanhamento parado com sucesso!');
        loadTrackedProcesses();
        loadStats();
      } else {
        showNotification('error', data.detail || 'Erro ao parar acompanhamento');
      }
    } catch (error) {
      console.error('Erro ao parar acompanhamento:', error);
      showNotification('error', 'Erro ao parar acompanhamento');
    }
  };

  // Forçar verificação de comunicações
  const forceCheck = async (numeroProcesso: string) => {
    try {
      const response = await fetch(`/api/tracking/force-check/${numeroProcesso}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', `Verificação concluída! ${data.comunicacoes_novas || 0} novas comunicações encontradas`);
        loadTrackedProcesses();
      } else {
        showNotification('error', data.detail || 'Erro ao verificar comunicações');
      }
    } catch (error) {
      console.error('Erro ao verificar comunicações:', error);
      showNotification('error', 'Erro ao verificar comunicações');
    }
  };

  // Upload de planilha
  const handleFileUpload = async () => {
    if (!selectedFile) {
      showNotification('error', 'Por favor, selecione um arquivo');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/tracking/upload-batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', `Upload concluído! ${data.sucessos} processos adicionados, ${data.erros} erros`);
        setSelectedFile(null);
        loadTrackedProcesses();
        loadStats();
      } else {
        showNotification('error', data.detail || 'Erro no upload');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      showNotification('error', 'Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  // Formatação de data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Status badge
  const getStatusBadge = (processo: TrackedProcess) => {
    if (!processo.ativo) {
      return <span className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full">⏸️ Parado</span>;
    }
    if (processo.ultima_consulta) {
      const lastCheck = new Date(processo.ultima_consulta);
      const daysSinceCheck = Math.floor((Date.now() - lastCheck.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCheck === 0) {
        return <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-200 rounded-full">✅ Atualizado hoje</span>;
      } else if (daysSinceCheck <= 2) {
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-200 rounded-full">🕐 Atualizado há {daysSinceCheck} dia(s)</span>;
      }
    }
    return <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-200 rounded-full">⚠️ Verificação pendente</span>;
  };

  useEffect(() => {
    loadTrackedProcesses();
    loadStats();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Acompanhamento de Processos</h1>
        <button 
          onClick={() => { loadTrackedProcesses(); loadStats(); }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total em Acompanhamento</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_acompanhamentos}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Com Consultas</div>
            <div className="text-2xl font-bold text-gray-900">{stats.com_consultas}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Com Movimentações</div>
            <div className="text-2xl font-bold text-gray-900">{stats.com_movimentacoes}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Consultados Hoje</div>
            <div className="text-2xl font-bold text-gray-900">{stats.consultados_hoje}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('individual')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'individual' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Processo Individual
            </button>
            <button
              onClick={() => setActiveTab('lote')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'lote' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload em Lote
            </button>
            <button
              onClick={() => setActiveTab('lista')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'lista' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Processos Acompanhados
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab - Processo Individual */}
          {activeTab === 'individual' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Adicionar Processo ao Acompanhamento</h3>
                <p className="text-sm text-gray-500">
                  Digite o número do processo para iniciar o acompanhamento diário de movimentações e comunicações.
                </p>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="numero-processo" className="block text-sm font-medium text-gray-700">
                    Número do Processo
                  </label>
                  <input
                    id="numero-processo"
                    type="text"
                    placeholder="Ex: 1234567-89.2023.8.26.0001"
                    value={numeroProcesso}
                    onChange={(e) => setNumeroProcesso(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && startTracking()}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={startTracking}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 flex items-center"
                  >
                    {loading ? '⏳' : '➕'} Iniciar Acompanhamento
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    ℹ️
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      O sistema verificará automaticamente este processo 3 vezes ao dia (8h, 14h e 20h) em busca de novas movimentações e comunicações.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab - Upload em Lote */}
          {activeTab === 'lote' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Upload de Planilha</h3>
                <p className="text-sm text-gray-500">
                  Faça upload de uma planilha Excel com múltiplos números de processos para adicionar em lote.
                </p>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
                    Arquivo Excel (.xlsx, .xls)
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleFileUpload}
                    disabled={uploading || !selectedFile}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 flex items-center"
                  >
                    {uploading ? '⏳' : '📤'} Fazer Upload
                  </button>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    ⚠️
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      A planilha deve conter uma coluna com o nome &quot;numero_processo&quot; ou &quot;Número do Processo&quot; com os números dos processos a serem acompanhados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab - Lista de Processos */}
          {activeTab === 'lista' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Processos em Acompanhamento</h3>
                <p className="text-sm text-gray-500">
                  Lista de todos os processos que estão sendo monitorados automaticamente.
                </p>
              </div>
              
              {processosAcompanhados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-lg">Nenhum processo em acompanhamento</p>
                  <p className="text-sm">Adicione processos usando as abas acima</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número do Processo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Início do Acompanhamento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Última Consulta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Última Movimentação
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {processosAcompanhados.map((processo) => (
                        <tr key={processo.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {processo.numero_processo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(processo)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(processo.data_inicio)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(processo.ultima_consulta)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(processo.data_ultima_movimentacao)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => forceCheck(processo.numero_processo)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Forçar verificação"
                            >
                              🔄
                            </button>
                            <button
                              onClick={() => stopTracking(processo.numero_processo)}
                              className="text-red-600 hover:text-red-900 ml-2"
                              title="Parar acompanhamento"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}