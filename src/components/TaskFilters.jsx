import { PRIORITIES, PRIORITY_LABELS, STATUSES, STATUS_LABELS } from '../labels.js'

export default function TaskFilters({ filters, onChange, onClear }) {
  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Buscar por título"
        value={filters.search}
        onChange={(event) => onChange('search', event.target.value)}
      />

      <select
        value={filters.status}
        onChange={(event) => onChange('status', event.target.value)}
      >
        <option value="">Todos los estados</option>
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>

      <select
        value={filters.priority}
        onChange={(event) => onChange('priority', event.target.value)}
      >
        <option value="">Todas las prioridades</option>
        {PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_LABELS[priority]}
          </option>
        ))}
      </select>

      <button type="button" onClick={onClear}>
        Limpiar
      </button>
    </div>
  )
}
