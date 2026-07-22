import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  GraduationCap,
  Plus,
  School,
  Sparkles,
  X,
} from "lucide-react";
import {
  AnioLectivoResponse,
  AsignaturaResponse,
  crearAsignatura,
  crearGrado,
  crearGrupo,
  crearJornada,
  getAniosLectivos,
  getAsignaturas,
  getGrados,
  getGrupos,
  getInstituciones,
  getJornadas,
  getSedes,
  GradoResponse,
  GrupoResponse,
  InstitucionResponse,
  JornadaNombre,
  JornadaResponse,
  NivelEducativo,
  SedeResponse,
} from "./api";

type AcademicSection = "asignaturas" | "grados" | "jornadas" | "grupos";

interface Props {
  accessToken: string;
  preferredInstitutionId?: string | null;
  onToast: (message: string) => void;
}

export function AcademicStructurePage({
  accessToken,
  preferredInstitutionId,
  onToast,
}: Props) {
  const [institutions, setInstitutions] = useState<InstitucionResponse[]>([]);
  const [institutionId, setInstitutionId] = useState(
    preferredInstitutionId ?? "",
  );
  const [section, setSection] = useState<AcademicSection>("asignaturas");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [subjects, setSubjects] = useState<AsignaturaResponse[]>([]);
  const [grades, setGrades] = useState<GradoResponse[]>([]);
  const [schedules, setSchedules] = useState<JornadaResponse[]>([]);
  const [groups, setGroups] = useState<GrupoResponse[]>([]);
  const [campuses, setCampuses] = useState<SedeResponse[]>([]);
  const [years, setYears] = useState<AnioLectivoResponse[]>([]);

  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [gradeName, setGradeName] = useState("");
  const [gradeCode, setGradeCode] = useState("");
  const [gradeShortName, setGradeShortName] = useState("");
  const [gradeLevel, setGradeLevel] = useState<NivelEducativo>("primaria");
  const [gradeOrder, setGradeOrder] = useState("1");
  const [scheduleName, setScheduleName] = useState<JornadaNombre>("mañana");
  const [scheduleCode, setScheduleCode] = useState("");
  const [scheduleStart, setScheduleStart] = useState("07:00");
  const [scheduleEnd, setScheduleEnd] = useState("13:00");
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [groupCampusId, setGroupCampusId] = useState("");
  const [groupYearId, setGroupYearId] = useState("");
  const [groupGradeId, setGroupGradeId] = useState("");
  const [groupScheduleId, setGroupScheduleId] = useState("");

  useEffect(() => {
    let active = true;
    getInstituciones(accessToken)
      .then((items) => {
        if (!active) return;
        setInstitutions(items.filter((item) => item.activo));
        setInstitutionId((current) =>
          current && items.some((item) => item.id === current)
            ? current
            : (items.find((item) => item.activo)?.id ?? ""),
        );
      })
      .catch((caught) => active && setError(errorMessage(caught)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!institutionId) return;
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      getAsignaturas(institutionId, accessToken),
      getGrados(institutionId, accessToken),
      getJornadas(institutionId, accessToken),
      getGrupos(institutionId, accessToken),
      getSedes(institutionId, accessToken),
      getAniosLectivos(institutionId, accessToken),
    ])
      .then(
        ([
          subjectItems,
          gradeItems,
          scheduleItems,
          groupItems,
          campusItems,
          yearItems,
        ]) => {
          if (!active) return;
          setSubjects(subjectItems);
          setGrades(gradeItems);
          setSchedules(scheduleItems);
          setGroups(groupItems);
          setCampuses(campusItems.filter((item) => item.activo));
          setYears(yearItems.filter((item) => item.estado === "activo"));
          setGroupCampusId(campusItems.find((item) => item.activo)?.id ?? "");
          setGroupYearId(
            yearItems.find((item) => item.estado === "activo")?.id ?? "",
          );
          setGroupGradeId(gradeItems.find((item) => item.activo)?.id ?? "");
          setGroupScheduleId(
            scheduleItems.find((item) => item.activo)?.id ?? "",
          );
        },
      )
      .catch((caught) => active && setError(errorMessage(caught)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [accessToken, institutionId]);

  const activeInstitution = institutions.find(
    (item) => item.id === institutionId,
  );
  const tabs = [
    {
      id: "asignaturas" as const,
      label: "Asignaturas",
      icon: BookOpen,
      count: subjects.length,
    },
    {
      id: "grados" as const,
      label: "Grados",
      icon: GraduationCap,
      count: grades.length,
    },
    {
      id: "jornadas" as const,
      label: "Jornadas",
      icon: Clock3,
      count: schedules.length,
    },
    {
      id: "grupos" as const,
      label: "Grupos",
      icon: School,
      count: groups.length,
    },
  ];

  const campusById = useMemo(
    () => new Map(campuses.map((item) => [item.id, item.nombre])),
    [campuses],
  );
  const gradeById = useMemo(
    () => new Map(grades.map((item) => [item.id, item.nombre])),
    [grades],
  );

  function ensureUniqueCode(code: string, values: Array<{ codigo: string }>) {
    if (
      values.some(
        (item) => item.codigo.toUpperCase() === code.trim().toUpperCase(),
      )
    ) {
      setError(`Ya existe un registro con el código "${code.trim()}".`);
      return false;
    }
    return true;
  }

  async function submitSubject(event: FormEvent) {
    event.preventDefault();
    if (!ensureUniqueCode(subjectCode, subjects)) return;
    await runSave(async () => {
      const created = await crearAsignatura(
        institutionId,
        {
          codigo: subjectCode.trim(),
          nombre: subjectName.trim(),
        },
        accessToken,
      );
      setSubjects((current) => [...current, created].sort(byName));
      setSubjectName("");
      setSubjectCode("");
      onToast("Asignatura creada");
    });
  }

  async function submitGrade(event: FormEvent) {
    event.preventDefault();
    if (!ensureUniqueCode(gradeCode, grades)) return;
    await runSave(async () => {
      const created = await crearGrado(
        institutionId,
        {
          codigo: gradeCode.trim(),
          nombre: gradeName.trim(),
          nombreCorto: gradeShortName.trim() || undefined,
          nivelEducativo: gradeLevel,
          orden: Number(gradeOrder),
        },
        accessToken,
      );
      setGrades((current) =>
        [...current, created].sort((a, b) => a.orden - b.orden),
      );
      setGradeName("");
      setGradeCode("");
      setGradeShortName("");
      setGradeOrder(String(grades.length + 2));
      setGroupGradeId((current) => current || created.id);
      onToast("Grado creado");
    });
  }

  async function submitSchedule(event: FormEvent) {
    event.preventDefault();
    if (!ensureUniqueCode(scheduleCode, schedules)) return;
    if (scheduleStart >= scheduleEnd) {
      setError(
        "La hora de finalización debe ser posterior a la hora de inicio.",
      );
      return;
    }
    await runSave(async () => {
      const created = await crearJornada(
        institutionId,
        {
          codigo: scheduleCode.trim(),
          nombre: scheduleName,
          horaInicio: scheduleStart,
          horaFin: scheduleEnd,
        },
        accessToken,
      );
      setSchedules((current) => [...current, created].sort(byName));
      setScheduleName("mañana");
      setScheduleCode("");
      setGroupScheduleId((current) => current || created.id);
      onToast("Jornada creada");
    });
  }

  async function submitGroup(event: FormEvent) {
    event.preventDefault();
    if (!ensureUniqueCode(groupCode, groups)) return;
    await runSave(async () => {
      const created = await crearGrupo(
        institutionId,
        {
          codigo: groupCode.trim(),
          nombre: groupName.trim(),
          sedeId: groupCampusId,
          anioLectivoId: groupYearId,
          gradoId: groupGradeId,
          jornadaId: groupScheduleId,
        },
        accessToken,
      );
      setGroups((current) => [...current, created].sort(byName));
      setGroupName("");
      setGroupCode("");
      onToast("Grupo creado");
    });
  }

  async function runSave(operation: () => Promise<void>) {
    setSaving(true);
    setError("");
    try {
      await operation();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  const groupReady = Boolean(
    campuses.length && years.length && grades.length && schedules.length,
  );

  return (
    <div className="academic-page">
      <div className="page-heading academic-heading">
        <div>
          <p className="eyebrow">Organización curricular</p>
          <h1>Estructura académica</h1>
          <p>
            Configura la base que utilizarán matrículas, horarios y
            calificaciones.
          </p>
        </div>
        <label className="academic-institution-picker">
          <span>Institución de trabajo</span>
          <select
            value={institutionId}
            onChange={(event) => setInstitutionId(event.target.value)}
          >
            {institutions.map((institution) => (
              <option value={institution.id} key={institution.id}>
                {institution.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="configuration-error" role="alert">
          <AlertCircle size={17} /> {error}
          <button aria-label="Cerrar mensaje" onClick={() => setError("")}>
            <X size={15} />
          </button>
        </p>
      )}

      <section className="academic-summary">
        <div>
          <span>
            <Building2 size={18} />
          </span>
          <small>Institución activa</small>
          <strong>{activeInstitution?.nombre ?? "Sin seleccionar"}</strong>
        </div>
        <div>
          <span>
            <CalendarDays size={18} />
          </span>
          <small>Años lectivos activos</small>
          <strong>{years.length}</strong>
        </div>
        <div>
          <span>
            <School size={18} />
          </span>
          <small>Grupos configurados</small>
          <strong>{groups.length}</strong>
        </div>
      </section>

      <nav className="academic-tabs" aria-label="Componentes académicos">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={
                section === tab.id
                  ? "academic-tab academic-tab--active"
                  : "academic-tab"
              }
              onClick={() => {
                setSection(tab.id);
                setError("");
              }}
            >
              <Icon size={17} />
              <span>{tab.label}</span>
              <b>{tab.count}</b>
            </button>
          );
        })}
      </nav>

      {loading ? (
        <div className="institution-state">Cargando estructura académica…</div>
      ) : !institutionId ? (
        <div className="institution-state">
          Crea o selecciona una institución activa.
        </div>
      ) : (
        <div className="academic-workspace">
          <section className="panel academic-list-panel">
            <header>
              <div>
                <p className="eyebrow">Directorio</p>
                <h2>{tabs.find((tab) => tab.id === section)?.label}</h2>
              </div>
              <span className="count-badge">
                {tabs.find((tab) => tab.id === section)?.count}
              </span>
            </header>
            {section === "asignaturas" && (
              <AcademicList
                empty="Aún no hay asignaturas."
                items={subjects.map((item) => ({
                  id: item.id,
                  title: item.nombre,
                  code: item.codigo,
                  detail: item.activo ? "Activa" : "Inactiva",
                }))}
              />
            )}
            {section === "grados" && (
              <AcademicList
                empty="Aún no hay grados."
                items={grades.map((item) => ({
                  id: item.id,
                  title: item.nombre,
                  code: item.codigo,
                  detail: humanize(item.nivelEducativo),
                }))}
              />
            )}
            {section === "jornadas" && (
              <AcademicList
                empty="Aún no hay jornadas."
                items={schedules.map((item) => ({
                  id: item.id,
                  title: item.nombre,
                  code: item.codigo,
                  detail:
                    item.horaInicio && item.horaFin
                      ? `${shortTime(item.horaInicio)} — ${shortTime(item.horaFin)}`
                      : "Horario pendiente",
                }))}
              />
            )}
            {section === "grupos" && (
              <AcademicList
                empty="Aún no hay grupos."
                items={groups.map((item) => ({
                  id: item.id,
                  title: item.nombre,
                  code: item.codigo,
                  detail: `${gradeById.get(item.gradoId) ?? "Grado"} · ${campusById.get(item.sedeId) ?? "Sede"}`,
                }))}
              />
            )}
          </section>

          <section className="panel academic-form-panel">
            {section === "asignaturas" && (
              <AcademicForm
                title="Nueva asignatura"
                description="Regístrala directamente en la institución."
                onSubmit={submitSubject}
                saving={saving}
              >
                <Field label="Nombre">
                  <input
                    value={subjectName}
                    onChange={(event) => setSubjectName(event.target.value)}
                    placeholder="Ej. Biología"
                    minLength={3}
                    required
                  />
                </Field>
                <Field label="Código">
                  <AutoCodeInput
                    value={subjectCode}
                    onChange={setSubjectCode}
                    source={subjectName}
                    fallback="ASIG"
                  />
                </Field>
              </AcademicForm>
            )}
            {section === "grados" && (
              <AcademicForm
                title="Nuevo grado"
                description="Define su nivel y posición académica."
                onSubmit={submitGrade}
                saving={saving}
              >
                <Field label="Nombre">
                  <input
                    value={gradeName}
                    onChange={(event) => setGradeName(event.target.value)}
                    placeholder="Ej. Grado sexto"
                    minLength={3}
                    required
                  />
                </Field>
                <Field label="Código">
                  <AutoCodeInput
                    value={gradeCode}
                    onChange={setGradeCode}
                    source={gradeName}
                    fallback="GRADO"
                  />
                </Field>
                <div className="form-grid">
                  <Field label="Nombre corto">
                    <input
                      value={gradeShortName}
                      onChange={(event) =>
                        setGradeShortName(event.target.value)
                      }
                      placeholder="6°"
                    />
                  </Field>
                  <Field label="Orden">
                    <input
                      type="number"
                      min="1"
                      value={gradeOrder}
                      onChange={(event) => setGradeOrder(event.target.value)}
                      required
                    />
                  </Field>
                </div>
                <Field label="Nivel educativo">
                  <select
                    value={gradeLevel}
                    onChange={(event) =>
                      setGradeLevel(event.target.value as NivelEducativo)
                    }
                  >
                    <option value="preescolar">Preescolar</option>
                    <option value="primaria">Básica primaria</option>
                    <option value="secundaria">Básica secundaria</option>
                    <option value="media">Media</option>
                    <option value="tecnica">Técnica</option>
                    <option value="adultos">Educación para adultos</option>
                    <option value="otro">Otro</option>
                  </select>
                </Field>
              </AcademicForm>
            )}
            {section === "jornadas" && (
              <AcademicForm
                title="Nueva jornada"
                description="Establece el horario general de atención."
                onSubmit={submitSchedule}
                saving={saving}
              >
                <Field label="Nombre">
                  <select
                    value={scheduleName}
                    onChange={(event) =>
                      setScheduleName(event.target.value as JornadaNombre)
                    }
                  >
                    <option value="mañana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="única">Única</option>
                    <option value="nocturna">Nocturna</option>
                    <option value="sabatina">Sabatina</option>
                  </select>
                </Field>
                <Field label="Código">
                  <AutoCodeInput
                    value={scheduleCode}
                    onChange={setScheduleCode}
                    source={scheduleName}
                    fallback="JORN"
                  />
                </Field>
                <div className="form-grid">
                  <Field label="Hora inicial">
                    <input
                      type="time"
                      value={scheduleStart}
                      onChange={(event) => setScheduleStart(event.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Hora final">
                    <input
                      type="time"
                      value={scheduleEnd}
                      onChange={(event) => setScheduleEnd(event.target.value)}
                      required
                    />
                  </Field>
                </div>
              </AcademicForm>
            )}
            {section === "grupos" && (
              <AcademicForm
                title="Nuevo grupo"
                description="Combina sede, año, grado y jornada."
                onSubmit={submitGroup}
                saving={saving}
                blocked={!groupReady}
                blockedText="Configura primero una sede, un año lectivo, un grado y una jornada."
              >
                <Field label="Nombre">
                  <input
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    placeholder="Ej. Sexto A"
                    minLength={2}
                    required
                  />
                </Field>
                <Field label="Código">
                  <AutoCodeInput
                    value={groupCode}
                    onChange={setGroupCode}
                    source={groupName}
                    fallback="GRUPO"
                  />
                </Field>
                <Field label="Sede">
                  <select
                    value={groupCampusId}
                    onChange={(event) => setGroupCampusId(event.target.value)}
                    required
                  >
                    {campuses.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Año lectivo">
                  <select
                    value={groupYearId}
                    onChange={(event) => setGroupYearId(event.target.value)}
                    required
                  >
                    {years.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.nombre ?? item.anio}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="form-grid">
                  <Field label="Grado">
                    <select
                      value={groupGradeId}
                      onChange={(event) => setGroupGradeId(event.target.value)}
                      required
                    >
                      {grades.map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Jornada">
                    <select
                      value={groupScheduleId}
                      onChange={(event) =>
                        setGroupScheduleId(event.target.value)
                      }
                      required
                    >
                      {schedules.map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </AcademicForm>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function AcademicList({
  items,
  empty,
}: {
  items: Array<{ id: string; title: string; code: string; detail: string }>;
  empty: string;
}) {
  if (!items.length)
    return (
      <div className="academic-empty">
        <BookOpen size={25} />
        <p>{empty}</p>
      </div>
    );
  return (
    <div className="academic-list">
      {items.map((item) => (
        <article key={item.id}>
          <span>
            <Check size={15} />
          </span>
          <div>
            <strong>{item.title}</strong>
            <small>
              {item.code} · {item.detail}
            </small>
          </div>
        </article>
      ))}
    </div>
  );
}

function AcademicForm({
  title,
  description,
  onSubmit,
  saving,
  blocked = false,
  blockedText,
  children,
}: {
  title: string;
  description: string;
  onSubmit: (event: FormEvent) => void;
  saving: boolean;
  blocked?: boolean;
  blockedText?: string;
  children: ReactNode;
}) {
  return (
    <form className="academic-form" onSubmit={onSubmit}>
      <header>
        <span>
          <Plus size={18} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      {blocked ? (
        <div className="academic-blocked">
          <AlertCircle size={19} />
          <p>{blockedText}</p>
        </div>
      ) : (
        <>
          {children}
          <button
            className="button button--primary button--full"
            type="submit"
            disabled={saving}
          >
            {saving ? (
              "Guardando…"
            ) : (
              <>
                <Plus size={16} /> Crear registro
              </>
            )}
          </button>
        </>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field field--full">
      <span>{label}</span>
      {children}
    </label>
  );
}

function AutoCodeInput({
  value,
  onChange,
  source,
  fallback,
}: {
  value: string;
  onChange: (value: string) => void;
  source: string;
  fallback: string;
}) {
  return (
    <div className="input-with-action">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        placeholder={`Ej. ${fallback}-4K2M`}
        maxLength={20}
        required
      />
      <button
        type="button"
        className="generate-code-button"
        disabled={source.trim().length < 2}
        onClick={() => onChange(generateCode(source, fallback))}
      >
        <Sparkles size={15} /> Autogenerar
      </button>
    </div>
  );
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
  return `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function byName<T extends { nombre: string }>(left: T, right: T) {
  return left.nombre.localeCompare(right.nombre);
}

function errorMessage(caught: unknown) {
  return caught instanceof Error
    ? caught.message
    : "No fue posible completar la operación";
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function shortTime(value: string) {
  return value.slice(0, 5);
}
