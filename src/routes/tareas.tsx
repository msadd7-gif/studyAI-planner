import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppNav";
import { PriorityBadge, ProgressBar } from "@/components/PriorityBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { prioritize, priorityScore, type Difficulty, type TaskType } from "@/lib/planner";
import { useStudy } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tareas")({
  head: () => ({
    meta: [
      { title: "Registro de tareas — StudyAI Planner" },
      { name: "description", content: "Registra tareas, proyectos y exámenes con fecha límite y dificultad." },
      { property: "og:title", content: "Registro de tareas — StudyAI Planner" },
      { property: "og:description", content: "Registra tus actividades académicas." },
    ],
  }),
  component: Tareas,
});

const typeEmoji: Record<TaskType, string> = { tarea: "📝", proyecto: "🧪", examen: "🧠" };

function Tareas() {
  const { tasks, addTask, updateTask, removeTask } = useStudy();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<TaskType>("tarea");
  const [deadline, setDeadline] = useState(format(addDays(new Date(), 3), "yyyy-MM-dd"));
  const [difficulty, setDifficulty] = useState<Difficulty>("media");
  const [estHours, setEstHours] = useState(2);

  const sorted = [...prioritize(tasks), ...tasks.filter((t) => t.progress >= 100)];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Ponle un nombre a la tarea"); return; }
    addTask({ title: title.trim(), subject: subject.trim() || "General", type, deadline, difficulty, estHours, progress: 0 });
    setTitle("");
    setSubject("");
    toast.success("¡Tarea agregada! La IA ya la priorizó ✨");
  };

  return (
    <div>
      <PageHeader emoji="📝" title="Registro de tareas" subtitle="Agrega tus actividades y deja que la IA las ordene." />
      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={submit} className="card-fun h-fit space-y-4 p-6 lg:col-span-2">
          <div>
            <Label htmlFor="t">Nombre</Label>
            <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Informe de química" className="mt-1" maxLength={80} />
          </div>
          <div>
            <Label htmlFor="s">Materia</Label>
            <Input id="s" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ej. Química" className="mt-1" maxLength={40} />
          </div>
          <div>
            <Label>Tipo</Label>
            <Chips value={type} onChange={setType} options={["tarea", "proyecto", "examen"]} render={(o) => `${typeEmoji[o]} ${o}`} />
          </div>
          <div>
            <Label>Dificultad</Label>
            <Chips value={difficulty} onChange={setDifficulty} options={["baja", "media", "alta"]} render={(o) => ({ baja: "🟢", media: "🟠", alta: "🟣" })[o] + " " + o} />
          </div>
          <div>
            <Label htmlFor="d">Fecha límite</Label>
            <Input id="d" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1" required />
          </div>
          <div>
            <Label>Horas estimadas: <b>{estHours} h</b></Label>
            <Slider className="mt-3" min={0.5} max={30} step={0.5} value={[estHours]} onValueChange={(v) => setEstHours(v[0] ?? 0)} />
          </div>
          <Button type="submit" size="lg" className="w-full rounded-full font-bold shadow-pop">
            <Plus className="h-4 w-4" /> Agregar tarea
          </Button>
        </form>

        <div className="space-y-3 lg:col-span-3">
          {sorted.length === 0 && <p className="card-fun p-6 text-muted-foreground">Aún no tienes tareas. ¡Agrega la primera!</p>}
          {sorted.map((t) => (
            <div key={t.id} className={cn("card-fun animate-pop p-5", t.progress >= 100 && "opacity-60")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{typeEmoji[t.type]} {t.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.subject} · dificultad {t.difficulty} · {t.estHours} h · {format(parseISO(t.deadline), "EEE d MMM", { locale: es })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge score={priorityScore(t)} />
                  <button aria-label="Eliminar" onClick={() => removeTask(t.id)} className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar value={t.progress} />
                <span className="w-10 text-right text-sm font-bold">{t.progress}%</span>
              </div>
              <Slider className="mt-3" min={0} max={100} step={5} value={[t.progress]} onValueChange={(v) => updateTask(t.id, { progress: v[0] ?? 0 })} aria-label="Avance" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Chips<T extends string>({ value, onChange, options, render }: { value: T; onChange: (v: T) => void; options: T[]; render: (o: T) => string }) {
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          type="button"
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full border-2 px-3 py-1.5 text-sm font-bold capitalize transition",
            value === o ? "border-grape bg-grape-soft text-grape" : "text-muted-foreground hover:bg-muted",
          )}
        >
          {render(o)}
        </button>
      ))}
    </div>
  );
}
