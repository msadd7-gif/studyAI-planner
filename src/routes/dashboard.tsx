import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, CheckCircle2, Clock, Flame, ListTodo } from "lucide-react";
import { PageHeader } from "@/components/AppNav";
import { PriorityBadge, ProgressBar } from "@/components/PriorityBadge";
import { Slider } from "@/components/ui/slider";
import { buildWeek, daysLeft, prioritize, priorityScore, remainingHours } from "@/lib/planner";
import { useStudy } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — StudyAI Planner" },
      { name: "description", content: "Tus prioridades, recordatorios y cronograma semanal en un vistazo." },
      { property: "og:title", content: "Dashboard — StudyAI Planner" },
      { property: "og:description", content: "Prioridades, recordatorios y cronograma semanal." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { tasks, hoursPerDay, setHoursPerDay } = useStudy();
  const pending = prioritize(tasks);
  const done = tasks.filter((t) => t.progress >= 100).length;
  const avg = tasks.length ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length) : 0;
  const hoursLeft = tasks.reduce((s, t) => s + remainingHours(t), 0);
  const reminders = pending.filter((t) => daysLeft(t) <= 3);
  const week = buildWeek(tasks, hoursPerDay);

  const stats = [
    { icon: ListTodo, label: "Pendientes", value: pending.length, c: "bg-grape-soft text-grape" },
    { icon: CheckCircle2, label: "Completadas", value: done, c: "bg-mint-soft text-secondary-foreground" },
    { icon: Clock, label: "Horas restantes", value: hoursLeft.toFixed(1), c: "bg-tangerine-soft text-accent-foreground" },
    { icon: Flame, label: "Avance global", value: `${avg}%`, c: "bg-grape-soft text-grape" },
  ];

  return (
    <div>
      <PageHeader emoji="🚀" title="¡Hola, estudiante!" subtitle="Esto es lo que la IA recomienda para tu semana." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, c }, i) => (
          <div key={label} className="card-fun animate-pop p-5" style={{ animationDelay: `${i * 80}ms` }}>
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${c}`}><Icon className="h-5 w-5" /></span>
            <p className="mt-3 font-display text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {reminders.length > 0 && (
        <div className="mt-6 rounded-3xl border-2 border-tangerine/50 bg-tangerine-soft p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-accent-foreground">
            <Bell className="h-5 w-5 animate-bounce" /> Recordatorios
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {reminders.map((t) => {
              const d = daysLeft(t);
              return (
                <li key={t.id}>
                  <b>{t.title}</b> — {d < 0 ? "¡vencida!" : d === 0 ? "vence hoy" : d === 1 ? "vence mañana" : `vence en ${d} días`} · {remainingHours(t)} h restantes
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card-fun p-6 lg:col-span-2">
          <h2 className="text-xl font-bold">🎯 Prioridades IA</h2>
          {pending.length === 0 && <p className="mt-4 text-muted-foreground">¡Todo al día! 🎉</p>}
          <ol className="mt-4 space-y-3">
            {pending.slice(0, 5).map((t, i) => (
              <li key={t.id} className="rounded-2xl bg-muted/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold"><span className="text-grape">#{i + 1}</span> {t.title}</p>
                  <PriorityBadge score={priorityScore(t)} />
                </div>
                <p className="text-xs text-muted-foreground">{t.subject} · {format(parseISO(t.deadline), "d MMM", { locale: es })}</p>
                <ProgressBar value={t.progress} className="mt-2" />
              </li>
            ))}
          </ol>
          <Link to="/tareas" className="mt-4 inline-block text-sm font-bold text-grape hover:underline">Gestionar tareas →</Link>
        </section>

        <section className="card-fun p-6 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">🗓️ Cronograma semanal</h2>
            <div className="flex w-full items-center gap-3 sm:w-64">
              <span className="whitespace-nowrap text-sm font-bold">{hoursPerDay} h/día</span>
              <Slider min={1} max={12} step={0.5} value={[hoursPerDay]} onValueChange={(v) => setHoursPerDay(v[0] ?? 0)} />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {week.map((d) => (
              <div key={d.date} className="flex gap-3">
                <div className="w-14 shrink-0 text-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground">{format(parseISO(d.date), "EEE", { locale: es })}</p>
                  <p className="font-display text-xl font-bold">{format(parseISO(d.date), "d")}</p>
                </div>
                <div className="flex flex-1 flex-wrap gap-2">
                  {d.blocks.length === 0 && <span className="self-center text-sm text-muted-foreground">Día libre 😎</span>}
                  {d.blocks.map((b, i) => (
                    <span key={b.taskId} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${["bg-grape-soft text-grape", "bg-mint-soft text-secondary-foreground", "bg-tangerine-soft text-accent-foreground"][i % 3]}`}>
                      {b.title} · {b.hours}h
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
