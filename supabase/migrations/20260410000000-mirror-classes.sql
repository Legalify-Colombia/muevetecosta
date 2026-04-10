-- =============================================
-- Tabla: mirror_classes (Clases Espejo y Masterclasses)
-- =============================================

CREATE TABLE public.mirror_classes (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type                    TEXT NOT NULL CHECK (type IN ('espejo', 'masterclass')),
  title                   TEXT NOT NULL,
  description             TEXT,
  university_id           UUID REFERENCES public.universities(id) ON DELETE SET NULL,
  partner_university_id   UUID REFERENCES public.universities(id) ON DELETE SET NULL,
  -- Datos del profesor
  professor_name          TEXT NOT NULL,
  professor_title         TEXT,
  professor_bio           TEXT,
  professor_photo_url     TEXT,
  -- Programación
  scheduled_date          DATE NOT NULL,
  scheduled_time          TIME NOT NULL,
  duration_minutes        INTEGER NOT NULL DEFAULT 90,
  -- Capacidad
  max_capacity            INTEGER NOT NULL DEFAULT 50 CHECK (max_capacity > 0),
  -- Enlace de sesión
  meeting_link            TEXT,
  -- Imagen de portada
  image_url               TEXT,
  -- Estado
  status                  TEXT NOT NULL DEFAULT 'published'
                            CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  -- Auditoría
  created_by              UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Tabla: mirror_class_registrations (Inscripciones)
-- =============================================

CREATE TABLE public.mirror_class_registrations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id        UUID NOT NULL REFERENCES public.mirror_classes(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_class_email UNIQUE (class_id, email)
);

-- =============================================
-- Índices
-- =============================================

CREATE INDEX idx_mirror_classes_status       ON public.mirror_classes(status);
CREATE INDEX idx_mirror_classes_scheduled    ON public.mirror_classes(scheduled_date);
CREATE INDEX idx_mirror_classes_university   ON public.mirror_classes(university_id);
CREATE INDEX idx_mirror_class_reg_class      ON public.mirror_class_registrations(class_id);

-- =============================================
-- Trigger: updated_at automático
-- =============================================

CREATE OR REPLACE FUNCTION public.update_mirror_classes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mirror_classes_updated_at
  BEFORE UPDATE ON public.mirror_classes
  FOR EACH ROW EXECUTE FUNCTION public.update_mirror_classes_updated_at();

-- =============================================
-- RLS
-- =============================================

ALTER TABLE public.mirror_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mirror_class_registrations ENABLE ROW LEVEL SECURITY;

-- mirror_classes: cualquiera puede leer las publicadas
CREATE POLICY "mirror_classes_select_published"
  ON public.mirror_classes FOR SELECT
  USING (status = 'published');

-- mirror_classes: coordinadores y admin ven todas (incluso draft)
CREATE POLICY "mirror_classes_select_manage"
  ON public.mirror_classes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('coordinator', 'admin')
    )
  );

-- mirror_classes: solo coordinadores y admin pueden crear
CREATE POLICY "mirror_classes_insert"
  ON public.mirror_classes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('coordinator', 'admin')
    )
  );

-- mirror_classes: solo coordinadores y admin pueden editar
CREATE POLICY "mirror_classes_update"
  ON public.mirror_classes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('coordinator', 'admin')
    )
  );

-- mirror_classes: solo admin puede eliminar
CREATE POLICY "mirror_classes_delete"
  ON public.mirror_classes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- mirror_class_registrations: usuarios autenticados ven sus propias inscripciones
CREATE POLICY "mirror_class_reg_select_own"
  ON public.mirror_class_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- mirror_class_registrations: coordinadores y admin ven todas
CREATE POLICY "mirror_class_reg_select_manage"
  ON public.mirror_class_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('coordinator', 'admin')
    )
  );

-- mirror_class_registrations: cualquiera (anónimo o autenticado) puede inscribirse
-- siempre que haya cupo disponible
CREATE POLICY "mirror_class_reg_insert"
  ON public.mirror_class_registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mirror_classes mc
      WHERE mc.id = class_id
        AND mc.status = 'published'
        AND (
          SELECT COUNT(*) FROM public.mirror_class_registrations r
          WHERE r.class_id = mc.id
        ) < mc.max_capacity
    )
  );

-- mirror_class_registrations: sólo admin/coordinador pueden eliminar inscripciones
CREATE POLICY "mirror_class_reg_delete"
  ON public.mirror_class_registrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('coordinator', 'admin')
    )
  );
