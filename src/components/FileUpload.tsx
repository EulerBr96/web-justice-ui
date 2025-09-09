'use client';

import { useState, useRef } from 'react';
import { DocumentArrowUpIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

interface FileUploadProps {
  onFileProcessed: (data: string[]) => void;
  accept?: string;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function FileUpload({ 
  onFileProcessed, 
  accept = '.xlsx,.xls,.csv', 
  title,
  description,
  isLoading = false 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [processedCount, setProcessedCount] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    setSuccessMessage(null);
    setProcessedCount(null);
    setIsProcessingFile(true);
    
    try {
      let data: string[] = [];
      
      if (file.type.includes('csv')) {
        // Processar CSV
        const text = await file.text();
        const lines = text.split('\n');
        data = lines
          .map(line => line.split(',')[0]?.trim()) // Pegar coluna A
          .filter(item => item && item.length > 0);
      } else {
        // Processar Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Converter para JSON e extrair coluna A
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        data = jsonData
          .map(row => (row[0] || '').toString().trim())
          .filter(item => item.length > 0);
      }
      
      setProcessedCount(data.length);
      setSuccessMessage(`✅ ${data.length} itens extraídos da planilha com sucesso!`);
      
      // Aguardar um pouco para o usuário ver a mensagem antes de enviar
      setTimeout(() => {
        onFileProcessed(data);
      }, 500);
      
    } catch (err) {
      console.error('Erro ao processar arquivo:', err);
      setError('Erro ao processar arquivo. Verifique se é um arquivo Excel ou CSV válido.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    // Validar tipo de arquivo
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                       'application/vnd.ms-excel', 
                       'text/csv'];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Tipo de arquivo não suportado. Use apenas arquivos Excel (.xlsx, .xls) ou CSV.');
      return;
    }

    setSelectedFile(file);
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setSuccessMessage(null);
    setProcessedCount(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!isProcessingFile && !isLoading) {
      fileInputRef.current?.click();
    }
  };

  const isDisabled = isProcessingFile || isLoading;

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-lg border-2 border-dashed p-6 transition-colors
          ${isDragOver && !isDisabled ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}
          ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
      >
        <div className="text-center">
          {isProcessingFile ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">Processando arquivo...</h3>
                <p className="mt-1 text-sm text-gray-600">Extraindo dados da planilha</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">Enviando para processamento...</h3>
                <p className="mt-1 text-sm text-gray-600">Criando jobs de busca</p>
              </div>
            </div>
          ) : (
            <>
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Arraste e solte um arquivo ou clique para selecionar
              </p>
              <p className="text-xs text-gray-400">
                Suporte para: Excel (.xlsx, .xls) e CSV
              </p>
            </>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileInputChange}
          disabled={isDisabled}
        />
      </div>

      {/* Arquivo selecionado */}
      {selectedFile && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center space-x-2">
            <DocumentIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">{selectedFile.name}</span>
            <span className="text-xs text-gray-400">
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
            {processedCount !== null && (
              <span className="text-xs font-medium text-indigo-600">
                • {processedCount} itens encontrados
              </span>
            )}
          </div>
          <button
            onClick={handleRemoveFile}
            className="text-gray-400 hover:text-gray-600"
            disabled={isDisabled}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Mensagem de sucesso da extração */}
      {successMessage && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}