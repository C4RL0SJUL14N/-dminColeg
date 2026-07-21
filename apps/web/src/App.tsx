import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Search,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  actualizarSede,
  actualizarInstitucion,
  AnioLectivoResponse,
  cambiarContrasenaInicial,
  ConfiguracionInstitucionResponse,
  crearAnioLectivo,
  crearEscalaValoracion,
  crearInstitucion,
  crearSede,
  crearSedePrincipal,
  eliminarSede,
  EscalaValoracionResponse,
  getAniosLectivos,
  getApiUrl,
  getConfiguracionInstitucion,
  getEscalasValoracion,
  getInstituciones,
  getPersona,
  getSedes,
  guardarConfiguracionInstitucion,
  InstitucionResponse,
  login,
  LoginResponse,
  SedeResponse,
} from "./api";
import { AcademicStructurePage } from "./AcademicStructurePage";

type Page =
  | "inicio"
  | "instituciones"
  | "matriculas"
  | "asistencia"
  | "personal"
  | "academico";
type AttendanceStatus = "presente" | "ausente" | "tarde" | "excusado";
type EnrollmentFilter = "todos" | "activas" | "pendientes";
type GuardianMode = "vinculado" | "pendiente";

interface Session {
  name: string;
  email: string;
  role: string;
  institution: string;
  initials: string;
  demo: boolean;
  superadmin: boolean;
  institutionId: string | null;
}

const demoSession: Session = {
  name: "Mariana Ríos",
  email: "mariana.rios@colegio.edu.co",
  role: "Administradora institucional",
  institution: "Institución Educativa Horizonte",
  initials: "MR",
  demo: true,
  superadmin: false,
  institutionId: null,
};

const navItems: Array<{
  id: Page;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "inicio", label: "Inicio", icon: LayoutDashboard },
  { id: "instituciones", label: "Instituciones", icon: Building2 },
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
  const [session, setSession] = useState<Session | null>(() => {
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<Session>;
    return typeof parsed.superadmin === "boolean" ? (parsed as Session) : null;
  });

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
      await completeLogin(response);
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
      await completeLogin(response);
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

  async function completeLogin(response: LoginResponse) {
    if (!response.accessToken)
      throw new Error("La respuesta no contiene una sesión válida.");
    sessionStorage.setItem("admincoleg.accessToken", response.accessToken);
    if (response.refreshToken)
      sessionStorage.setItem("admincoleg.refreshToken", response.refreshToken);
    const role =
      response.contextoAcceso?.roles?.[0]?.nombre ??
      response.contextoAcceso?.roles?.[0]?.codigo ??
      "Usuario institucional";
    const personaId = response.contextoAcceso?.personaId;
    const persona = personaId
      ? await getPersona(personaId, response.accessToken).catch(() => null)
      : null;
    const name = persona
      ? [
          persona.primerNombre,
          persona.segundoNombre,
          persona.primerApellido,
          persona.segundoApellido,
        ]
          .filter(Boolean)
          .join(" ")
      : email.split("@")[0].split(".").map(capitalize).join(" ");
    const superadmin = Boolean(response.contextoAcceso?.superadministrador);
    onLogin({
      name,
      email,
      role,
      institution: superadmin ? "Administración general" : "Institución activa",
      initials: initialsFrom(name),
      demo: false,
      superadmin,
      institutionId: response.contextoAcceso?.institucionId ?? null,
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
  const [page, setPage] = useState<Page>(
    session.superadmin ? "instituciones" : "inicio",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  function navigate(next: Page) {
    setPage(next);
    setMenuOpen(false);
  }

  const visibleNavItems = session.superadmin
    ? navItems
    : navItems.filter((item) => item.id !== "instituciones");

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
          <span>{session.superadmin ? "SA" : "IE"}</span>
          <div>
            <strong>{session.superadmin ? "AdminColeg" : "Horizonte"}</strong>
            <small>
              {session.superadmin
                ? "Todas las instituciones"
                : "Sede principal"}
            </small>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav className="main-nav" aria-label="Navegación principal">
          <p>Gestión</p>
          {visibleNavItems.map((item) => {
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
          {page === "inicio" && (
            <Dashboard session={session} onNavigate={navigate} />
          )}
          {page === "instituciones" && (
            <InstitutionsPage
              accessToken={
                sessionStorage.getItem("admincoleg.accessToken") ?? ""
              }
              onToast={setToast}
            />
          )}
          {page === "matriculas" && <EnrollmentsPage onToast={setToast} />}
          {page === "asistencia" && <AttendancePage onToast={setToast} />}
          {page === "personal" && <PlaceholderPage type="personal" />}
          {page === "academico" && (
            <AcademicStructurePage
              accessToken={
                sessionStorage.getItem("admincoleg.accessToken") ?? ""
              }
              preferredInstitutionId={session.institutionId}
              onToast={setToast}
            />
          )}
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

function InstitutionsPage({
  accessToken,
  onToast,
}: {
  accessToken: string;
  onToast: (message: string) => void;
}) {
  const [institutions, setInstitutions] = useState<InstitucionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] =
    useState<InstitucionResponse | null>(null);

  useEffect(() => {
    let active = true;
    getInstituciones(accessToken)
      .then((items) => {
        if (active) setInstitutions(items);
      })
      .catch((caught) => {
        if (active)
          setError(
            caught instanceof Error
              ? caught.message
              : "No fue posible consultar las instituciones",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accessToken]);

  function created(institution: InstitucionResponse) {
    setInstitutions((current) =>
      [institution, ...current].sort((left, right) =>
        left.nombre.localeCompare(right.nombre),
      ),
    );
    setFormOpen(false);
    onToast("Institución y sede principal creadas correctamente");
  }

  function updated(institution: InstitucionResponse) {
    setSelectedInstitution(institution);
    setInstitutions((current) =>
      current
        .map((item) => (item.id === institution.id ? institution : item))
        .sort((left, right) => left.nombre.localeCompare(right.nombre)),
    );
  }

  if (selectedInstitution) {
    return (
      <InstitutionConfigurationPage
        institution={selectedInstitution}
        accessToken={accessToken}
        onBack={() => setSelectedInstitution(null)}
        onUpdated={updated}
        onToast={onToast}
      />
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Superadministración</p>
          <h1>Instituciones</h1>
          <p>
            Administra las organizaciones educativas vinculadas a la plataforma.
          </p>
        </div>
        <button
          data-testid="new-institution"
          className="button button--primary"
          onClick={() => setFormOpen(true)}
        >
          <Building2 size={17} /> Nueva institución
        </button>
      </div>

      <section className="institution-metrics">
        <Metric
          icon={Building2}
          tone="teal"
          label="Instituciones registradas"
          value={String(institutions.length)}
          trend="Directorio general"
        />
        <Metric
          icon={ShieldCheck}
          tone="blue"
          label="Instituciones activas"
          value={String(institutions.filter((item) => item.activo).length)}
          trend="Con acceso habilitado"
        />
        <article className="institution-callout">
          <span>
            <Sparkles size={19} />
          </span>
          <div>
            <strong>Configuración inicial guiada</strong>
            <small>Crea primero la institución y su sede principal.</small>
          </div>
        </article>
      </section>

      <section className="panel institution-panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Directorio</p>
            <h2>Instituciones registradas</h2>
          </div>
          <span className="count-badge">{institutions.length}</span>
        </div>
        {loading ? (
          <div className="institution-state">Consultando instituciones…</div>
        ) : error ? (
          <div className="institution-state institution-state--error">
            <AlertCircle size={20} /> {error}
          </div>
        ) : institutions.length === 0 ? (
          <div className="institution-empty">
            <span>
              <Building2 size={27} />
            </span>
            <h2>Aún no hay instituciones</h2>
            <p>
              Crea la primera organización para iniciar su configuración
              académica.
            </p>
            <button
              className="button button--primary"
              onClick={() => setFormOpen(true)}
            >
              Crear primera institución
            </button>
          </div>
        ) : (
          <div className="institution-list">
            {institutions.map((institution) => (
              <article className="institution-row" key={institution.id}>
                <span className="institution-logo">
                  {initialsFrom(institution.nombre)}
                </span>
                <div className="institution-identity">
                  <strong>{institution.nombre}</strong>
                  <small>Código {institution.codigo}</small>
                </div>
                <span
                  className={
                    institution.activo
                      ? "status status--active"
                      : "status status--inactive"
                  }
                >
                  {institution.activo ? "Activa" : "Inactiva"}
                </span>
                <button
                  className="button button--secondary institution-action"
                  onClick={() => setSelectedInstitution(institution)}
                >
                  Configurar <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {formOpen && (
        <NewInstitutionDialog
          accessToken={accessToken}
          onClose={() => setFormOpen(false)}
          onCreated={created}
        />
      )}
    </>
  );
}

type ConfigurationSection =
  "general" | "sedes" | "calendario" | "pedagogia" | "evaluacion";

interface ScaleLevelDraft {
  id: string;
  codigo: string;
  nombre: string;
  valorMinimo: string;
  valorMaximo: string;
}

const initialScaleLevels: ScaleLevelDraft[] = [
  {
    id: "bajo",
    codigo: "BAJO",
    nombre: "Desempeño bajo",
    valorMinimo: "1.0",
    valorMaximo: "2.9",
  },
  {
    id: "basico",
    codigo: "BASICO",
    nombre: "Desempeño básico",
    valorMinimo: "3.0",
    valorMaximo: "3.9",
  },
  {
    id: "alto",
    codigo: "ALTO",
    nombre: "Desempeño alto",
    valorMinimo: "4.0",
    valorMaximo: "4.5",
  },
  {
    id: "superior",
    codigo: "SUPERIOR",
    nombre: "Desempeño superior",
    valorMinimo: "4.6",
    valorMaximo: "5.0",
  },
];

function InstitutionConfigurationPage({
  institution,
  accessToken,
  onBack,
  onUpdated,
  onToast,
}: {
  institution: InstitucionResponse;
  accessToken: string;
  onBack: () => void;
  onUpdated: (institution: InstitucionResponse) => void;
  onToast: (message: string) => void;
}) {
  const [section, setSection] = useState<ConfigurationSection>("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [sedes, setSedes] = useState<SedeResponse[]>([]);
  const [anios, setAnios] = useState<AnioLectivoResponse[]>([]);
  const [configuracion, setConfiguracion] =
    useState<ConfiguracionInstitucionResponse | null>(null);
  const [escalas, setEscalas] = useState<EscalaValoracionResponse[]>([]);

  const [institutionName, setInstitutionName] = useState(institution.nombre);
  const [institutionActive, setInstitutionActive] = useState(
    institution.activo,
  );
  const [campusName, setCampusName] = useState("");
  const [campusCode, setCampusCode] = useState("");
  const [editingCampusId, setEditingCampusId] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();
  const [yearName, setYearName] = useState(`Año lectivo ${currentYear}`);
  const [yearStart, setYearStart] = useState(`${currentYear}-01-15`);
  const [yearEnd, setYearEnd] = useState(`${currentYear}-11-30`);
  const [pedagogicalModel, setPedagogicalModel] = useState("");
  const [pedagogicalApproach, setPedagogicalApproach] = useState("");
  const [scaleType, setScaleType] = useState("numerica");
  const [scaleName, setScaleName] = useState("Escala institucional");
  const [scaleLevels, setScaleLevels] = useState<ScaleLevelDraft[]>(() =>
    initialScaleLevels.map((level) => ({ ...level })),
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      getSedes(institution.id, accessToken),
      getAniosLectivos(institution.id, accessToken),
      getConfiguracionInstitucion(institution.id, accessToken),
      getEscalasValoracion(institution.id, accessToken),
    ])
      .then(([campuses, academicYears, settings, gradingScales]) => {
        if (!active) return;
        setSedes(campuses);
        setAnios(academicYears);
        setConfiguracion(settings);
        setEscalas(gradingScales);
        setPedagogicalModel(settings?.modeloPedagogico ?? "");
        setPedagogicalApproach(settings?.enfoquePedagogico ?? "");
        setScaleType(settings?.tipoEscalaValoracion ?? "numerica");
      })
      .catch((caught) => {
        if (active)
          setError(
            caught instanceof Error
              ? caught.message
              : "No fue posible cargar la configuración institucional",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accessToken, institution.id]);

  async function saveGeneral(event: FormEvent) {
    event.preventDefault();
    setSaving("general");
    setError("");
    try {
      const updated = await actualizarInstitucion(
        institution.id,
        { nombre: institutionName.trim(), activo: institutionActive },
        accessToken,
      );
      onUpdated(updated);
      onToast("Datos generales actualizados");
    } catch (caught) {
      setError(actionError(caught));
    } finally {
      setSaving("");
    }
  }

  function sortCampuses(items: SedeResponse[]) {
    return [...items].sort((left, right) =>
      left.nombre.localeCompare(right.nombre),
    );
  }

  function resetCampusForm() {
    setEditingCampusId(null);
    setCampusName("");
    setCampusCode("");
  }

  function beginCampusEdit(campus: SedeResponse) {
    setEditingCampusId(campus.id);
    setCampusName(campus.nombre);
    setCampusCode(campus.codigo);
    setError("");
  }

  async function saveCampus(event: FormEvent) {
    event.preventDefault();
    setSaving("sede");
    setError("");
    try {
      if (editingCampusId) {
        const updated = await actualizarSede(
          institution.id,
          editingCampusId,
          { nombre: campusName.trim() },
          accessToken,
        );
        setSedes((current) =>
          sortCampuses(
            current.map((campus) =>
              campus.id === updated.id ? updated : campus,
            ),
          ),
        );
        onToast("Sede actualizada correctamente");
      } else {
        const campus = await crearSede(
          institution.id,
          {
            codigo: campusCode.trim().toUpperCase(),
            nombre: campusName.trim(),
          },
          accessToken,
        );
        setSedes((current) => sortCampuses([...current, campus]));
        onToast("Sede agregada correctamente");
      }
      resetCampusForm();
    } catch (caught) {
      setError(actionError(caught));
    } finally {
      setSaving("");
    }
  }

  async function toggleCampus(campus: SedeResponse) {
    setSaving(`sede-estado-${campus.id}`);
    setError("");
    try {
      const updated = await actualizarSede(
        institution.id,
        campus.id,
        { activo: !campus.activo },
        accessToken,
      );
      setSedes((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      onToast(updated.activo ? "Sede activada" : "Sede desactivada");
    } catch (caught) {
      setError(actionError(caught));
    } finally {
      setSaving("");
    }
  }

  async function removeCampus(campus: SedeResponse) {
    if (
      !window.confirm(
        `¿Eliminar la sede "${campus.nombre}"? Se conservarán sus referencias históricas.`,
      )
    ) {
      return;
    }
    setSaving(`sede-eliminar-${campus.id}`);
    setError("");
    try {
      await eliminarSede(institution.id, campus.id, accessToken);
      setSedes((current) => current.filter((item) => item.id !== campus.id));
      if (editingCampusId === campus.id) resetCampusForm();
      onToast("Sede eliminada correctamente");
    } catch (caught) {
      setError(actionError(caught));
    } finally {
      setSaving("");
    }
  }

  async function addAcademicYear(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (yearStart >= yearEnd) {
      setError(
        "La fecha de finalización debe ser posterior a la fecha de inicio.",
      );
      return;
    }
    setSaving("anio");
    try {
      const academicYear = await crearAnioLectivo(
        institution.id,
        { nombre: yearName.trim(), fechaInicio: yearStart, fechaFin: yearEnd },
        accessToken,
      );
      setAnios((current) => [academicYear, ...current]);
      onToast("Año lectivo creado correctamente");
    } catch (caught) {
      setError(actionError(caught));
    } finally {
      setSaving("");
    }
  }

  async function savePedagogy(event: FormEvent) {
    event.preventDefault();
    setSaving("pedagogia");
    setError("");
    try {
      const settings = await guardarConfiguracionInstitucion(
        institution.id,
        {
          modeloPedagogico: pedagogicalModel.trim(),
          enfoquePedagogico: pedagogicalApproach.trim(),
          tipoEscalaValoracion: scaleType,
        },
        accessToken,
      );
      setConfiguracion(settings);
      onToast("Configuración pedagógica guardada");
    } catch (caught) {
      setError(actionError(caught));
    } finally {
      setSaving("");
    }
  }

  function updateScaleLevel(
    id: string,
    field: keyof Omit<ScaleLevelDraft, "id">,
    value: string,
  ) {
    setScaleLevels((current) =>
      current.map((level) =>
        level.id === id ? { ...level, [field]: value } : level,
      ),
    );
  }

  async function addScale(event: FormEvent) {
    event.preventDefault();
    setError("");
    const normalizedName = scaleName.trim().toLocaleLowerCase("es");
    if (
      escalas.some(
        (scale) =>
          scale.nombre.trim().toLocaleLowerCase("es") === normalizedName,
      )
    ) {
      setError(
        `Ya existe una escala de valoración llamada "${scaleName.trim()}". Usa otro nombre.`,
      );
      return;
    }
    if (scaleLevels.length < 2) {
      setError("La escala debe tener al menos dos niveles.");
      return;
    }
    if (
      scaleLevels.some(
        (level) =>
          !level.codigo.trim() ||
          !level.nombre.trim() ||
          Number(level.valorMinimo) > Number(level.valorMaximo),
      )
    ) {
      setError("Completa los niveles y verifica sus rangos de valoración.");
      return;
    }
    setSaving("escala");
    try {
      const result = await crearEscalaValoracion(
        institution.id,
        {
          nombre: scaleName.trim(),
          niveles: scaleLevels.map((level, index) => ({
            codigo: level.codigo.trim().toUpperCase(),
            nombre: level.nombre.trim(),
            valorMinimo: level.valorMinimo,
            valorMaximo: level.valorMaximo,
            orden: index + 1,
          })),
        },
        accessToken,
      );
      setEscalas(result);
      setScaleName("");
      setScaleLevels(initialScaleLevels.map((level) => ({ ...level })));
      onToast("Escala de valoración creada correctamente");
    } catch (caught) {
      setError(actionError(caught));
    } finally {
      setSaving("");
    }
  }

  const sections: Array<{
    id: ConfigurationSection;
    label: string;
    detail: string;
    icon: typeof Settings2;
  }> = [
    {
      id: "general",
      label: "Datos generales",
      detail: "Identidad y estado",
      icon: Settings2,
    },
    {
      id: "sedes",
      label: "Sedes",
      detail: `${sedes.length} registradas`,
      icon: MapPin,
    },
    {
      id: "calendario",
      label: "Años lectivos",
      detail: `${anios.length} configurados`,
      icon: CalendarDays,
    },
    {
      id: "pedagogia",
      label: "Modelo pedagógico",
      detail: configuracion ? "Configurado" : "Pendiente",
      icon: BookOpen,
    },
    {
      id: "evaluacion",
      label: "Escalas",
      detail: `${escalas.length} registradas`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="configuration-page">
      <div className="configuration-heading">
        <button className="button button--secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Instituciones
        </button>
        <div className="configuration-title">
          <span className="institution-logo">
            {initialsFrom(institution.nombre)}
          </span>
          <div>
            <p className="eyebrow">Configuración institucional</p>
            <h1>{institution.nombre}</h1>
            <small>Código interno {institution.codigo}</small>
          </div>
        </div>
        <span
          className={
            institution.activo
              ? "status status--active"
              : "status status--inactive"
          }
        >
          {institution.activo ? "Activa" : "Inactiva"}
        </span>
      </div>

      {error && (
        <p className="configuration-error" role="alert">
          <AlertCircle size={17} /> {error}
          <button aria-label="Cerrar mensaje" onClick={() => setError("")}>
            <X size={15} />
          </button>
        </p>
      )}

      {loading ? (
        <div className="institution-state">Cargando configuración…</div>
      ) : (
        <div className="configuration-layout">
          <aside
            className="configuration-nav"
            aria-label="Secciones de configuración"
          >
            {sections.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={
                    section === item.id
                      ? "configuration-nav__item configuration-nav__item--active"
                      : "configuration-nav__item"
                  }
                  onClick={() => {
                    setSection(item.id);
                    setError("");
                  }}
                >
                  <span>
                    <Icon size={18} />
                  </span>
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </div>
                  <ArrowRight size={15} />
                </button>
              );
            })}
          </aside>

          <section className="configuration-content">
            {section === "general" && (
              <ConfigurationCard
                title="Datos generales"
                description="Actualiza el nombre visible y controla el acceso de la institución."
                icon={Settings2}
              >
                <form className="configuration-form" onSubmit={saveGeneral}>
                  <label className="field field--full">
                    <span>Nombre oficial</span>
                    <input
                      value={institutionName}
                      onChange={(event) =>
                        setInstitutionName(event.target.value)
                      }
                      minLength={3}
                      required
                    />
                  </label>
                  <div className="read-only-field">
                    <span>Código interno</span>
                    <strong>{institution.codigo}</strong>
                    <small>No cambia después de crear la institución.</small>
                  </div>
                  <label className="toggle-field">
                    <input
                      type="checkbox"
                      checked={institutionActive}
                      onChange={(event) =>
                        setInstitutionActive(event.target.checked)
                      }
                    />
                    <span>
                      <strong>Institución activa</strong>
                      <small>
                        Permite el acceso y las operaciones institucionales.
                      </small>
                    </span>
                  </label>
                  <FormActions
                    saving={saving === "general"}
                    label="Guardar datos generales"
                  />
                </form>
              </ConfigurationCard>
            )}

            {section === "sedes" && (
              <ConfigurationCard
                title="Sedes"
                description="Registra las ubicaciones que pertenecen a esta institución."
                icon={MapPin}
              >
                <EntityList
                  empty="No hay sedes registradas."
                  items={sedes.map((campus) => ({
                    id: campus.id,
                    title: campus.nombre,
                    detail: campus.codigo,
                    status: campus.activo ? "Activa" : "Inactiva",
                    actions: (
                      <div className="configuration-entity__actions">
                        <button
                          type="button"
                          title="Editar sede"
                          aria-label={`Editar ${campus.nombre}`}
                          disabled={Boolean(saving)}
                          onClick={() => beginCampusEdit(campus)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          title={
                            campus.activo ? "Desactivar sede" : "Activar sede"
                          }
                          aria-label={`${campus.activo ? "Desactivar" : "Activar"} ${campus.nombre}`}
                          disabled={Boolean(saving)}
                          onClick={() => void toggleCampus(campus)}
                        >
                          <Power size={14} />
                        </button>
                        <button
                          type="button"
                          className="configuration-entity__delete"
                          title="Eliminar sede"
                          aria-label={`Eliminar ${campus.nombre}`}
                          disabled={Boolean(saving)}
                          onClick={() => void removeCampus(campus)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ),
                  }))}
                />
                <form
                  className="configuration-form configuration-form--divided"
                  onSubmit={saveCampus}
                >
                  <div className="scale-form-heading">
                    <h3>{editingCampusId ? "Editar sede" : "Agregar sede"}</h3>
                    {editingCampusId && (
                      <button
                        type="button"
                        className="button button--secondary"
                        disabled={Boolean(saving)}
                        onClick={resetCampusForm}
                      >
                        Cancelar edición
                      </button>
                    )}
                  </div>
                  <div className="form-grid">
                    <label className="field">
                      <span>Nombre de la sede</span>
                      <input
                        value={campusName}
                        onChange={(event) => setCampusName(event.target.value)}
                        placeholder="Ej. Sede Norte"
                        minLength={3}
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Código de sede</span>
                      {editingCampusId ? (
                        <div className="read-only-field read-only-field--compact">
                          <strong>{campusCode}</strong>
                          <small>El código no puede modificarse.</small>
                        </div>
                      ) : (
                        <CodeInput
                          value={campusCode}
                          onChange={setCampusCode}
                          source={campusName}
                          fallback="SEDE"
                          placeholder="Ej. SN-4K2M"
                        />
                      )}
                    </label>
                  </div>
                  <FormActions
                    saving={saving === "sede"}
                    label={editingCampusId ? "Guardar cambios" : "Agregar sede"}
                  />
                </form>
              </ConfigurationCard>
            )}

            {section === "calendario" && (
              <ConfigurationCard
                title="Años lectivos"
                description="Define el periodo operativo para matrículas, grupos y calificaciones."
                icon={CalendarDays}
              >
                <EntityList
                  empty="No hay años lectivos configurados."
                  items={anios.map((year) => ({
                    id: year.id,
                    title: year.nombre ?? String(year.anio),
                    detail: `${formatDate(year.fechaInicio)} — ${formatDate(year.fechaFin)}`,
                    status: capitalize(year.estado),
                  }))}
                />
                <form
                  className="configuration-form configuration-form--divided"
                  onSubmit={addAcademicYear}
                >
                  <h3>Crear año lectivo</h3>
                  <label className="field field--full">
                    <span>Nombre</span>
                    <input
                      value={yearName}
                      onChange={(event) => setYearName(event.target.value)}
                      minLength={3}
                      required
                    />
                  </label>
                  <div className="form-grid">
                    <label className="field">
                      <span>Fecha de inicio</span>
                      <input
                        type="date"
                        value={yearStart}
                        onChange={(event) => setYearStart(event.target.value)}
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Fecha de finalización</span>
                      <input
                        type="date"
                        value={yearEnd}
                        onChange={(event) => setYearEnd(event.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <FormActions
                    saving={saving === "anio"}
                    label="Crear año lectivo"
                  />
                </form>
              </ConfigurationCard>
            )}

            {section === "pedagogia" && (
              <ConfigurationCard
                title="Modelo pedagógico"
                description="Documenta el enfoque formativo y el tipo de valoración institucional."
                icon={BookOpen}
              >
                <form className="configuration-form" onSubmit={savePedagogy}>
                  <label className="field field--full">
                    <span>Modelo pedagógico</span>
                    <input
                      value={pedagogicalModel}
                      onChange={(event) =>
                        setPedagogicalModel(event.target.value)
                      }
                      placeholder="Ej. Constructivista"
                    />
                  </label>
                  <label className="field field--full">
                    <span>Enfoque pedagógico</span>
                    <textarea
                      value={pedagogicalApproach}
                      onChange={(event) =>
                        setPedagogicalApproach(event.target.value)
                      }
                      placeholder="Describe los principios que orientan el proceso formativo."
                      rows={4}
                    />
                  </label>
                  <label className="field field--full">
                    <span>Tipo de escala de valoración</span>
                    <select
                      value={scaleType}
                      onChange={(event) => setScaleType(event.target.value)}
                    >
                      <option value="numerica">Numérica</option>
                      <option value="cualitativa">Cualitativa</option>
                      <option value="mixta">Mixta</option>
                    </select>
                  </label>
                  <FormActions
                    saving={saving === "pedagogia"}
                    label="Guardar configuración"
                  />
                </form>
              </ConfigurationCard>
            )}

            {section === "evaluacion" && (
              <ConfigurationCard
                title="Escalas de valoración"
                description="Configura los niveles utilizados para interpretar el desempeño académico."
                icon={TrendingUp}
              >
                <EntityList
                  empty="No hay escalas de valoración registradas."
                  items={escalas.map((scale) => ({
                    id: scale.id,
                    title: scale.nombre,
                    detail: `${scale.niveles.length} niveles · ${capitalize(scale.tipo)}`,
                    status: scale.activo ? "Activa" : "Inactiva",
                  }))}
                />
                <form
                  className="configuration-form configuration-form--divided"
                  onSubmit={addScale}
                >
                  <div className="scale-form-heading">
                    <h3>Nueva escala</h3>
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() =>
                        setScaleLevels((current) => [
                          ...current,
                          {
                            id: `${Date.now()}-${current.length}`,
                            codigo: "",
                            nombre: "",
                            valorMinimo: "",
                            valorMaximo: "",
                          },
                        ])
                      }
                    >
                      <Plus size={15} /> Agregar nivel
                    </button>
                  </div>
                  <label className="field field--full">
                    <span>Nombre de la escala</span>
                    <input
                      value={scaleName}
                      onChange={(event) => setScaleName(event.target.value)}
                      minLength={3}
                      required
                    />
                  </label>
                  <div className="scale-levels">
                    {scaleLevels.map((level, index) => (
                      <article className="scale-level" key={level.id}>
                        <div className="scale-level__heading">
                          <strong>Nivel {index + 1}</strong>
                          <button
                            type="button"
                            aria-label={`Eliminar nivel ${index + 1}`}
                            disabled={scaleLevels.length <= 2}
                            onClick={() =>
                              setScaleLevels((current) =>
                                current.filter((item) => item.id !== level.id),
                              )
                            }
                          >
                            <X size={15} />
                          </button>
                        </div>
                        <label className="field">
                          <span>Nombre</span>
                          <input
                            value={level.nombre}
                            onChange={(event) =>
                              updateScaleLevel(
                                level.id,
                                "nombre",
                                event.target.value,
                              )
                            }
                            required
                          />
                        </label>
                        <label className="field">
                          <span>Código</span>
                          <CodeInput
                            value={level.codigo}
                            onChange={(value) =>
                              updateScaleLevel(level.id, "codigo", value)
                            }
                            source={level.nombre}
                            fallback="NIVEL"
                            placeholder="Ej. ALTO"
                          />
                        </label>
                        <div className="form-grid">
                          <label className="field">
                            <span>Valor mínimo</span>
                            <input
                              type="number"
                              step="0.01"
                              value={level.valorMinimo}
                              onChange={(event) =>
                                updateScaleLevel(
                                  level.id,
                                  "valorMinimo",
                                  event.target.value,
                                )
                              }
                              required
                            />
                          </label>
                          <label className="field">
                            <span>Valor máximo</span>
                            <input
                              type="number"
                              step="0.01"
                              value={level.valorMaximo}
                              onChange={(event) =>
                                updateScaleLevel(
                                  level.id,
                                  "valorMaximo",
                                  event.target.value,
                                )
                              }
                              required
                            />
                          </label>
                        </div>
                      </article>
                    ))}
                  </div>
                  <FormActions
                    saving={saving === "escala"}
                    label="Crear escala de valoración"
                  />
                </form>
              </ConfigurationCard>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function ConfigurationCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Settings2;
  children: ReactNode;
}) {
  return (
    <article className="panel configuration-card">
      <header>
        <span>
          <Icon size={20} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      {children}
    </article>
  );
}

function EntityList({
  items,
  empty,
}: {
  items: Array<{
    id: string;
    title: string;
    detail: string;
    status: string;
    actions?: ReactNode;
  }>;
  empty: string;
}) {
  if (!items.length) return <p className="configuration-empty">{empty}</p>;
  return (
    <div className="configuration-entities">
      {items.map((item) => (
        <div key={item.id}>
          <span>
            <Check size={15} />
          </span>
          <div>
            <strong>{item.title}</strong>
            <small>{item.detail}</small>
          </div>
          <div className="configuration-entity__meta">
            <b>{item.status}</b>
            {item.actions}
          </div>
        </div>
      ))}
    </div>
  );
}

function FormActions({ saving, label }: { saving: boolean; label: string }) {
  return (
    <div className="configuration-actions">
      <button
        className="button button--primary"
        type="submit"
        disabled={saving}
      >
        {saving ? (
          "Guardando…"
        ) : (
          <>
            <Save size={16} /> {label}
          </>
        )}
      </button>
    </div>
  );
}

function CodeInput({
  value,
  onChange,
  source,
  fallback,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  source: string;
  fallback: string;
  placeholder: string;
}) {
  return (
    <div className="input-with-action">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        placeholder={placeholder}
        maxLength={20}
      />
      <button
        type="button"
        className="generate-code-button"
        disabled={source.trim().length < 3}
        onClick={() => onChange(generateCode(source, fallback))}
      >
        <Sparkles size={15} /> Autogenerar
      </button>
    </div>
  );
}

function NewInstitutionDialog({
  accessToken,
  onClose,
  onCreated,
}: {
  accessToken: string;
  onClose: () => void;
  onCreated: (institution: InstitucionResponse) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [campusName, setCampusName] = useState("Sede principal");
  const [campusCode, setCampusCode] = useState("PRINCIPAL");
  const [createdInstitution, setCreatedInstitution] =
    useState<InstitucionResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (step === 1) {
      setStep(2);
      return;
    }
    setSaving(true);
    let institutionWasCreated = Boolean(createdInstitution);
    try {
      const institution =
        createdInstitution ??
        (await crearInstitucion(
          { codigo: code.trim().toUpperCase(), nombre: name.trim() },
          accessToken,
        ));
      setCreatedInstitution(institution);
      institutionWasCreated = true;
      await crearSedePrincipal(
        institution.id,
        {
          codigo: campusCode.trim().toUpperCase(),
          nombre: campusName.trim(),
        },
        accessToken,
      );
      onCreated(institution);
    } catch (caught) {
      setError(
        institutionWasCreated
          ? "La institución fue creada, pero falta registrar su sede. Reintenta para completar el proceso."
          : caught instanceof Error
            ? caught.message
            : "No fue posible crear la institución",
      );
    } finally {
      setSaving(false);
    }
  }

  const ready =
    step === 1
      ? Boolean(name.trim().length >= 3 && code.trim().length >= 2)
      : Boolean(campusName.trim().length >= 3 && campusCode.trim().length >= 2);

  return (
    <div className="dialog-layer">
      <button
        className="drawer-backdrop"
        aria-label="Cerrar creación de institución"
        onClick={onClose}
      />
      <section
        className="institution-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="institution-dialog-title"
      >
        <header className="drawer-header">
          <div>
            <p className="eyebrow">Paso {step} de 2</p>
            <h2 id="institution-dialog-title">
              {step === 1 ? "Nueva institución" : "Sede principal"}
            </h2>
            <p>
              {step === 1
                ? "Registra la identidad básica de la organización."
                : "Toda institución inicia con una sede principal."}
            </p>
          </div>
          <button className="icon-button" aria-label="Cerrar" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        <div className="compact-stepper">
          <span
            className={
              step >= 1 ? "compact-step compact-step--active" : "compact-step"
            }
          >
            1
          </span>
          <i />
          <span
            className={
              step >= 2 ? "compact-step compact-step--active" : "compact-step"
            }
          >
            2
          </span>
        </div>
        <form className="institution-form" onSubmit={submit}>
          {step === 1 ? (
            <div className="form-step">
              <StepIntro
                icon={Building2}
                title="Datos de la institución"
                text="El código debe ser corto, único y fácil de reconocer."
              />
              <label className="field field--full">
                <span>Nombre oficial</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej. Institución Educativa Horizonte"
                />
              </label>
              <label className="field field--full">
                <span>Código interno</span>
                <CodeInput
                  value={code}
                  onChange={setCode}
                  source={name}
                  fallback="INST"
                  placeholder="Ej. IEH-4K2M"
                />
                <small>
                  Puedes escribir uno propio o generar un código único a partir
                  del nombre.
                </small>
              </label>
            </div>
          ) : (
            <div className="form-step">
              <StepIntro
                icon={Building2}
                title="Primera sede"
                text="Después podrás agregar sedes adicionales y completar su configuración."
              />
              <div className="form-grid">
                <label className="field">
                  <span>Nombre de la sede</span>
                  <input
                    value={campusName}
                    onChange={(event) => setCampusName(event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Código de sede</span>
                  <CodeInput
                    value={campusCode}
                    onChange={setCampusCode}
                    source={campusName}
                    fallback="SEDE"
                    placeholder="Ej. SP-4K2M"
                  />
                </label>
              </div>
              <div className="creation-summary">
                <span>{initialsFrom(name)}</span>
                <div>
                  <strong>{name}</strong>
                  <small>
                    {code.toUpperCase()} · {campusName}
                  </small>
                </div>
                <ShieldCheck size={19} />
              </div>
            </div>
          )}
          {error && (
            <p className="form-error">
              <AlertCircle size={16} /> {error}
            </p>
          )}
          <footer className="dialog-footer">
            <button
              type="button"
              className="button button--secondary"
              onClick={step === 1 ? onClose : () => setStep(1)}
            >
              {step === 2 && <ArrowLeft size={16} />}
              {step === 1 ? "Cancelar" : "Atrás"}
            </button>
            <button
              type="submit"
              className="button button--primary"
              disabled={!ready || saving}
            >
              {saving
                ? "Creando…"
                : step === 1
                  ? "Continuar"
                  : "Crear institución"}
              {!saving && step === 1 && <ArrowRight size={16} />}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function Dashboard({
  session,
  onNavigate,
}: {
  session: Session;
  onNavigate: (page: Page) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Domingo, 19 de julio</p>
          <h1>Buenos días, {session.name.split(" ")[0]}</h1>
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
  const [filter, setFilter] = useState<EnrollmentFilter>("todos");
  const [items, setItems] = useState(enrollments);
  const [formOpen, setFormOpen] = useState(false);
  const filtered = items.filter(
    (item) =>
      `${item.student} ${item.id} ${item.grade}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "todos" ||
        (filter === "pendientes" ? item.pending : !item.pending)),
  );

  function addEnrollment(draft: EnrollmentDraft) {
    setItems((current) => [
      {
        id: `MAT-${260180 + current.length}`,
        student: draft.student,
        grade: `${draft.grade} ${draft.group}`,
        date: "20 jul 2026",
        status:
          draft.guardianMode === "pendiente" ? "Pendiente acudiente" : "Activa",
        pending: draft.guardianMode === "pendiente",
      },
      ...current,
    ]);
    setFormOpen(false);
    onToast(
      draft.guardianMode === "pendiente"
        ? "Matrícula creada como pendiente de acudiente"
        : "Matrícula creada correctamente",
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Gestión estudiantil</p>
          <h1>Matrículas</h1>
          <p>Consulta y administra las matrículas del año lectivo actual.</p>
        </div>
        <button
          data-testid="new-enrollment"
          className="button button--primary"
          onClick={() => setFormOpen(true)}
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
          <label className="filter-select">
            <span>Estado</span>
            <select
              aria-label="Filtrar matrículas por estado"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as EnrollmentFilter)
              }
            >
              <option value="todos">Todos los estados</option>
              <option value="activas">Activas</option>
              <option value="pendientes">Pendientes de acudiente</option>
            </select>
            <ChevronDown size={15} />
          </label>
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
      {formOpen && (
        <NewEnrollmentDrawer
          onClose={() => setFormOpen(false)}
          onComplete={addEnrollment}
        />
      )}
    </>
  );
}

interface EnrollmentDraft {
  student: string;
  grade: string;
  group: string;
  campus: string;
  schedule: string;
  guardianMode: GuardianMode;
  guardian: string;
  deadline: string;
  reason: string;
}

function NewEnrollmentDrawer({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (draft: EnrollmentDraft) => void;
}) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<EnrollmentDraft>({
    student: "",
    grade: "",
    group: "",
    campus: "Sede principal",
    schedule: "Mañana",
    guardianMode: "vinculado",
    guardian: "",
    deadline: "2026-07-27",
    reason: "",
  });

  const stepReady =
    (step === 1 && Boolean(draft.student)) ||
    (step === 2 && Boolean(draft.grade && draft.group)) ||
    (step === 3 &&
      (draft.guardianMode === "vinculado"
        ? Boolean(draft.guardian)
        : Boolean(draft.deadline && draft.reason.trim()))) ||
    step === 4;

  function update<Key extends keyof EnrollmentDraft>(
    key: Key,
    value: EnrollmentDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (step < 4) {
      if (stepReady) setStep((current) => current + 1);
      return;
    }
    onComplete(draft);
  }

  return (
    <div className="drawer-layer">
      <button
        className="drawer-backdrop"
        aria-label="Cerrar formulario de matrícula"
        onClick={onClose}
      />
      <section
        data-testid="enrollment-drawer"
        className="enrollment-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-enrollment-title"
      >
        <header className="drawer-header">
          <div>
            <p className="eyebrow">Admisiones · Año lectivo 2026</p>
            <h2 id="new-enrollment-title">Nueva matrícula</h2>
            <p>Completa la información para ubicar al estudiante.</p>
          </div>
          <button className="icon-button" aria-label="Cerrar" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="enrollment-stepper" aria-label={`Paso ${step} de 4`}>
          {["Estudiante", "Ubicación", "Acudiente", "Revisión"].map(
            (label, index) => (
              <div
                key={label}
                className={
                  step === index + 1
                    ? "step-item step-item--active"
                    : step > index + 1
                      ? "step-item step-item--done"
                      : "step-item"
                }
              >
                <span>
                  {step > index + 1 ? <Check size={14} /> : index + 1}
                </span>
                <small>{label}</small>
              </div>
            ),
          )}
        </div>

        <form className="enrollment-form" onSubmit={submit}>
          <div className="drawer-body">
            {step === 1 && (
              <div className="form-step">
                <StepIntro
                  icon={Search}
                  title="Selecciona el estudiante"
                  text="Busca una persona registrada que aún no tenga matrícula vigente."
                />
                <label className="field field--full">
                  <span>Estudiante</span>
                  <select
                    value={draft.student}
                    onChange={(event) => update("student", event.target.value)}
                  >
                    <option value="">Seleccionar estudiante…</option>
                    <option>Valentina Gómez Martínez</option>
                    <option>Juan José Ramírez Soto</option>
                    <option>Isabella Herrera León</option>
                  </select>
                </label>
                {draft.student && (
                  <article className="student-preview">
                    <span>{initialsFrom(draft.student)}</span>
                    <div>
                      <strong>{draft.student}</strong>
                      <small>TI 1028947561 · Estudiante activo</small>
                    </div>
                    <ShieldCheck size={19} />
                  </article>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <StepIntro
                  icon={BookOpen}
                  title="Ubicación académica"
                  text="Todos los datos corresponden a la misma institución y año lectivo."
                />
                <div className="form-grid">
                  <SelectField
                    label="Sede"
                    value={draft.campus}
                    onChange={(value) => update("campus", value)}
                    options={["Sede principal", "Sede norte"]}
                  />
                  <SelectField
                    label="Jornada"
                    value={draft.schedule}
                    onChange={(value) => update("schedule", value)}
                    options={["Mañana", "Tarde"]}
                  />
                  <SelectField
                    label="Grado"
                    value={draft.grade}
                    onChange={(value) => update("grade", value)}
                    options={["6°", "7°", "8°", "9°"]}
                    placeholder="Seleccionar…"
                  />
                  <SelectField
                    label="Grupo"
                    value={draft.group}
                    onChange={(value) => update("group", value)}
                    options={["A", "B"]}
                    placeholder="Seleccionar…"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-step">
                <StepIntro
                  icon={UserCheck}
                  title="Responsable del estudiante"
                  text="Puedes continuar aunque el acudiente todavía esté pendiente."
                />
                <div className="choice-grid">
                  <button
                    type="button"
                    className={
                      draft.guardianMode === "vinculado"
                        ? "choice-card choice-card--selected"
                        : "choice-card"
                    }
                    onClick={() => update("guardianMode", "vinculado")}
                  >
                    <UserCheck size={20} />
                    <strong>Vincular acudiente</strong>
                    <small>La matrícula quedará activa.</small>
                  </button>
                  <button
                    type="button"
                    className={
                      draft.guardianMode === "pendiente"
                        ? "choice-card choice-card--selected choice-card--warning"
                        : "choice-card"
                    }
                    onClick={() => update("guardianMode", "pendiente")}
                  >
                    <Clock3 size={20} />
                    <strong>Registrar como pendiente</strong>
                    <small>Define un plazo y motivo.</small>
                  </button>
                </div>
                {draft.guardianMode === "vinculado" ? (
                  <SelectField
                    label="Acudiente vinculado"
                    value={draft.guardian}
                    onChange={(value) => update("guardian", value)}
                    options={["Laura Martínez · Madre", "Carlos Gómez · Padre"]}
                    placeholder="Seleccionar acudiente…"
                    full
                  />
                ) : (
                  <div className="pending-box">
                    <div className="pending-note">
                      <AlertCircle size={18} />
                      <span>
                        La matrícula quedará visible en la bandeja de pendientes
                        hasta completar el acudiente.
                      </span>
                    </div>
                    <div className="form-grid">
                      <label className="field">
                        <span>Fecha límite</span>
                        <input
                          type="date"
                          value={draft.deadline}
                          onChange={(event) =>
                            update("deadline", event.target.value)
                          }
                        />
                      </label>
                      <label className="field field--wide">
                        <span>Motivo</span>
                        <textarea
                          rows={3}
                          placeholder="Ej. La familia está recopilando documentos…"
                          value={draft.reason}
                          onChange={(event) =>
                            update("reason", event.target.value)
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="form-step">
                <StepIntro
                  icon={ClipboardCheck}
                  title="Revisa antes de crear"
                  text="Confirma los datos principales de la matrícula."
                />
                <div className="review-card">
                  <ReviewRow label="Estudiante" value={draft.student} />
                  <ReviewRow
                    label="Ubicación"
                    value={`${draft.campus} · ${draft.schedule} · ${draft.grade} ${draft.group}`}
                  />
                  <ReviewRow
                    label="Estado inicial"
                    value={
                      draft.guardianMode === "pendiente"
                        ? "Pendiente de acudiente"
                        : "Activa"
                    }
                    warning={draft.guardianMode === "pendiente"}
                  />
                  <ReviewRow
                    label={
                      draft.guardianMode === "pendiente" ? "Plazo" : "Acudiente"
                    }
                    value={
                      draft.guardianMode === "pendiente"
                        ? draft.deadline
                        : draft.guardian
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <footer className="drawer-footer">
            <button
              type="button"
              className="button button--secondary"
              onClick={
                step === 1 ? onClose : () => setStep((current) => current - 1)
              }
            >
              {step > 1 && <ArrowLeft size={16} />}
              {step === 1 ? "Cancelar" : "Atrás"}
            </button>
            <span>Paso {step} de 4</span>
            <button
              type="submit"
              className="button button--primary"
              disabled={!stepReady}
            >
              {step === 4 ? "Crear matrícula" : "Continuar"}
              {step < 4 && <ArrowRight size={16} />}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function StepIntro({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Search;
  title: string;
  text: string;
}) {
  return (
    <div className="step-copy">
      <span className="step-icon">
        <Icon size={21} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  full = false,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  full?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={full ? "field field--full" : "field"}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ReviewRow({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="review-row">
      <span>{label}</span>
      <strong className={warning ? "review-warning" : ""}>{value}</strong>
    </div>
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
function actionError(caught: unknown) {
  return caught instanceof Error
    ? caught.message
    : "No fue posible completar la operación";
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
function generateCode(value: string, fallback: string) {
  const ignored = new Set(["DE", "DEL", "LA", "LAS", "EL", "LOS", "Y"]);
  const words = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !ignored.has(word));
  const prefix =
    words
      .slice(0, 4)
      .map((word) => word[0])
      .join("") || fallback;
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
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
