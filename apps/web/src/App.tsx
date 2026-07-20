import { FormEvent, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  cambiarContrasenaInicial,
  getApiUrl,
  login,
  LoginResponse,
} from "./api";

type Page = "inicio" | "matriculas" | "asistencia" | "personal" | "academico";
type AttendanceStatus = "presente" | "ausente" | "tarde" | "excusado";

interface Session {
  name: string;
  email: string;
  role: string;
  institution: string;
  initials: string;
  demo: boolean;
}

const demoSession: Session = {
  name: "Mariana Ríos",
  email: "mariana.rios@colegio.edu.co",
  role: "Administradora institucional",
  institution: "Institución Educativa Horizonte",
  initials: "MR",
  demo: true,
};

const navItems: Array<{
  id: Page;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "inicio", label: "Inicio", icon: LayoutDashboard },
  { id: "academico", label: "Estructura académica", icon: BookOpen },
  { id: "matriculas", label: "Matrículas", icon: GraduationCap },
  { id: "asistencia", label: "Asistencia", icon: ClipboardCheck },
  { id: "personal", label: "Personal", icon: Users },
];

const enrollments = [
  {
    id: "MAT-260184",
    student: "Samuel Morales",
    grade: "8° A",
    date: "18 jul 2026",
    status: "Activa",
    pending: false,
  },
  {
    id: "MAT-260183",
    student: "Luciana Torres",
    grade: "6° B",
    date: "18 jul 2026",
    status: "Pendiente acudiente",
    pending: true,
  },
  {
    id: "MAT-260182",
    student: "Martín Valencia",
    grade: "10° A",
    date: "17 jul 2026",
    status: "Activa",
    pending: false,
  },
  {
    id: "MAT-260181",
    student: "Antonella Castro",
    grade: "7° A",
    date: "17 jul 2026",
    status: "Activa",
    pending: false,
  },
  {
    id: "MAT-260180",
    student: "Emiliano Rojas",
    grade: "9° B",
    date: "16 jul 2026",
    status: "Pendiente acudiente",
    pending: true,
  },
];

const initialStudents = [
  {
    id: "01",
    name: "Ana Sofía Bermúdez",
    code: "EST-1048",
    status: "presente" as AttendanceStatus,
    minutes: 0,
  },
  {
    id: "02",
    name: "Daniel Esteban Cárdenas",
    code: "EST-1051",
    status: "presente" as AttendanceStatus,
    minutes: 0,
  },
  {
    id: "03",
    name: "Emma Juliana Delgado",
    code: "EST-1059",
    status: "tarde" as AttendanceStatus,
    minutes: 12,
  },
  {
    id: "04",
    name: "Jerónimo Fernández",
    code: "EST-1063",
    status: "ausente" as AttendanceStatus,
    minutes: 0,
  },
  {
    id: "05",
    name: "María José García",
    code: "EST-1070",
    status: "presente" as AttendanceStatus,
    minutes: 0,
  },
  {
    id: "06",
    name: "Nicolás Hernández",
    code: "EST-1078",
    status: "excusado" as AttendanceStatus,
    minutes: 0,
  },
  {
    id: "07",
    name: "Salomé Jiménez",
    code: "EST-1082",
    status: "presente" as AttendanceStatus,
    minutes: 0,
  },
];

function App() {
  const stored = sessionStorage.getItem("admincoleg.session");
  const [session, setSession] = useState<Session | null>(() =>
    stored ? (JSON.parse(stored) as Session) : null,
  );

  function enter(next: Session) {
    sessionStorage.setItem("admincoleg.session", JSON.stringify(next));
    setSession(next);
  }

  function logout() {
    sessionStorage.clear();
    setSession(null);
  }

  if (!session) return <LoginScreen onLogin={enter} />;
  return <ApplicationShell session={session} onLogout={logout} />;
}

function LoginScreen({ onLogin }: { onLogin: (session: Session) => void }) {
  const [step, setStep] = useState<"login" | "change-password">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response.requiereCambioContrasena) {
        setStep("change-password");
        return;
      }
      if (response.requiereSeleccionPerfil) {
        throw new Error(
          "La cuenta tiene varios perfiles. La selección estará disponible en la próxima entrega.",
        );
      }
      completeLogin(response);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No fue posible iniciar sesión",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitPasswordChange(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (newPassword === password) {
      setError("La nueva contraseña debe ser diferente de la temporal.");
      return;
    }
    setLoading(true);
    try {
      const response = await cambiarContrasenaInicial(
        email,
        password,
        newPassword,
      );
      completeLogin(response);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No fue posible actualizar la contraseña",
      );
    } finally {
      setLoading(false);
    }
  }

  function completeLogin(response: LoginResponse) {
    if (!response.accessToken)
      throw new Error("La respuesta no contiene una sesión válida.");
    sessionStorage.setItem("admincoleg.accessToken", response.accessToken);
    if (response.refreshToken)
      sessionStorage.setItem("admincoleg.refreshToken", response.refreshToken);
    const role =
      response.contextoAcceso?.roles?.[0]?.nombre ??
      response.contextoAcceso?.roles?.[0]?.codigo ??
      "Usuario institucional";
    onLogin({
      name: email.split("@")[0].split(".").map(capitalize).join(" "),
      email,
      role,
      institution: "Institución activa",
      initials: initialsFrom(email.split("@")[0]),
      demo: false,
    });
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-label="Presentación de AdminColeg">
        <div className="brand brand--light">
          <span className="brand__mark">
            <GraduationCap size={25} />
          </span>
          <span>AdminColeg</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow eyebrow--light">Gestión educativa, sin ruido</p>
          <h1>Más tiempo para acompañar. Menos tiempo administrando.</h1>
          <p>
            Una plataforma clara para organizar la vida académica de toda la
            comunidad educativa.
          </p>
        </div>
        <div className="story-proof">
          <span className="proof-icon">
            <ShieldCheck size={19} />
          </span>
          <div>
            <strong>Información protegida</strong>
            <small>Acceso institucional y trazabilidad completa</small>
          </div>
        </div>
        <div className="story-orbit story-orbit--one" />
        <div className="story-orbit story-orbit--two" />
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-brand brand">
            <span className="brand__mark">
              <GraduationCap size={22} />
            </span>
            <span>AdminColeg</span>
          </div>
          <p className="eyebrow">
            {step === "login" ? "Bienvenido de nuevo" : "Protege tu cuenta"}
          </p>
          <h2>
            {step === "login"
              ? "Ingresa a tu institución"
              : "Crea una contraseña nueva"}
          </h2>
          <p className="muted">
            {step === "login"
              ? "Usa las credenciales asignadas por tu administrador."
              : "Este cambio es obligatorio en tu primer ingreso. La contraseña temporal dejará de funcionar."}
          </p>
          {step === "login" ? (
            <form onSubmit={submit} className="login-form">
              <label>
                Correo institucional
                <input
                  data-testid="email-input"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@colegio.edu.co"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label>
                Contraseña
                <input
                  data-testid="password-input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </label>
              <div className="form-row">
                <label className="check-label">
                  <input type="checkbox" /> Recordar mi correo
                </label>
                <button type="button" className="link-button">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button button--primary button--full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Verificando…" : "Ingresar"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitPasswordChange} className="login-form">
              <label>
                Correo de acceso
                <input type="email" value={email} disabled />
              </label>
              <label>
                Nueva contraseña
                <input
                  data-testid="new-password-input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={8}
                  required
                  autoFocus
                />
              </label>
              <label>
                Confirmar nueva contraseña
                <input
                  data-testid="confirm-password-input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </label>
              <div className="password-hint">
                <ShieldCheck size={16} />
                <span>
                  Usa una combinación única de letras, números y símbolos.
                </span>
              </div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button
                data-testid="change-password-submit"
                className="button button--primary button--full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Actualizando…" : "Cambiar contraseña y continuar"}
              </button>
              <button
                type="button"
                className="link-button back-to-login"
                onClick={() => {
                  setStep("login");
                  setPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError("");
                }}
              >
                Volver al inicio de sesión
              </button>
            </form>
          )}
          {step === "login" && (
            <>
              <div className="divider">
                <span>o revisa la interfaz</span>
              </div>
              <button
                data-testid="demo-login"
                className="button button--demo button--full"
                onClick={() => onLogin(demoSession)}
              >
                <Sparkles size={17} /> Entrar en modo demostración
              </button>
            </>
          )}
          <small className="api-note">
            Gateway configurado en {getApiUrl()}
          </small>
        </div>
      </section>
    </main>
  );
}

function ApplicationShell({
  session,
  onLogout,
}: {
  session: Session;
  onLogout: () => void;
}) {
  const [page, setPage] = useState<Page>("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  function navigate(next: Page) {
    setPage(next);
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__top">
          <div className="brand brand--light">
            <span className="brand__mark">
              <GraduationCap size={23} />
            </span>
            <span>AdminColeg</span>
          </div>
          <button
            className="icon-button sidebar-close"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="school-chip">
          <span>IE</span>
          <div>
            <strong>Horizonte</strong>
            <small>Sede principal</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav className="main-nav" aria-label="Navegación principal">
          <p>Gestión</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                data-testid={`nav-${item.id}`}
                key={item.id}
                className={
                  page === item.id ? "nav-item nav-item--active" : "nav-item"
                }
                onClick={() => navigate(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.id === "matriculas" && <b>2</b>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar__help">
          <div className="help-icon">
            <Sparkles size={17} />
          </div>
          <strong>¿Necesitas ayuda?</strong>
          <p>Consulta la guía rápida para administradores.</p>
          <button>Ver guía</button>
        </div>
        <div className="sidebar-user">
          <span className="avatar">{session.initials}</span>
          <div>
            <strong>{session.name}</strong>
            <small>{session.role}</small>
          </div>
          <button aria-label="Cerrar sesión" onClick={onLogout}>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <section className="workspace">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="topbar__context">
            <span>{session.institution}</span>
            <small>Año lectivo 2026</small>
          </div>
          {session.demo && (
            <span className="demo-badge">
              <Sparkles size={14} /> Modo demostración
            </span>
          )}
          <div className="topbar__actions">
            <button
              className="icon-button notification-button"
              aria-label="Notificaciones"
            >
              <Bell size={20} />
              <i />
            </button>
            <span className="topbar-avatar">{session.initials}</span>
          </div>
        </header>
        <main className="page-content">
          {page === "inicio" && <Dashboard onNavigate={navigate} />}
          {page === "matriculas" && <EnrollmentsPage onToast={setToast} />}
          {page === "asistencia" && <AttendancePage onToast={setToast} />}
          {page === "personal" && <PlaceholderPage type="personal" />}
          {page === "academico" && <PlaceholderPage type="academico" />}
        </main>
      </section>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button aria-label="Cerrar notificación" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function Dashboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Domingo, 19 de julio</p>
          <h1>Buenos días, Mariana</h1>
          <p>Esto es lo que está pasando hoy en tu institución.</p>
        </div>
        <button
          className="button button--primary"
          onClick={() => onNavigate("matriculas")}
        >
          <UserPlus size={17} /> Nueva matrícula
        </button>
      </div>
      <section className="metrics-grid">
        <Metric
          icon={GraduationCap}
          tone="teal"
          label="Estudiantes activos"
          value="486"
          trend="+18 este año"
        />
        <Metric
          icon={Users}
          tone="blue"
          label="Personal docente"
          value="32"
          trend="100% con carga"
        />
        <Metric
          icon={ClipboardCheck}
          tone="amber"
          label="Asistencia hoy"
          value="94,8%"
          trend="2,1% sobre ayer"
        />
        <Metric
          icon={CalendarDays}
          tone="coral"
          label="Matrículas pendientes"
          value="2"
          trend="Requieren acudiente"
          action={() => onNavigate("matriculas")}
        />
      </section>
      <section className="dashboard-grid">
        <article className="panel attendance-overview">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Asistencia semanal</p>
              <h2>Una semana estable</h2>
            </div>
            <button className="select-button">
              Esta semana <ChevronDown size={15} />
            </button>
          </div>
          <div
            className="chart-area"
            aria-label="Gráfico de asistencia semanal"
          >
            {[
              { d: "Lun", v: 91 },
              { d: "Mar", v: 96 },
              { d: "Mié", v: 94 },
              { d: "Jue", v: 97 },
              { d: "Vie", v: 95 },
            ].map((bar) => (
              <div className="bar-column" key={bar.d}>
                <span>{bar.v}%</span>
                <div className="bar-track">
                  <i style={{ height: `${bar.v}%` }} />
                </div>
                <small>{bar.d}</small>
              </div>
            ))}
          </div>
          <div className="panel-note">
            <TrendingUp size={17} />
            <span>
              <strong>+1,4%</strong> frente al promedio del mes anterior
            </span>
          </div>
        </article>
        <article className="panel agenda-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Agenda</p>
              <h2>Próximos eventos</h2>
            </div>
            <button className="icon-button">
              <MoreHorizontal size={19} />
            </button>
          </div>
          <div className="agenda-list">
            <Agenda
              date="21"
              month="JUL"
              title="Cierre de matrículas"
              meta="Todo el día · Secretaría"
              tone="amber"
            />
            <Agenda
              date="24"
              month="JUL"
              title="Consejo académico"
              meta="2:00 p. m. · Sala múltiple"
              tone="teal"
            />
            <Agenda
              date="29"
              month="JUL"
              title="Entrega de informes"
              meta="7:00 a. m. · Todas las sedes"
              tone="blue"
            />
          </div>
          <button className="text-action">Ver calendario completo →</button>
        </article>
        <article className="panel recent-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Movimiento reciente</p>
              <h2>Últimas matrículas</h2>
            </div>
            <button
              className="text-action"
              onClick={() => onNavigate("matriculas")}
            >
              Ver todas
            </button>
          </div>
          <EnrollmentTable compact />
        </article>
        <article className="panel tasks-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Por resolver</p>
              <h2>Atención requerida</h2>
            </div>
            <span className="count-badge">4</span>
          </div>
          <Task
            icon={UserCheck}
            title="2 matrículas sin acudiente"
            text="El plazo más próximo vence en 4 días"
            action={() => onNavigate("matriculas")}
          />
          <Task
            icon={ClipboardCheck}
            title="Asistencia de 7° A abierta"
            text="Faltan 3 estudiantes por registrar"
            action={() => onNavigate("asistencia")}
          />
          <Task
            icon={Clock3}
            title="Periodo por cerrar"
            text="Segundo periodo · faltan 8 días"
          />
        </article>
      </section>
    </>
  );
}

function Metric({
  icon: Icon,
  tone,
  label,
  value,
  trend,
  action,
}: {
  icon: typeof Users;
  tone: string;
  label: string;
  value: string;
  trend: string;
  action?: () => void;
}) {
  return (
    <article
      className="metric-card"
      onClick={action}
      data-clickable={Boolean(action)}
    >
      <span className={`metric-icon metric-icon--${tone}`}>
        <Icon size={20} />
      </span>
      <div className="metric-main">
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{trend}</small>
      </div>
      {action && <span className="metric-arrow">→</span>}
    </article>
  );
}

function Agenda({
  date,
  month,
  title,
  meta,
  tone,
}: {
  date: string;
  month: string;
  title: string;
  meta: string;
  tone: string;
}) {
  return (
    <div className="agenda-item">
      <span className={`date-tile date-tile--${tone}`}>
        <b>{date}</b>
        <small>{month}</small>
      </span>
      <div>
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
    </div>
  );
}

function Task({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: typeof Users;
  title: string;
  text: string;
  action?: () => void;
}) {
  return (
    <button className="task-item" onClick={action}>
      <span>
        <Icon size={18} />
      </span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
      <b>→</b>
    </button>
  );
}

function EnrollmentsPage({ onToast }: { onToast: (message: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = enrollments.filter((item) =>
    `${item.student} ${item.id} ${item.grade}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Gestión estudiantil</p>
          <h1>Matrículas</h1>
          <p>Consulta y administra las matrículas del año lectivo actual.</p>
        </div>
        <button
          className="button button--primary"
          onClick={() =>
            onToast(
              "Formulario de matrícula preparado para la siguiente entrega",
            )
          }
        >
          <UserPlus size={17} /> Nueva matrícula
        </button>
      </div>
      <div className="summary-strip">
        <div>
          <span className="dot dot--green" />
          <strong>484</strong>
          <small>Activas</small>
        </div>
        <div>
          <span className="dot dot--amber" />
          <strong>2</strong>
          <small>Pendientes de acudiente</small>
        </div>
        <div>
          <span className="dot dot--gray" />
          <strong>7</strong>
          <small>Retiradas</small>
        </div>
      </div>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={18} />
            <input
              aria-label="Buscar matrículas"
              placeholder="Buscar estudiante, código o grado…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button className="select-button">
            Todos los estados <ChevronDown size={15} />
          </button>
        </div>
        <EnrollmentTable items={filtered} />
        <div className="table-footer">
          <span>Mostrando {filtered.length} de 486 matrículas</span>
          <div>
            <button disabled>Anterior</button>
            <button>Siguiente</button>
          </div>
        </div>
      </section>
    </>
  );
}

function EnrollmentTable({
  compact = false,
  items = enrollments,
}: {
  compact?: boolean;
  items?: typeof enrollments;
}) {
  const shown = compact ? items.slice(0, 4) : items;
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Código</th>
            <th>Grado</th>
            {!compact && <th>Fecha</th>}
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {shown.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="person-cell">
                  <span>{initialsFrom(item.student)}</span>
                  <strong>{item.student}</strong>
                </div>
              </td>
              <td className="mono">{item.id}</td>
              <td>{item.grade}</td>
              {!compact && <td>{item.date}</td>}
              <td>
                <span
                  className={
                    item.pending
                      ? "status status--pending"
                      : "status status--active"
                  }
                >
                  {item.status}
                </span>
              </td>
              <td>
                <button
                  className="icon-button"
                  aria-label={`Opciones de ${item.student}`}
                >
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttendancePage({ onToast }: { onToast: (message: string) => void }) {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const visible = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()),
  );
  const counts = useMemo(
    () =>
      students.reduce<Record<AttendanceStatus, number>>(
        (acc, student) => ({
          ...acc,
          [student.status]: acc[student.status] + 1,
        }),
        { presente: 0, ausente: 0, tarde: 0, excusado: 0 },
      ),
    [students],
  );

  function update(id: string, status: AttendanceStatus) {
    setStudents((current) =>
      current.map((student) =>
        student.id === id
          ? {
              ...student,
              status,
              minutes: status === "tarde" ? Math.max(student.minutes, 5) : 0,
            }
          : student,
      ),
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Domingo, 19 de julio</p>
          <h1>Tomar asistencia</h1>
          <p>7° A · Sesión diaria · Sede principal</p>
        </div>
        <div className="heading-actions">
          <button className="button button--secondary">Guardar borrador</button>
          <button
            data-testid="save-attendance"
            className="button button--primary"
            onClick={() =>
              onToast(`Asistencia guardada: ${counts.presente} presentes`)
            }
          >
            <Check size={17} /> Guardar asistencia
          </button>
        </div>
      </div>
      <div className="attendance-summary">
        <SummaryPill label="Presentes" value={counts.presente} tone="present" />
        <SummaryPill label="Ausentes" value={counts.ausente} tone="absent" />
        <SummaryPill label="Llegadas tarde" value={counts.tarde} tone="late" />
        <SummaryPill label="Excusados" value={counts.excusado} tone="excused" />
      </div>
      <section className="panel attendance-sheet">
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={18} />
            <input
              aria-label="Buscar estudiante"
              placeholder="Buscar estudiante…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span className="sheet-progress">
            <b>
              {students.length}/{students.length}
            </b>{" "}
            estudiantes registrados
          </span>
        </div>
        <div className="attendance-list">
          {visible.map((student) => (
            <div className="attendance-row" key={student.id}>
              <div className="person-cell">
                <span>{initialsFrom(student.name)}</span>
                <div>
                  <strong>{student.name}</strong>
                  <small>{student.code}</small>
                </div>
              </div>
              <div
                className="status-options"
                role="group"
                aria-label={`Asistencia de ${student.name}`}
              >
                {(
                  [
                    "presente",
                    "ausente",
                    "tarde",
                    "excusado",
                  ] as AttendanceStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    className={
                      student.status === status
                        ? `status-choice status-choice--${status} status-choice--selected`
                        : `status-choice status-choice--${status}`
                    }
                    onClick={() => update(student.id, status)}
                  >
                    {statusLabel(status)}
                  </button>
                ))}
              </div>
              {student.status === "tarde" ? (
                <label className="minutes-field">
                  <input
                    aria-label={`Minutos de retraso de ${student.name}`}
                    type="number"
                    min="1"
                    max="600"
                    value={student.minutes}
                    onChange={(event) =>
                      setStudents((current) =>
                        current.map((item) =>
                          item.id === student.id
                            ? { ...item, minutes: Number(event.target.value) }
                            : item,
                        ),
                      )
                    }
                  />
                  <span>min</span>
                </label>
              ) : (
                <span className="minutes-placeholder">—</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className={`summary-pill summary-pill--${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function PlaceholderPage({ type }: { type: "personal" | "academico" }) {
  const isStaff = type === "personal";
  return (
    <div className="placeholder-page">
      <span className="placeholder-icon">
        {isStaff ? <Users size={29} /> : <BookOpen size={29} />}
      </span>
      <p className="eyebrow">Módulo conectado al backend</p>
      <h1>{isStaff ? "Personal institucional" : "Estructura académica"}</h1>
      <p>
        {isStaff
          ? "Docentes, administrativos, directivos, sedes y áreas estarán disponibles en esta vista."
          : "Años lectivos, grados, grupos, asignaturas y cargas docentes estarán disponibles aquí."}
      </p>
      <button className="button button--primary">Diseñar esta vista</button>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
function initialsFrom(value: string) {
  return value
    .split(/[ ._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
function statusLabel(status: AttendanceStatus) {
  return {
    presente: "Presente",
    ausente: "Ausente",
    tarde: "Tarde",
    excusado: "Excusado",
  }[status];
}

export default App;
