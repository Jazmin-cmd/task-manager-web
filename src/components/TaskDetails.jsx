import { useEffect, useState } from 'react'

import { getTask } from '../api/client.js'
import { STATUS_LABELS } from '../labels.js'

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TaskDetails({ taskId }) {
  const [task, setTask] = useState(null)

  useEffect(() => {
    getTask(taskId)
      .then((body) => {
        setTask(body.data)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [taskId])

  if (!task) {
    return <div className="task-details task-details-loading">Cargando detalle...</div>
  }

  return (
    <div className="task-details">
      <div className="task-details-section">
        <span className="task-details-label">Descripción</span>
        <p className="task-details-description">{task.description || 'Sin descripción'}</p>
      </div>

      <div className="task-details-section">
        <span className="task-details-label">Finalizada el</span>
        <p className="task-details-completed">
          {task.completed_at ? formatDate(task.completed_at) : <em>Aún no finalizada</em>}
        </p>
      </div>

      <div className="task-details-section">
        <span className="task-details-label">Historial</span>
        {task.histories.length === 0 ? (
          <p className="task-details-empty">Sin registros de historial.</p>
        ) : (
          <ul className="task-history">
            {task.histories.map((history) => (
              <li key={history.id} className="task-history-item">
                <span className="task-history-dot" />
                <div className="task-history-content">
                  <span className="task-history-transition">
                    <span className={`badge-mini status-${history.from_status}`}>
                      {STATUS_LABELS[history.from_status] || history.from_status}
                    </span>
                    <span className="task-history-arrow">→</span>
                    <span className={`badge-mini status-${history.to_status}`}>
                      {STATUS_LABELS[history.to_status] || history.to_status}
                    </span>
                  </span>
                  {history.note && <span className="task-history-note">{history.note}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
