import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { PageHeader } from "@/components/AppNav";
import { ProgressBar } from "@/components/PriorityBadge";
import { buildWeek, remainingHours } from "@/lib/planner";
import { useStudy } from "@/lib/store";

export const Route = createFileRoute("/estadisticas")({
  head: () => ({
    meta: [
      { title: "Estadísticas de productividad — StudyAI Planner" },
      { name: "description", content: "Gráficas de avance, carga semanal y distribución de tus tareas." },
      { property: "og:title", content: "Estadísticas de productividad — StudyAI Planner" },
      { property: "og:description", content: "Mide tu productividad académica." },
    ],
  }),
  component: Estadisticas,
});

const COLORS = ["var(--grape)", "var(--mint)", "var(--tangerine)"];

function Estadisticas() {
  const { tasks, hoursPerDay } = useStudy();
  const week = buildWeek(tasks, hoursPerDay).map((d) => ({
    day: format(parseISO(d.date), "EEE", { locale: es }),
    horas: d.used,
  }));
  const byDiff = (["baja", "media", "alta"] as const).map((k) => ({ name: k, value: tasks.filter((t) => t.difficulty === k).length }));
  const subjects = Object.entries(
    tasks.reduce<Record<string, { total: number; done: number; n: number }>>((acc, t) => {
      const s = (acc[t.subject] ??= { total: 0, done: 0, n: 0 });
      s.total += t.estHours;
      s.done += t.estHours - remainingHours(t);
      s.n++;
      return acc;
    }, {}),
  );
  const totalH = tasks.reduce((s, t) => s + t.estHours, 0);
  const doneH = tasks.reduce((s, t) => s + t.estHours - remainingHours(t), 0);
  const pct = totalH ? Math.round((doneH / totalH) * 100) : 0;

  return (
    <div>
      <PageHeader emoji="📊" title="Estadísticas de productividad" subtitle="Tu progreso, en números bonitos." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-fun flex flex-col items-center justify-center bg-hero p-8 text-primary-foreground">
          <p className="font-display text-7xl font-bold">{pct}%</p>
          <p className="mt-2 font-bold">del trabajo total completado</p>
          <p className="text-sm opacity-80">{doneH.toFixed(1)} de {totalH.toFixed(1)} horas</p>
        </div>
        <div className="card-fun p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">⏱️ Carga de estudio próximos 7 días</h2>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={week}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="horas" fill="var(--grape)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-fun p-6">
          <h2 className="mb-2 text-lg font-bold">🎚️ Por dificultad</h2>
          <div className="h-52">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byDiff} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={4}>
                  {byDiff.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-3 text-xs font-bold capitalize">
            {byDiff.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} /> {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
        <div className="card-fun p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">📚 Avance por materia</h2>
          <div className="space-y-4">
            {subjects.map(([name, s]) => {
              const p = s.total ? Math.round((s.done / s.total) * 100) : 0;
              return (
                <div key={name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-bold">{name} <span className="font-normal text-muted-foreground">· {s.n} actividad(es)</span></span>
                    <span className="font-bold">{p}%</span>
                  </div>
                  <ProgressBar value={p} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
