const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...options,
  })

  const body = await response.json()

  if (!response.ok) {
    throw new Error(body.message || 'No se pudo completar la petición')
  }

  return body
}

export function getTasks(filters = {}) {
  const query = new URLSearchParams()

  if (filters.search) {
    query.set('search', filters.search)
  }

  if (filters.status) {
    query.set('status', filters.status)
  }

  if (filters.priority) {
    query.set('priority', filters.priority)
  }

  const suffix = query.toString() ? `?${query.toString()}` : ''

  return request(`/tasks${suffix}`)
}

export function getTask(id) {
  return request(`/tasks/${id}`)
}

export function getUsers() {
  return request('/users')
}

export function createTask(payload) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTask(id, payload) {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function updateTaskStatus(id, status) {
  return request(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
