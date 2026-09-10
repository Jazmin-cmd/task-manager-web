import { Fragment, useState } from 'react'

import { updateTaskStatus } from '../api/client.js'
import { PRIORITY_LABELS, STATUS_LABELS, STATUSES } from '../labels.js'
import TaskDetails from './TaskDetails.jsx'

const AVATAR_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2']

function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
  return initials.toUpperCase()
}

function getAvatarColor(name) {
  const code = name.charCodeAt(0) + name.charCodeAt(name.length - 1)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

const SORT_ACCESSORS = {
  title: (task) => task.title?.toLowerCase() ?? '',
  assignee: (task) => task.assigned_user?.name?.toLowerCase() ?? '',
  due_date: (task) => (task.due_date ? new Date(task.due_date).getTime() : null)
}

export default function TaskTable({ tasks, onEdit, onChanged, page, perPage, totalPages, totalRecords, onPageChange }) {
  const [openTaskId, setOpenTaskId] = useState(null)
  const [sortBy, setSortBy] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  function handleSort(column) {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  function sortIndicator(column) {
    const isActive = sortBy === column
    const arrow = isActive ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'
    return <span className={`sort-arrow ${isActive ? 'sort-arrow-active' : ''}`}>{arrow}</span>
  }

  const sortedTasks = sortBy
    ? [...tasks].sort((a, b) => {
        const accessor = SORT_ACCESSORS[sortBy]
        const valueA = accessor(a)
        const valueB = accessor(b)
        if (valueA === null || valueA === '') return 1
        if (valueB === null || valueB === '') return -1
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    : tasks

  const paginatedTasks = sortedTasks
  const firstRecord = totalRecords === 0 ? 0 : (page - 1) * perPage + 1
  const lastRecord = Math.min(page * perPage, totalRecords)

  function goToPage(targetPage) {
    onPageChange(Math.min(Math.max(targetPage, 1), totalPages))
  }

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
    <div className="table-wrapper">
      <table className="task-table">
        <thead>
          <tr>
            <th className="sortable-th" onClick={() => handleSort('title')}>
              Título{sortIndicator('title')}
            </th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th className="sortable-th" onClick={() => handleSort('assignee')}>
              Asignada a{sortIndicator('assignee')}
            </th>
            <th className="sortable-th" onClick={() => handleSort('due_date')}>
              Fecha límite{sortIndicator('due_date')}
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTasks.map((task) => {
            const isOpen = openTaskId === task.id
            return (
              <Fragment key={task.id}>
                <tr className={isOpen ? 'row-expanded' : ''}>
                  <td data-label="Título">
                    <span className="task-title">{task.title}</span>
                  </td>
                  <td data-label="Estado">
                    <select
                      className={`status-select status-${task.status}`}
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
                  <td data-label="Prioridad">
                    <span className={`badge badge-${task.priority}`}>
                      {PRIORITY_LABELS[task.priority] || task.priority}
                    </span>
                  </td>
                  <td data-label="Asignada a">
                    {task.assigned_user ? (
                      <span className="assignee">
                        <span
                          className="avatar"
                          style={{ background: getAvatarColor(task.assigned_user.name) }}
                        >
                          {getInitials(task.assigned_user.name)}
                        </span>
                        {task.assigned_user.name}
                      </span>
                    ) : (
                      <span className="assignee assignee-empty">Sin asignar</span>
                    )}
                  </td>
                  {task.due_date ? (
                    <td className="task-meta" data-label="Fecha límite">
                      {new Date(task.due_date).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                  ) : (
                    <td className="task-meta" data-label="Fecha límite">-</td>
                  )}
                  <td data-label="Acciones">
                    <div className="actions-cell">
                      <button type="button" className="secondary" onClick={() => onEdit(task)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`secondary details-toggle ${isOpen ? 'is-open' : ''}`}
                        onClick={() => toggleDetails(task.id)}
                      >
                        Detalle
                        <span className="details-toggle-arrow">⌄</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="details-row">
                    <td colSpan={6}>
                      <TaskDetails taskId={task.id} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>

      <div className="table-footer">
        <span className="record-count">
          {totalRecords === 0
            ? 'Sin registros'
            : `Mostrando ${firstRecord}-${lastRecord} de ${totalRecords} tarea${totalRecords === 1 ? '' : 's'}`}
        </span>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="secondary"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
            >
              ‹ Anterior
            </button>
            <span className="pagination-current">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              className="secondary"
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Siguiente ›
            </button>
          </div>
        )}
      </div>
    </div>
  )
}