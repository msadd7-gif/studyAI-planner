import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";

export type Difficulty = "baja" | "media" | "alta";
export type TaskType = "tarea" | "proyecto" | "examen";

export interface Task {
  id: string;
  title: string;
  subject: string;
  type: TaskType;
  deadline: string; // yyyy-MM-dd
  difficulty: Difficulty;
  estHours: number;
  progress: number; // 0-100
}

export const DIFF_WEIGHT: Record<Difficulty, number> = { baja: 1, media: 1.5, alta: 2 };
export const TYPE_WEIGHT: Record<TaskType, number> = { tarea: 1, proyecto: 1.2, examen: 1.4 };

export const remainingHours = (t: Task) => Math.max(0, +(t.estHours * (1 - t.progress / 100)).toFixed(1));

export function daysLeft(t: Task, today = new Date()) {
  return differenceInCalendarDays(parseISO(t.deadline), startOfDay(today));
}

/** Priority score: more difficulty, more remaining work and closer deadline => higher. */
export function priorityScore(t: Task, today = new Date()) {
  if (t.progress >= 100) return 0;
  const d = Math.max(daysLeft(t, today), 0) + 1;
  const urgency = 10 / d;
  const workload = remainingHours(t) / d;
  return +((urgency + workload * 2) * DIFF_WEIGHT[t.difficulty] * TYPE_WEIGHT[t.type]).toFixed(2);
}

export function priorityLabel(score: number) {
  if (score >= 12) return { label: "Urgente", tone: "destructive" as const };
  if (score >= 5) return { label: "Alta", tone: "tangerine" as const };
  if (score > 0) return { label: "Normal", tone: "mint" as const };
  return { label: "Lista", tone: "muted" as const };
}

export function prioritize(tasks: Task[], today = new Date()) {
  return [...tasks]
    .filter((t) => t.progress < 100)
    .sort((a, b) => priorityScore(b, today) - priorityScore(a, today));
}

export interface Block { taskId: string; title: string; subject: string; hours: number }
export interface DayPlan { date: string; blocks: Block[]; used: number }

/** Greedy weekly schedule: each day fills available hours with the highest-priority pending work. */
export function buildWeek(tasks: Task[], hoursPerDay: number, today = new Date()): DayPlan[] {
  const left = new Map(tasks.map((t) => [t.id, remainingHours(t)]));
  const days: DayPlan[] = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(startOfDay(today), i);
    let cap = hoursPerDay;
    const blocks: Block[] = [];
    const ordered = prioritize(tasks, day).filter(
      (t) => (left.get(t.id) ?? 0) > 0 && differenceInCalendarDays(parseISO(t.deadline), day) >= 0,
    );
    for (const t of ordered) {
      if (cap <= 0) break;
      const rem = left.get(t.id)!;
      const dl = differenceInCalendarDays(parseISO(t.deadline), day) + 1;
      const share = Math.min(rem, cap, Math.max(1, Math.ceil((rem / dl) * 2) / 2));
      if (share <= 0) continue;
      blocks.push({ taskId: t.id, title: t.title, subject: t.subject, hours: share });
      left.set(t.id, +(rem - share).toFixed(1));
      cap = +(cap - share).toFixed(1);
    }
    days.push({ date: format(day, "yyyy-MM-dd"), blocks, used: +(hoursPerDay - cap).toFixed(1) });
  }
  return days;
}

export function seedTasks(today = new Date()): Task[] {
  const d = (n: number) => format(addDays(today, n), "yyyy-MM-dd");
  return [
    { id: "s1", title: "Parcial de Cálculo II", subject: "Matemáticas", type: "examen", deadline: d(4), difficulty: "alta", estHours: 8, progress: 25 },
    { id: "s2", title: "Ensayo de Ética", subject: "Humanidades", type: "tarea", deadline: d(2), difficulty: "media", estHours: 3, progress: 40 },
    { id: "s3", title: "App de inventario", subject: "Programación", type: "proyecto", deadline: d(10), difficulty: "alta", estHours: 15, progress: 10 },
    { id: "s4", title: "Lectura cap. 5", subject: "Economía", type: "tarea", deadline: d(1), difficulty: "baja", estHours: 1.5, progress: 0 },
    { id: "s5", title: "Laboratorio de Física", subject: "Física", type: "tarea", deadline: d(6), difficulty: "media", estHours: 4, progress: 100 },
  ];
}
