import React, { useEffect, useMemo, useState } from "react";
import {
  createTask,
  deleteTask,
  getTasks,
  searchTasks,
  updateTask
} from "./mockApi";

const emptyForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  category: "Personal"
};

function formatDisplayDate(dateString) {
  if (!dateString) return "No date";
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatDisplayTime(timeString) {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = async (query = "") => {
    setLoading(true);
    try {
      const nextTasks = query ? await searchTasks(query) : await getTasks();
      setTasks(nextTasks);
      setError("");
    } catch (err) {
      setError("Unable to load the schedule right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTasks(search);
    }, 200);

    return () => clearTimeout(timer);
  }, [search]);

  const upcomingCount = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.date || !task.time) return false;
      const taskDate = new Date(`${task.date}T${task.time}`);
      return taskDate >= new Date();
    }).length;
  }, [tasks]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.date || !form.time) {
      setError("Title, date, and time are required.");
      return;
    }

    try {
      if (editingId) {
        const updated = await updateTask(editingId, {
          title: form.title.trim(),
          description: form.description.trim(),
          date: form.date,
          time: form.time,
          category: form.category
        });

        setTasks((current) =>
          current
            .map((task) => (task.id === updated.id ? updated : task))
            .sort((a, b) => {
              const first = new Date(`${a.date}T${a.time}`);
              const second = new Date(`${b.date}T${b.time}`);
              return first - second;
            })
        );
      } else {
        const created = await createTask({
          title: form.title.trim(),
          description: form.description.trim(),
          date: form.date,
          time: form.time,
          category: form.category
        });

        setTasks((current) =>
          [...current, created].sort((a, b) => {
            const first = new Date(`${a.date}T${a.time}`);
            const second = new Date(`${b.date}T${b.time}`);
            return first - second;
          })
        );
      }

      setError("");
      resetForm();
    } catch (err) {
      setError("Unable to save this task. Please try again.");
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      date: task.date,
      time: task.time,
      category: task.category
    });
    setError("");
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (err) {
      setError("Unable to delete this task.");
    }
  };

  return (
    <div className="app-shell">
      <aside className="panel form-panel">
        <div className="panel-header">
          <p className="eyebrow">Planner</p>
          <h1>{editingId ? "Update event" : "Add a new task"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <label>
            <span>Title</span>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Product demo"
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add details for the task"
              rows="4"
            />
          </label>

          <div className="form-row">
            <label>
              <span>Date</span>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>Time</span>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            <span>Category</span>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Health">Health</option>
              <option value="Design">Design</option>
              <option value="Study">Study</option>
            </select>
          </label>

          {error ? <p className="error-message">{error}</p> : null}

          <div className="actions">
            <button type="submit" className="primary-button">
              {editingId ? "Save changes" : "Save task"}
            </button>

            {editingId ? (
              <button type="button" className="secondary-button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </aside>

      <main className="panel list-panel">
        <div className="list-header">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>My schedule</h2>
          </div>

          <div className="stats">
            <span>{tasks.length} total</span>
            <span>{upcomingCount} upcoming</span>
          </div>
        </div>

        <label className="search-box">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks"
          />
        </label>

        {loading ? (
          <div className="empty-state">
            <p>Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks match your current search.</p>
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-card">
                <div className="task-card-top">
                  <span className="badge">{task.category}</span>
                  <div className="task-actions">
                    <button type="button" onClick={() => handleEdit(task)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(task.id)}>
                      Delete
                    </button>
                  </div>
                </div>

                <h3>{task.title}</h3>

                {task.description ? <p className="description">{task.description}</p> : null}

                <div className="meta">
                  <span>{formatDisplayDate(task.date)}</span>
                  <span>{formatDisplayTime(task.time)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}