const API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`;


function getToken() {
  return localStorage.getItem('token')
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export function get(path) { return request('GET', path) }
export function post(path, body) { return request('POST', path, body) }
export function put(path, body) { return request('PUT', path, body) }
export function del(path) { return request('DELETE', path) }
