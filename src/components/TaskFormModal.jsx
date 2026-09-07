import { useState } from 'react'

import { createTask, updateTask } from '../api/client.js'
import { PRIORITIES, PRIORITY_LABELS, STATUSES, STATUS_LABELS } from '../labels.js'

function buildInitialForm(task) {
  return {
    title: task ? task.title : '',
    description: task && task.description ? task.description : '',
    status: task ? task.status : 'pending',
    priority: task ? task.priority : 'medium',
    due_date: task && task.due_date ? task.due_date : '',
    assigned_user_id: task && task.assigned_user_id ? String(task.assigned_user_id) : '',
  }
}

export default function TaskFormModal({ task, users, onClose, onSaved }) {
  const [form, setForm] = useState(() => buildInitialForm(task))
  const [error, setError] = useState(null)

  function handleChange(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      due_date: form.due_date === '' ? null : form.due_date,
      assigned_user_id: form.assigned_user_id === '' ? null : Number(form.assigned_user_id),
    }

    const saving = task ? updateTask(task.id, payload) : createTask(payload)

    saving
      .then(() => {
        onSaved()
      })
      .catch((requestError) => {
        setError(requestError.message)
      })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{task ? 'Editar tarea' : 'Nueva tarea'}</h2>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <div className="field-label">Título</div>
            <input
              type="text"
              value={form.title}
              onChange={(event) => handleChange('title', event.target.value)}
            />
          </div>

          <div className="field">
            <div className="field-label">Descripción</div>
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
            />
          </div>

          <div className="field">
            <div className="field-label">Estado</div>
            <select
              value={form.status}
              onChange={(event) => handleChange('status', event.target.value)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <div className="field-label">Prioridad</div>
            <select
              value={form.priority}
              onChange={(event) => handleChange('priority', event.target.value)}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <div className="field-label">Fecha límite</div>
            <input
              type="text"
              placeholder="AAAA-MM-DD"
              value={form.due_date}
              onChange={(event) => handleChange('due_date', event.target.value)}
            />
          </div>

          <div className="field">
            <div className="field-label">Asignada a</div>
            <select
              value={form.assigned_user_id}
              onChange={(event) => handleChange('assigned_user_id', event.target.value)}
            >
              <option value="">Sin asignar</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
