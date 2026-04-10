import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useMirrorClasses,
  useCreateMirrorClass,
  useUpdateMirrorClass,
  useRegisterForClass,
  type MirrorClass,
  type CreateMirrorClassData,
} from "@/hooks/useMirrorClasses";
import { useUniversities } from "@/hooks/useUniversities";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Video,
  ChevronRight,
  UserCircle,
  Building2,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─── helpers ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  espejo: "Clase Espejo",
  masterclass: "Masterclass",
};

const TYPE_COLORS: Record<string, string> = {
  espejo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  masterclass: "bg-amber-100 text-amber-700 border-amber-200",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  published: "Publicada",
  cancelled: "Cancelada",
  completed: "Completada",
};

function formatDate(date: string) {
  try {
    return format(new Date(date + "T00:00:00"), "d 'de' MMMM, yyyy", { locale: es });
  } catch {
    return date;
  }
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

// ─── Registration Modal ───────────────────────────────────────────────────────

interface RegistrationModalProps {
  cls: MirrorClass;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

function RegistrationModal({
  cls,
  onClose,
  userId,
  userEmail,
  userName,
}: RegistrationModalProps) {
  const { mutate: register, isPending } = useRegisterForClass();
  const [fullName, setFullName] = useState(userName ?? "");
  const [email, setEmail] = useState(userEmail ?? "");
  const [success, setSuccess] = useState(false);

  const spotsLeft = cls.max_capacity - (cls.registrations_count ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(
      { classId: cls.id, fullName, email, userId },
      {
        onSuccess: () => setSuccess(true),
      }
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {success ? "¡Inscripción exitosa!" : "Inscribirme a la clase"}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={36} />
            </div>
            <p className="text-gray-600">
              Hemos registrado tu inscripción para{" "}
              <span className="font-semibold text-gray-900">{cls.title}</span>.
              {cls.meeting_link && (
                <> Podrás acceder al enlace de conexión a continuación.</>
              )}
            </p>
            {cls.meeting_link && (
              <a
                href={cls.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <ExternalLink size={16} />
                Abrir enlace de sesión
              </a>
            )}
            <Button variant="outline" onClick={onClose} className="mt-2">
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-lg p-3 mb-2 text-sm">
              <p className="font-medium text-gray-800">{cls.title}</p>
              <p className="text-gray-500 mt-1">
                {formatDate(cls.scheduled_date)} · {formatTime(cls.scheduled_time)}
              </p>
              {spotsLeft <= 10 && (
                <p className="text-amber-600 font-medium mt-1">
                  ¡Solo quedan {spotsLeft} cupos!
                </p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reg-name">Nombre completo</Label>
                <Input
                  id="reg-name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. María García"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reg-email">Correo institucional</Label>
                <Input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@universidad.edu.co"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || spotsLeft <= 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isPending ? "Procesando..." : spotsLeft <= 0 ? "Sin cupos" : "Confirmar inscripción"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Class Form (create / edit) ────────────────────────────────────────────────

interface ClassFormProps {
  initial?: MirrorClass;
  onClose: () => void;
  universities: { id: string; name: string }[];
}

function ClassForm({ initial, onClose, universities }: ClassFormProps) {
  const { mutate: create, isPending: creating } = useCreateMirrorClass();
  const { mutate: update, isPending: updating } = useUpdateMirrorClass();

  const isPending = creating || updating;

  const [form, setForm] = useState<CreateMirrorClassData>({
    type: initial?.type ?? "masterclass",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    university_id: initial?.university_id ?? "",
    partner_university_id: initial?.partner_university_id ?? "",
    professor_name: initial?.professor_name ?? "",
    professor_title: initial?.professor_title ?? "",
    professor_bio: initial?.professor_bio ?? "",
    professor_photo_url: initial?.professor_photo_url ?? "",
    scheduled_date: initial?.scheduled_date ?? "",
    scheduled_time: initial?.scheduled_time?.slice(0, 5) ?? "",
    duration_minutes: initial?.duration_minutes ?? 90,
    max_capacity: initial?.max_capacity ?? 50,
    meeting_link: initial?.meeting_link ?? "",
    image_url: initial?.image_url ?? "",
    status: (initial?.status as "draft" | "published") ?? "published",
  });

  const set = (field: keyof CreateMirrorClassData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateMirrorClassData = {
      ...form,
      university_id: form.university_id || undefined,
      partner_university_id:
        form.type === "espejo" ? form.partner_university_id || undefined : undefined,
      description: form.description || undefined,
      professor_title: form.professor_title || undefined,
      professor_bio: form.professor_bio || undefined,
      professor_photo_url: form.professor_photo_url || undefined,
      meeting_link: form.meeting_link || undefined,
      image_url: form.image_url || undefined,
    };

    if (initial) {
      update({ id: initial.id, ...payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar clase" : "Crear nueva clase"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo + Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de clase</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masterclass">Masterclass</SelectItem>
                  <SelectItem value="espejo">Clase Espejo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as "draft" | "published")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicada</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Título */}
          <div>
            <Label htmlFor="cf-title">Título *</Label>
            <Input
              id="cf-title"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ej. Arquitectura Sostenible en el Caribe"
              className="mt-1"
            />
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="cf-desc">Descripción</Label>
            <Textarea
              id="cf-desc"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe brevemente el tema de la clase..."
              className="mt-1"
            />
          </div>

          {/* Universidades */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Universidad organizadora</Label>
              <Select
                value={form.university_id}
                onValueChange={(v) => set("university_id", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar universidad" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.type === "espejo" && (
              <div>
                <Label>Universidad socia (Clase Espejo)</Label>
                <Select
                  value={form.partner_university_id}
                  onValueChange={(v) => set("partner_university_id", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar universidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Profesor */}
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <p className="font-semibold text-gray-700 text-sm">Datos del profesor</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cf-prof-name">Nombre *</Label>
                <Input
                  id="cf-prof-name"
                  required
                  value={form.professor_name}
                  onChange={(e) => set("professor_name", e.target.value)}
                  placeholder="Dr. Juan Pérez"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cf-prof-title">Cargo / Título</Label>
                <Input
                  id="cf-prof-title"
                  value={form.professor_title}
                  onChange={(e) => set("professor_title", e.target.value)}
                  placeholder="Docente Investigador"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cf-prof-bio">Bio breve</Label>
              <Textarea
                id="cf-prof-bio"
                rows={2}
                value={form.professor_bio}
                onChange={(e) => set("professor_bio", e.target.value)}
                placeholder="Breve descripción del perfil del profesor..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cf-prof-photo">URL foto de perfil</Label>
              <Input
                id="cf-prof-photo"
                type="url"
                value={form.professor_photo_url}
                onChange={(e) => set("professor_photo_url", e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>

          {/* Fecha / hora / duración */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cf-date">Fecha *</Label>
              <Input
                id="cf-date"
                type="date"
                required
                value={form.scheduled_date}
                onChange={(e) => set("scheduled_date", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cf-time">Hora *</Label>
              <Input
                id="cf-time"
                type="time"
                required
                value={form.scheduled_time}
                onChange={(e) => set("scheduled_time", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cf-duration">Duración (min)</Label>
              <Input
                id="cf-duration"
                type="number"
                min={15}
                max={480}
                value={form.duration_minutes}
                onChange={(e) => set("duration_minutes", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Capacidad */}
          <div>
            <Label htmlFor="cf-capacity">Cupos máximos *</Label>
            <Input
              id="cf-capacity"
              type="number"
              min={1}
              required
              value={form.max_capacity}
              onChange={(e) => set("max_capacity", parseInt(e.target.value))}
              className="mt-1 max-w-[140px]"
            />
          </div>

          {/* Enlace + imagen */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cf-link">Enlace de sesión (Zoom/Teams)</Label>
              <Input
                id="cf-link"
                type="url"
                value={form.meeting_link}
                onChange={(e) => set("meeting_link", e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cf-img">URL imagen de portada</Label>
              <Input
                id="cf-img"
                type="url"
                value={form.image_url}
                onChange={(e) => set("image_url", e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? "Guardando..." : initial ? "Guardar cambios" : "Crear clase"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Class Card ────────────────────────────────────────────────────────────────

interface ClassCardProps {
  cls: MirrorClass;
  canManage: boolean;
  onRegister: () => void;
  onEdit: () => void;
}

function ClassCard({ cls, canManage, onRegister, onEdit }: ClassCardProps) {
  const spotsLeft = cls.max_capacity - (cls.registrations_count ?? 0);
  const isFull = spotsLeft <= 0;
  const isPast = new Date(cls.scheduled_date + "T23:59:59") < new Date();

  return (
    <Card className="group overflow-hidden border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
      {/* Imagen */}
      {cls.image_url && (
        <div className="relative h-44 overflow-hidden">
          <img
            src={cls.image_url}
            alt={cls.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${TYPE_COLORS[cls.type]}`}
            >
              {TYPE_LABELS[cls.type]}
            </span>
            {canManage && cls.status !== "published" && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-gray-800 text-white">
                {STATUS_LABELS[cls.status]}
              </span>
            )}
          </div>
        </div>
      )}

      <CardContent className="p-5">
        {/* Si no hay imagen, mostrar badge arriba */}
        {!cls.image_url && (
          <div className="flex gap-2 mb-3">
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${TYPE_COLORS[cls.type]}`}
            >
              {TYPE_LABELS[cls.type]}
            </span>
            {canManage && cls.status !== "published" && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-gray-800 text-white">
                {STATUS_LABELS[cls.status]}
              </span>
            )}
          </div>
        )}

        {/* Fecha y hora */}
        <div className="flex items-center gap-3 text-blue-600 text-xs font-semibold mb-2">
          <span className="flex items-center gap-1">
            <Calendar size={13} />
            {formatDate(cls.scheduled_date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {formatTime(cls.scheduled_time)}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
          {cls.title}
        </h3>

        {/* Descripción */}
        {cls.description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{cls.description}</p>
        )}

        {/* Universidades */}
        <div className="flex flex-col gap-1 text-xs text-gray-500 mb-3">
          {cls.university && (
            <span className="flex items-center gap-1">
              <Building2 size={12} className="flex-shrink-0" />
              {cls.university.name}
              {cls.partner_university && ` & ${cls.partner_university.name}`}
            </span>
          )}
        </div>

        {/* Profesor */}
        <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-lg px-3 py-2">
          {cls.professor_photo_url ? (
            <img
              src={cls.professor_photo_url}
              alt={cls.professor_name}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <UserCircle size={20} className="text-blue-600" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm leading-tight truncate">
              {cls.professor_name}
            </p>
            {cls.professor_title && (
              <p className="text-gray-500 text-xs truncate">{cls.professor_title}</p>
            )}
          </div>
        </div>

        {/* Cupos */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-1">
              <Users size={12} />
              Cupos disponibles
            </span>
            <span className={`font-semibold ${isFull ? "text-red-600" : spotsLeft <= 10 ? "text-amber-600" : "text-green-600"}`}>
              {isFull ? "Agotados" : `${spotsLeft} de ${cls.max_capacity}`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${isFull ? "bg-red-500" : spotsLeft <= 10 ? "bg-amber-500" : "bg-green-500"}`}
              style={{
                width: `${Math.min(100, ((cls.registrations_count ?? 0) / cls.max_capacity) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <Button
            onClick={onRegister}
            disabled={isFull || isPast || cls.status !== "published"}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
            size="sm"
          >
            {isPast ? "Finalizada" : isFull ? "Sin cupos" : (
              <>Inscribirme <ChevronRight size={15} className="ml-1" /></>
            )}
          </Button>
          {cls.meeting_link && cls.status === "published" && (
            <a
              href={cls.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" title="Enlace de sesión">
                <ExternalLink size={15} />
              </Button>
            </a>
          )}
          {canManage && (
            <Button variant="outline" size="sm" onClick={onEdit} title="Editar">
              <Edit size={15} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClasesEspejo() {
  const { user, profile } = useAuth();
  const canManage =
    profile?.role === "coordinator" || profile?.role === "admin";

  const { data: classes = [], isLoading } = useMirrorClasses(canManage);
  const { data: universities = [] } = useUniversities();

  const [filter, setFilter] = useState<"all" | "espejo" | "masterclass">("all");
  const [registerTarget, setRegisterTarget] = useState<MirrorClass | null>(null);
  const [editTarget, setEditTarget] = useState<MirrorClass | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered =
    filter === "all" ? classes : classes.filter((c) => c.type === filter);

  const universityList = (universities as any[]).map((u) => ({ id: u.id, name: u.name }));

  const userInfo = user && profile
    ? `${profile.full_name} (${profile.role})`
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header showAuthButtons={!user} showLogout={!!user} userInfo={userInfo} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F172A] to-blue-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-3 mb-5">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
              <Video size={15} /> Masterclasses
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
              <BookOpen size={15} /> Clases Espejo
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Clases Espejo &{" "}
            <span className="text-blue-300">Masterclasses</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Conéctate con las mejores universidades de la Región Caribe. Sesiones
            en vivo con expertos, colaboración intercultural y aprendizaje sin
            fronteras.
          </p>
        </div>
      </section>

      {/* Beneficios */}
      <section className="bg-gray-50 border-b py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            {
              icon: <Users className="text-blue-600 mx-auto mb-2" size={28} />,
              title: "Networking Regional",
              desc: "Conoce estudiantes y docentes de toda la Costa Caribe Colombiana.",
            },
            {
              icon: <BookOpen className="text-blue-600 mx-auto mb-2" size={28} />,
              title: "Créditos Homologables",
              desc: "Muchas clases espejo pueden ser validadas en tu plan de estudio.",
            },
            {
              icon: <Video className="text-blue-600 mx-auto mb-2" size={28} />,
              title: "Acceso Remoto",
              desc: "Participa desde donde estés con solo un enlace de conexión.",
            },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              {f.icon}
              <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Listado */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              Programación Académica
            </p>
            <h2 className="text-3xl font-bold text-gray-900">Próximas Sesiones</h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filtro */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {(["all", "espejo", "masterclass"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    filter === f
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f === "all" ? "Todas" : TYPE_LABELS[f]}
                </button>
              ))}
            </div>

            {/* Crear */}
            {canManage && (
              <Button
                onClick={() => setShowCreate(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Plus size={16} />
                Nueva clase
              </Button>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">No hay clases disponibles</p>
            <p className="text-sm mt-1">
              {canManage
                ? "Crea la primera clase con el botón \"Nueva clase\"."
                : "Vuelve pronto, pronto habrá nuevas sesiones."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                canManage={canManage}
                onRegister={() => setRegisterTarget(cls)}
                onEdit={() => setEditTarget(cls)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Modales */}
      {registerTarget && (
        <RegistrationModal
          cls={registerTarget}
          onClose={() => setRegisterTarget(null)}
          userId={user?.id}
          userEmail={user?.email}
          userName={profile?.full_name ?? undefined}
        />
      )}

      {(showCreate || editTarget) && (
        <ClassForm
          initial={editTarget ?? undefined}
          universities={universityList}
          onClose={() => {
            setShowCreate(false);
            setEditTarget(null);
          }}
        />
      )}
    </div>
  );
}
