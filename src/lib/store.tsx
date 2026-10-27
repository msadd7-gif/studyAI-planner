import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { seedTasks, type Task } from "./planner";

interface Ctx {
  tasks: Task[];
  hoursPerDay: number;
  setHoursPerDay: (h: number) => void;
  addTask: (t: Omit<Task, "id">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
}

const StudyCtx = createContext<Ctx | null>(null);
const KEY = "studyai-planner-v1";

export function StudyProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => seedTasks());
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p.tasks)) setTasks(p.tasks);
        if (typeof p.hoursPerDay === "number") setHoursPerDay(p.hoursPerDay);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ tasks, hoursPerDay }));
  }, [tasks, hoursPerDay, loaded]);

  const value: Ctx = {
    tasks,
    hoursPerDay,
    setHoursPerDay,
    addTask: (t) => setTasks((s) => [...s, { ...t, id: crypto.randomUUID() }]),
    updateTask: (id, patch) => setTasks((s) => s.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    removeTask: (id) => setTasks((s) => s.filter((t) => t.id !== id)),
  };
  return <StudyCtx.Provider value={value}>{children}</StudyCtx.Provider>;
}

export function useStudy() {
  const c = useContext(StudyCtx);
  if (!c) throw new Error("useStudy outside provider");
  return c;
}
