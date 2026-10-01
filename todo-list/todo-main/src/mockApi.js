const initialTasks = [
  {
    id: "task-1",
    title: "Product launch prep",
    description: "Prepare release notes and final QA checklist.",
    date: "2026-10-05",
    time: "09:30",
    category: "Work",
  },
  {
    id: "task-2",
    title: "Design sprint review",
    description: "Review mockups with the design and product teams.",
    date: "2026-10-08",
    time: "15:00",
    category: "Design",
  },
  {
    id: "task-3",
    title: "Grocery run",
    description: "Buy milk, fruits, and office snacks.",
    date: "2026-10-03",
    time: "18:15",
    category: "Personal",
  },
];

let taskStore = [...initialTasks];

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const sortTasks = (items) =>
  [...items].sort((a, b) => {
    const aValue = new Date(`${a.date}T${a.time}`);
    const bValue = new Date(`${b.date}T${b.time}`);
    return aValue - bValue;
  });

export async function getTasks() {
  await wait();
  return sortTasks(taskStore);
}

export async function searchTasks(query) {
  await wait();
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return sortTasks(taskStore);
  }

  return sortTasks(
    taskStore.filter((task) => {
      const haystack = `${task.title} ${task.description} ${task.category}`.toLowerCase();
      return haystack.includes(normalized);
    })
  );
}

export async function createTask(task) {
  await wait();
  const newTask = {
    ...task,
    id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  };

  taskStore = [...taskStore, newTask];
  return newTask;
}

export async function updateTask(id, updatedValues) {
  await wait();
  taskStore = taskStore.map((task) =>
    task.id === id ? { ...task, ...updatedValues } : task
  );

  return taskStore.find((task) => task.id === id);
}

export async function deleteTask(id) {
  await wait();
  taskStore = taskStore.filter((task) => task.id !== id);
  return true;
}