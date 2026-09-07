import { useState } from 'react'

import { updateTaskStatus } from '../api/client.js'
import { PRIORITY_LABELS, STATUS_LABELS, STATUSES } from '../labels.js'
import TaskDetails from './TaskDetails.jsx'

export default function TaskTable({ tasks, onEdit, onChanged }) {
  const [openTaskId, setOpenTaskId] = useState(null)

  function handleStatusChange(task, status) {
    updateTaskStatus(task.id, status)
      .then(() => {
        onChanged()
      })
      .catch((error) => {
        console.error(error)
      })
  }

  function toggleDetails(taskId) {
    setOpenTaskId(openTaskId === taskId ? null : taskId)
  }

  return (
    <table className="task-table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Estado</th>
          <th>Prioridad</th>
          <th>Asignada a</th>
          <th>Fecha límite</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td>
              <span className="task-title">{task.title}</span>
              {openTaskId === task.id && <TaskDetails taskId={task.id} />}
            </td>
            <td>
              <select
                value={task.status}
                onChange={(event) => handleStatusChange(task, event.target.value)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </td>
            <td>{PRIORITY_LABELS[task.priority] || task.priority}</td>
            <td>{task.assigned_user ? task.assigned_user.name : '-'}</td>
            <td>{task.due_date || '-'}</td>
            <td>
              <button type="button" onClick={() => onEdit(task)}>
                Editar
              </button>
              <button type="button" onClick={() => toggleDetails(task.id)}>
                Detalle
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
