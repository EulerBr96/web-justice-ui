
export interface Search {
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

// Configuração de URLs para diferentes ambientes
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function loginUser(email: string, password: string): Promise<{ user_id: string; role: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function getSearches(token: string): Promise<Search[]> {
  const response = await fetch(`${API_BASE_URL}/searches`, {
    headers: {
      'Authorization': `Bearer ${token}`, // FastAPI usa Bearer token
      'Content-Type': 'application/json',
    },
  });
  const data = await handleResponse(response);
  return data;
}

export async function createSearch(document: string, token: string): Promise<{ job_id: string }> {
  const response = await fetch(`${API_BASE_URL}/searches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // FastAPI usa Bearer token
    },
    body: JSON.stringify({ document }),
  });
  return handleResponse(response);
}

export async function createUserByAdmin(token: string, email: string, password: string): Promise<{ user_id: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // FastAPI usa Bearer token
        },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
}

export async function extractText(numeroProcesso: string, token: string): Promise<{ job_id: string }> {
    const response = await fetch(`${API_BASE_URL}/extract-text`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // FastAPI usa Bearer token
        },
        body: JSON.stringify({ numero_processo: numeroProcesso }),
    });
    return handleResponse(response);
}
