import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/AppNav";
import { PriorityBadge } from "@/components/PriorityBadge";
import { buildWeek, priorityScore } from "@/lib/planner";
import { useStudy } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendario — StudyAI Planner" },
      { name: "description", content: "Calendario interactivo con fechas límite y bloques de estudio." },
      { property: "og:title", content: "Calendario — StudyAI Planner" },
      { property: "og:description", content: "Tus entregas y sesiones de estudio en un calendario." },
    ],
  }),
  component: Calendario,
});

function Calendario() {
  const { tasks, hoursPerDay } = useStudy();
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const week = buildWeek(tasks, hoursPerDay);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const dueOn = (d: Date) => tasks.filter((t) => isSameDay(parseISO(t.deadline), d));
  const planOn = (d: Date) => week.find((w) => w.date === format(d, "yyyy-MM-dd"));
  const selDue = dueOn(selected);
  const selPlan = planOn(selected);

  return (
    <div>
      <PageHeader emoji="📅" title="Calendario" subtitle="Toca un día para ver entregas y sesiones de estudio." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-fun p-4 md:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <button aria-label="Mes anterior" onClick={() => setMonth(addMonths(month, -1))} className="rounded-full p-2 hover:bg-muted"><ChevronLeft /></button>
            <h2 className="text-xl font-bold capitalize">{format(month, "MMMM yyyy", { locale: es })}</h2>
            <button aria-label="Mes siguiente" onClick={() => setMonth(addMonths(month, 1))} className="rounded-full p-2 hover:bg-muted"><ChevronRight /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase text-muted-foreground">
            {["L", "M", "X", "J", "V", "S", "D"].map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const due = dueOn(d);
              const plan = planOn(d);
              const sel = isSameDay(d, selected);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelected(d)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-start gap-1 rounded-2xl p-1 text-sm font-bold transition hover:bg-muted",
                    !isSameMonth(d, month) && "opacity-30",
                    isSameDay(d, new Date()) && "ring-2 ring-tangerine",
                    sel && "bg-grape text-primary-foreground hover:bg-grape",
                  )}
                >
                  <span className="mt-1">{format(d, "d")}</span>
                  <span className="flex gap-0.5">
                    {due.slice(0, 3).map((t) => <span key={t.id} className="h-1.5 w-1.5 rounded-full bg-tangerine" />)}
                    {plan && plan.blocks.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-mint" />}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-tangerine" /> Fecha límite</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-mint" /> Sesión de estudio</span>
          </div>
        </div>

        <div className="card-fun p-6">
          <h3 className="text-lg font-bold capitalize">{format(selected, "EEEE d 'de' MMMM", { locale: es })}</h3>
          <p className="mt-4 text-sm font-bold text-accent-foreground">⏰ Entregas</p>
          {selDue.length === 0 && <p className="text-sm text-muted-foreground">Nada que entregar.</p>}
          {selDue.map((t) => (
            <div key={t.id} className="mt-2 flex items-center justify-between rounded-xl bg-tangerine-soft p-2.5 text-sm">
              <span className="font-bold">{t.title}</span>
              <PriorityBadge score={priorityScore(t)} />
            </div>
          ))}
          <p className="mt-5 text-sm font-bold text-secondary-foreground">📖 Plan de estudio IA</p>
          {!selPlan && <p className="text-sm text-muted-foreground">El plan cubre los próximos 7 días.</p>}
          {selPlan && selPlan.blocks.length === 0 && <p className="text-sm text-muted-foreground">Día libre 😎</p>}
          {selPlan?.blocks.map((b) => (
            <div key={b.taskId} className="mt-2 flex justify-between rounded-xl bg-mint-soft p-2.5 text-sm">
              <span className="font-bold">{b.title}</span><span>{b.hours} h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
