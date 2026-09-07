import { useEffect, useState } from 'react'

import { getTasks, getUsers } from './api/client.js'
import TaskFilters from './components/TaskFilters.jsx'
import TaskFormModal from './components/TaskFormModal.jsx'
import TaskTable from './components/TaskTable.jsx'

const EMPTY_FILTERS = {
  search: '',
  status: '',
  priority: '',
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [formOpen, setFormOpen] = useState(false)
  const [taskBeingEdited, setTaskBeingEdited] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    getTasks(filters)
      .then((body) => {
        setTasks(body.data)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [filters, reloadToken])

  useEffect(() => {
    getUsers()
      .then((body) => {
        setUsers(body.data)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  function reloadTasks() {
    setReloadToken((token) => token + 1)
  }

  function handleFilterChange(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function openCreateForm() {
    setTaskBeingEdited(null)
    setFormOpen(true)
  }

  function openEditForm(task) {
    setTaskBeingEdited(task)
    setFormOpen(true)
  }

  function handleSaved() {
    setFormOpen(false)
    setTaskBeingEdited(null)
    reloadTasks()
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Gestor de Tareas</h1>
        <button type="button" onClick={openCreateForm}>
          Nueva tarea
        </button>
      </div>

      <TaskFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      <TaskTable tasks={tasks} onEdit={openEditForm} onChanged={reloadTasks} />

      {formOpen && (
        <TaskFormModal
          task={taskBeingEdited}
          users={users}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
