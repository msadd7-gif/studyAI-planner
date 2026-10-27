import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, CalendarClock, Gauge, Hourglass, ListOrdered, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyAI Planner — Organiza tu semestre con IA" },
      { name: "description", content: "Prioriza tareas, exámenes y proyectos y genera tu cronograma semanal automáticamente." },
      { property: "og:title", content: "StudyAI Planner — Organiza tu semestre con IA" },
      { property: "og:description", content: "Prioriza tareas y genera tu cronograma semanal con IA." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: ListOrdered, t: "Priorización automática", d: "La IA ordena tus pendientes según urgencia y esfuerzo.", c: "bg-grape-soft text-grape" },
  { icon: CalendarClock, t: "Cronograma semanal", d: "Bloques de estudio ajustados a tus horas libres.", c: "bg-mint-soft text-secondary-foreground" },
  { icon: Gauge, t: "Dashboard y avance", d: "Mira tu progreso y tu productividad en tiempo real.", c: "bg-tangerine-soft text-accent-foreground" },
];

const steps = [
  { icon: Hourglass, t: "1. Analiza el tiempo", d: "Calcula los días restantes hasta cada fecha límite y las horas de trabajo pendientes (horas estimadas × % sin completar)." },
  { icon: Target, t: "2. Pondera el esfuerzo", d: "Multiplica por la dificultad (baja ×1, media ×1.5, alta ×2) y el tipo de actividad (examen ×1.4, proyecto ×1.2)." },
  { icon: Brain, t: "3. Calcula la prioridad", d: "Puntaje = (urgencia + carga diaria × 2) × pesos. Lo más urgente y pesado sube al primer lugar." },
  { icon: Sparkles, t: "4. Reparte tu semana", d: "Llena tus horas disponibles de cada día con las tareas de mayor puntaje, repartiendo el trabajo antes de la fecha límite." },
];

function Index() {
  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-[2rem] bg-hero px-6 py-14 text-primary-foreground md:px-14 md:py-20">
        <div className="pointer-events-none absolute -right-4 top-6 hidden text-7xl md:block">
          <span className="inline-block animate-float">📚</span>
        </div>
        <div className="pointer-events-none absolute bottom-6 right-24 hidden text-6xl md:block">
          <span className="inline-block animate-float [animation-delay:1.5s]">🎓</span>
        </div>
        <div className="pointer-events-none absolute right-60 top-10 hidden text-5xl lg:block">
          <span className="inline-block animate-float [animation-delay:0.8s]">✏️</span>
        </div>
        <div className="relative max-w-2xl animate-pop">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-1.5 text-sm font-bold">
            <Sparkles className="h-4 w-4" /> Tu asistente académico con IA
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
            Estudia menos estresado, rinde más.
          </h1>
          <p className="mt-4 text-lg opacity-90">
            StudyAI Planner organiza tus tareas, proyectos y exámenes y crea tu semana de estudio ideal en segundos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-full font-bold">
              <Link to="/tareas">Agregar mi primera tarea</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary-foreground/60 bg-transparent font-bold text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground">
              <Link to="/dashboard">Ver dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {features.map(({ icon: Icon, t, d, c }, i) => (
          <div key={t} className="card-fun animate-pop p-6 transition hover:-translate-y-1" style={{ animationDelay: `${i * 100}ms` }}>
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${c}`}>
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-xl font-bold">{t}</h3>
            <p className="mt-1 text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <section id="ia">
        <div className="mb-8 text-center">
          <span className="text-4xl">🤖</span>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Cómo la IA optimiza tu tiempo</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Nada de cajas negras: así decide StudyAI qué deberías estudiar primero.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, t, d }) => (
            <div key={t} className="card-fun p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-fresh text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-3xl border-2 border-dashed border-grape/40 bg-grape-soft p-5 text-center text-sm font-semibold text-grape">
          💡 Cada vez que actualizas tu avance o tus horas disponibles, el plan se recalcula al instante.
        </div>
      </section>
    </div>
  );
}
