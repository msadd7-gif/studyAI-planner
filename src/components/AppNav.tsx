import { Link } from "@tanstack/react-router";
import { BarChart3, CalendarDays, GraduationCap, Home, LayoutDashboard, ListPlus } from "lucide-react";

const links = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tareas", label: "Tareas", icon: ListPlus },
  { to: "/calendario", label: "Calendario", icon: CalendarDays },
  { to: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
] as const;

export function AppNav() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b-2 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-hero text-primary-foreground shadow-pop">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold">
              StudyAI <span className="text-grape">Planner</span>
            </span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: true }}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted"
                activeProps={{ className: "bg-grape-soft text-grape" }}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <nav className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-3xl border-2 bg-card p-1.5 shadow-pop md:hidden">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-bold text-muted-foreground"
            activeProps={{ className: "bg-grape-soft text-grape" }}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}

export function PageHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="mb-6 animate-pop">
      <h1 className="text-3xl font-bold md:text-4xl">
        <span className="mr-2 inline-block animate-float">{emoji}</span>
        {title}
      </h1>
      <p className="mt-1 text-muted-foreground">{subtitle}</p>
    </div>
  );
}
