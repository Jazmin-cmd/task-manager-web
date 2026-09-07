# task-manager-web

Cliente React + Vite del sistema de gestión de tareas. Consume la API REST de
`task-manager-api`.

---

## Requisitos

- Node.js 20 o superior (recomendado 22 LTS) y npm.
- El proyecto `task-manager-api` levantado y accesible en <http://localhost:8000>.

Para verificar la instalación:

```bash
node --version
npm --version
```

---

## Configuración

Copiá el archivo de entorno de ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

| Variable       | Valor por defecto           | Descripción                                    |
| -------------- | --------------------------- | ------------------------------------------------ |
| `VITE_API_URL` | `http://localhost:8000/api` | URL base de la API. Tiene que incluir `/api`.    |

Vite solo expone las variables que empiezan con `VITE_`, y las lee al arrancar: si
cambiás el `.env`, reiniciá `npm run dev`.

---

## Cómo levantar el proyecto

```bash
npm install
npm run dev
```

La aplicación arranca en <http://localhost:5173>.

Scripts disponibles:

| Comando           | Descripción                                     |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con recarga en caliente.    |
| `npm run build`   | Build de producción en `dist/`.                    |
| `npm run preview` | Sirve el build localmente para revisarlo.          |
| `npm run lint`    | Análisis estático con oxlint.                      |

---

## URLs

- Frontend: <http://localhost:5173>
- API: <http://localhost:8000>

---

## Qué hace la aplicación

- Lista las tareas con la persona asignada y la fecha límite.
- Crea y edita tareas en un formulario modal.
- Cambia el estado de una tarea directamente desde el listado.
- Filtra por estado y prioridad, y busca por título.
- Muestra la descripción y el historial de finalización de una tarea en el panel
  `Detalle`.

---

## Estructura del proyecto

```
task-manager-web/
├── index.html
├── src/
│   ├── main.jsx                      # punto de entrada
│   ├── App.jsx                       # estado de la pantalla: filtros, listado, modal
│   ├── labels.js                     # etiquetas visibles de estado y prioridad
│   ├── styles.css                    # estilos globales
│   ├── api/
│   │   └── client.js                 # wrapper de fetch y llamadas a la API
│   └── components/
│       ├── TaskFilters.jsx           # buscador y filtros
│       ├── TaskTable.jsx             # tabla y cambio de estado en línea
│       ├── TaskDetails.jsx           # descripción e historial de una tarea
│       └── TaskFormModal.jsx         # formulario de alta y edición
├── .env.example
├── package.json
└── vite.config.js
```

No hay manejador de estado global ni librería de ruteo: toda la pantalla vive en
`App.jsx` y se comunica con la API a través de `src/api/client.js`.

Los valores de `status` y `priority` viajan a la API en inglés (`pending`,
`in_progress`, `completed`, `low`, `medium`, `high`) porque así están definidos en la
base de datos. Las etiquetas que ve la persona usuaria se traducen en `src/labels.js`.

---

## Tests

Este proyecto se entrega sin suite de tests. Si agregás tests, documentá cómo se corren.

---
