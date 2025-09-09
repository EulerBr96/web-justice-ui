
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

export async function createBulkDocumentsSearch(documents: string[], token: string): Promise<{ job_ids: string[]; total_jobs: number; failed_items?: string[] }> {
  const response = await fetch(`${API_BASE_URL}/searches/bulk-documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ documents }),
  });
  return handleResponse(response);
}

export async function createBulkProcessSearch(process_numbers: string[], token: string): Promise<{ job_ids: string[]; total_jobs: number; failed_items?: string[] }> {
  const response = await fetch(`${API_BASE_URL}/searches/bulk-processes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ process_numbers }),
  });
  return handleResponse(response);
}

export async function createDirectProcessSearch(process_number: string, token: string): Promise<{ job_id: string }> {
  const response = await fetch(`${API_BASE_URL}/searches/direct-process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ process_number }),
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

// Justice Agent API configuration
const JUSTICE_AGENT_URL = process.env.NEXT_PUBLIC_JUSTICE_AGENT_URL || 'http://localhost:8010';

// Types for Justice Agent
export interface JusticeAgentMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface JusticeAgentRequest {
    message: string;
    stream?: boolean;
    session_id?: string;
}

export interface JusticeAgentResponse {
    message: string;
    session_id?: string;
    agent: string;
}

// Justice Agent API functions
export async function sendMessageToJusticeAgent(
    message: string,
    sessionId?: string
): Promise<JusticeAgentResponse> {
    const response = await fetch(`${JUSTICE_AGENT_URL}/v1/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message,
            stream: false,
            session_id: sessionId,
        }),
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    return response.json();
}

export async function getJusticeAgentModels() {
    const response = await fetch(`${JUSTICE_AGENT_URL}/v1/models`);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    return response.json();
}

export async function checkJusticeAgentHealth() {
    try {
        const response = await fetch(`${JUSTICE_AGENT_URL}/health`);
        if (!response.ok) {
            throw new Error(`Health check failed with status ${response.status}`);
        }
        return response.json();
    } catch (error) {
        throw new Error(`Justice Agent is not available: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Session management interfaces and functions
export interface SessionRequest {
    user_id: string;
    session_name?: string;
}

export interface SessionResponse {
    session_id: string;
    user_id: string;
    session_name: string;
    created_at: string;
    message_count: number;
}

export interface SessionListResponse {
    sessions: SessionResponse[];
}

export interface SessionHistoryResponse {
    session_id: string;
    messages: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp?: string;
    }>;
    message_count: number;
}

// Create a new session
export async function createJusticeAgentSession(
    userId: string,
    sessionName?: string
): Promise<SessionResponse> {
    const response = await fetch(`${JUSTICE_AGENT_URL}/v1/sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            session_name: sessionName,
        }),
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    return response.json();
}

// List sessions for a user
export async function listJusticeAgentSessions(userId?: string): Promise<SessionListResponse> {
    const url = new URL(`${JUSTICE_AGENT_URL}/v1/sessions`);
    if (userId) {
        url.searchParams.set('user_id', userId);
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    return response.json();
}

// Get session history
export async function getJusticeAgentSessionHistory(sessionId: string): Promise<SessionHistoryResponse> {
    const response = await fetch(`${JUSTICE_AGENT_URL}/v1/sessions/${sessionId}`);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    return response.json();
}

// Delete a session
export async function deleteJusticeAgentSession(sessionId: string): Promise<{ message: string }> {
    const response = await fetch(`${JUSTICE_AGENT_URL}/v1/sessions/${sessionId}`, {
        method: 'DELETE',
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    return response.json();
}
