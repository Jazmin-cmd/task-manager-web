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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentYearStart = `${new Date().getFullYear()}-01-01`
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
  const maxDate = oneYearFromNow.toISOString().slice(0, 10)


  const CURRENT_YEAR_START = `${new Date().getFullYear()}-01-01`

  function getMaxDueDate() {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return date.toISOString().slice(0, 10)
  }

  function handleChange(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() === '' ? null : form.description.trim(),
      status: form.status,
      priority: form.priority,
      due_date: form.due_date === '' ? null : form.due_date,
      assigned_user_id: form.assigned_user_id === '' ? null : Number(form.assigned_user_id),
    }

    const saving = task ? updateTask(task.id, payload) : createTask(payload)
    const trimmedTitle = form.title.trim()
    const trimmedDescription = form.description.trim()
    const hasValidChars = /[\p{L}\p{N}]/u.test(trimmedTitle)
    const CURRENT_YEAR_START = `${new Date().getFullYear()}-01-01`

    if(trimmedTitle < 5) {
      setError('El título debe tener al menos 5 caracteres.')
      setIsSubmitting(false)
      return
    }
    
    if (!hasValidChars) {
      setError('El título debe contener al menos una letra o número.')
      setIsSubmitting(false)
      return
    }

    if(trimmedDescription < 5) {
      setError('La descripción debe tener al menos 5 caracteres.')
      setIsSubmitting(false)
      return
    }

    if(trimmedDescription.length > 2000) {
      setError('La descripción no puede superar los 2000 caracteres.')
      setIsSubmitting(false)
      return
    }

    if (form.due_date && form.due_date < CURRENT_YEAR_START) {
      setError('La fecha límite no puede ser de un año anterior al actual.')
      return
    }

    if (form.due_date && form.due_date > getMaxDueDate()) {
      setError('La fecha límite no puede superar un año desde hoy.')
      return
    }

    saving
      .then(() => {
        onSaved()
      })
      .catch((requestError) => {
        if (requestError.fieldErrors) {
          const firstField = Object.keys(requestError.fieldErrors)[0]
          const firstMessage = requestError.fieldErrors[firstField][0]
          setError(firstMessage)
        } else {
          setError(requestError.message)
        }
        setIsSubmitting(false)
      })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <div className="modal-header">
          <span className={`modal-icon modal-icon-${task ? 'edit' : 'create'}`}>
            {task ? '✎' : '+'}
          </span>
          <div>
            <h2>{task ? 'Editar tarea' : 'Nueva tarea'}</h2>
            <p className="modal-subtitle">
              {task ? 'Actualizá los datos de la tarea' : 'Completá los datos para crearla'}
            </p>
          </div>
        </div>

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
              maxLength="2000"
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <div className="field-label">Estado</div>
              <select
                className={`status-select status-${form.status}`}
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
          </div>

          <div className="field-row">
            <div className="field">
              <div className="field-label">Fecha límite</div>
              <input
                type="date"
                min={CURRENT_YEAR_START}
                max={getMaxDueDate()}
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
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
