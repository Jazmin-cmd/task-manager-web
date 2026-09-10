import { useEffect, useRef, useState } from 'react'

import { getTasks, getUsers } from './api/client.js'
import TaskFilters from './components/TaskFilters.jsx'
import TaskFormModal from './components/TaskFormModal.jsx'
import TaskTable from './components/TaskTable.jsx'
import Swal from 'sweetalert2'

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
  const [status, setStatus] = useState('loading')
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)
  const hasLoadedOnce = useRef(false)
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 400)

    return () => clearTimeout(timer)
  }, [filters.search])

  useEffect(() => {
    let ignore = false
    if (!hasLoadedOnce.current) {
      setStatus('loading')
    }
    const effectiveFilters = { ...filters, search: debouncedSearch }

    getTasks(effectiveFilters)
      .then((body) => {
        if(!ignore) {
          setTasks(body.data)
          setStatus('ready')
          hasLoadedOnce.current = true
        }

      })
      .catch((error) => {
        if(!ignore) {
          console.error(error)
          setStatus('error')
        }
      })
    return () => {
      ignore = true
    }
  }, [filters.status,filters.priority,debouncedSearch, reloadToken])

  useEffect(() => {
    getUsers()
      .then((body) => {
        setUsers(body.data)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])


  function handleSaved() {
    setFormOpen(false)
    setTaskBeingEdited(null)
    reloadTasks()

    Swal.fire({
      icon: 'success',
      title: 'Tarea guardada',
      toast: true,
      text: 'La tarea se guardó correctamente.',
      timer: 1000,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  }

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


  return (
    <div className="app">
      <div className="header">
        <h1>Gestor de Tareas</h1>
      </div>

      <TaskFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={() => setFilters(EMPTY_FILTERS)}
        onCreate={openCreateForm}
      />

      {status === 'loading' && <p className="state-message">Cargando tareas...</p>}

      {status === 'error' && (
        <div className="state-message state-error">
          <p>No se pudieron cargar las tareas.</p>
          <button type="button" onClick={reloadTasks}>Reintentar</button>
        </div>
      )}

      {status === 'ready' && tasks.length === 0 && (
        <p className="state-message">No se encontraron tareas con estos filtros.</p>
      )}

      {status === 'ready' && tasks.length > 0 && (
        <TaskTable tasks={tasks} onEdit={openEditForm} onChanged={reloadTasks} />
      )}

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
