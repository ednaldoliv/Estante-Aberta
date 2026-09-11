export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

export function installAuthenticatedFetch() {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const isApiRequest = typeof url === 'string' && (url.startsWith(BASE_URL) || url.startsWith(API_ORIGIN));
    if (!isApiRequest) return nativeFetch(input, init);

    const stored = localStorage.getItem('admin') || localStorage.getItem('user');
    const token = stored ? JSON.parse(stored)?.token : null;
    if (!token) return nativeFetch(input, init);

    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    headers.set('Authorization', `Bearer ${token}`);
    return nativeFetch(input, { ...init, headers });
  };
}

export function assetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${String(path).startsWith('/') ? path : `/${path}`}`;
}

async function handleResponse(res) {
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `Erro ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function registerUser({ nome, email, telefone, cpf, senha }) {
  const res = await fetch(`${BASE_URL}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, telefone, cpf, senha })
  });
  return handleResponse(res);
}

export async function loginUser({ email, senha }) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  return handleResponse(res);
}

export async function requestPasswordReset({ email }) {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleResponse(res);
}

export async function resetPassword({ token, novaSenha, confirmarSenha }) {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, novaSenha, confirmarSenha })
  });
  return handleResponse(res);
}

// API object para importação default
const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    const data = await handleResponse(res); 
    return { data };
  },
  post: async (endpoint, data, config = {}) => {
    const headers = config.headers || { 'Content-Type': 'application/json' };
    const body = headers['Content-Type'] === 'application/json' 
      ? JSON.stringify(data) 
      : data;
    
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers['Content-Type'] === 'multipart/form-data' ? {} : headers,
      body
    });
    const responseData = await handleResponse(res);
    return { data: responseData };
  },
  put: async (endpoint, data, config = {}) => {
    const headers = config.headers || { 'Content-Type': 'application/json' };
    const body = headers['Content-Type'] === 'application/json' 
      ? JSON.stringify(data) 
      : data;
    
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: headers['Content-Type'] === 'multipart/form-data' ? {} : headers,
      body
    });
    const responseData = await handleResponse(res);
    return { data: responseData };
  },
  delete: async (endpoint, dataOrConfig = null) => {
    const hasAxiosStyleData = dataOrConfig && typeof dataOrConfig === 'object' && Object.prototype.hasOwnProperty.call(dataOrConfig, 'data');
    const payload = hasAxiosStyleData ? dataOrConfig.data : dataOrConfig;
    const hasBody = payload !== null && payload !== undefined;

    const options = {
      method: 'DELETE',
      headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? JSON.stringify(payload) : undefined
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const responseData = await handleResponse(res);
    return { data: responseData };
  }
};

export default api;
