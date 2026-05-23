const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message ?? 'Pedido falhou.');
  }
  return payload;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  return parseResponse(response);
}

export async function apiGet(path) {
  return request(path);
}

export async function apiPost(path, body) {
  const isForm = body instanceof FormData;
  return request(path, {
    method: 'POST',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? body : JSON.stringify(body),
  });
}

export async function apiPatch(path, body) {
  const isForm = body instanceof FormData;
  return request(path, {
    method: 'PATCH',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? body : JSON.stringify(body),
  });
}

export async function apiDelete(path, body) {
  const isForm = body instanceof FormData;
  return request(path, {
    method: 'DELETE',
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
}
