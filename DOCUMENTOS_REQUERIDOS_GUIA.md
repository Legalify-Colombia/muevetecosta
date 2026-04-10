# Documentos Requeridos por Universidad - Guía de Uso

## Descripción General

El sistema ahora permite que cada universidad defina los documentos que los estudiantes y profesores deben presentar al postularse para un programa de movilidad. Esta funcionalidad está completamente integrada en:

1. **UniversityDetail** - Vista pública de detalles de universidad
2. **MobilityApplication** - Formulario de postulación
3. **Dashboard del Coordinador** - Gestión de documentos
4. **ComponenteReutilizable** - Para uso en otras secciones

---

## Tabla: university_required_documents

### Estructura
```sql
CREATE TABLE university_required_documents (
  id UUID PRIMARY KEY,
  university_id UUID REFERENCES universities(id),
  document_title TEXT NOT NULL,
  document_type TEXT,
  is_mandatory BOOLEAN (obligatorio/opcional),
  mobility_type ENUM ('student', 'professor', 'both'),
  description TEXT,
  template_file_url TEXT,
  template_file_name TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Campos Clave

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `document_title` | TEXT | Nombre del documento (ej: "Cédula de Identidad", "Certificado Académico") |
| `is_mandatory` | BOOLEAN | Si es verdadero, el documento DEBE estar presente |
| `mobility_type` | ENUM | 'student' = solo para estudiantes, 'professor' = solo profesores, 'both' = ambos |
| `description` | TEXT | Detalles adicionales sobre el documento |
| `template_file_url` | TEXT | URL descargable de plantilla (archivo PDF en storage) |
| `template_file_name` | TEXT | Nombre original del archivo plantilla |

---

## Cómo Usar - Para Coordinadores

### 1. Ir a Gestencia de Documentos
1. Accede a tu dashboard de coordinador
2. Ve a la sección "Configuración de la Universidad"
3. Busca "Documentos Requeridos"

### 2. Agregar un Documento Requerido

```
Haz clic en "+ Agregar Documento"

Formulario:
├─ Título del Documento: "Pasaporte"
├─ Obligatorio: ✓ Sí (checkbox)
├─ Tipo de Movilidad: "both" (aplica a estudiantes y profesores)
├─ Descripción: "Pasaporte vigente, mínimo 6 meses de validez"
└─ Plantilla (opcional): [Subir archivo PDF]
```

### 3. Descargar Plantilla (Opcional)

Si deseas que los solicitantes descarguen una plantilla:
1. En la sección de documentos, haz clic en "Subir Plantilla"
2. Sube un archivo PDF o DOC
3. Se almacenará en el bucket `template-documents`
4. Los estudiantes verán un botón "Descargar Plantilla"

### 4. Editar o Eliminar

- **Editar**: Haz clic en el documento y modifica campos
- **Eliminar**: Haz clic en el icono de papelera (no afecta datos existentes)

---

## Flujo del Estudiante

### Antes de Postular

```
Estudiante ve Universidad
       ↓
Ve "Documentos Requeridos" en UniversityDetail
       ↓
Lee lista de documentos (obligatorios + opcionales)
       ↓
Descarga plantillas si están disponibles
```

### Durante la Postulación

```
Estudiante inicia aplicación
       ↓
Ve "DocumentUploadSection"
       ↓
Sube cada documento requerido
       ↓
Sistema valida: ¿Todos obligatorios presentes?
       ↓
Si NO: Muestra "Documentos Faltantes" en rojo
Si SÍ: Permite enviar aplicación
```

---

## Componentes Frontend

### 1. RequiredDocumentsDisplay
**Ubicación**: `src/components/common/RequiredDocumentsDisplay.tsx`

Muestra la lista de documentos requeridos en diferentes contextos.

```typescript
<RequiredDocumentsDisplay
  universityId={universityId}
  universityName="Universidad de Santander"
  variant="default" // "default" | "compact" | "inline"
  mobilityType="student" // Filtrar por tipo
  onlyMandatory={true} // Solo obligatorios
/>
```

**Props:**
- `variant`:
  - `"default"`: Grid completo con descripciones y plantillas (2+ columnas)
  - `"compact"`: Lista simple con checkbox
  - `"inline"`: Card de alerta (para en formularios)
- `mobilityType`: Filtra documentos por tipo de movilidad
- `onlyMandatory`: Si es true, muestra solo obligatorios

### 2. DocumentPreparationGuide
**Ubicación**: `src/components/common/DocumentPreparationGuide.tsx`

Guía previa a la postulación que ayuda al estudiante a prepararse.

```typescript
<DocumentPreparationGuide
  universityName="Universidad de Santander"
  documentsCount={5}
  mandatoryCount={3}
  optionalCount={2}
/>
```

---

## Integración en Páginas

### UniversityDetail.tsx
```typescript
<RequiredDocumentsDisplay 
  universityId={id || ''} 
  universityName={university.name || 'la universidad'}
  // Muestra todos los documentos para esa universidad
/>
```

**Ubicación**: Aparece en la página detalles de universidad, entre la descripción y programas académicos.

### MobilityApplication.tsx
```typescript
<RequiredDocumentsDisplay
  universityId={universityId || ''}
  universityName={university?.name || 'la universidad'}
  variant="inline"
  mobilityType="student"
  onlyMandatory={true}
/>
```

**Ubicación**: En el formulario de postulación, después de `DocumentUploadSection`.

---

## Tabla: application_attachments

Almacena la relación entre documentos cargados y documentos requeridos.

### Estructura
```sql
CREATE TABLE application_attachments (
  id UUID PRIMARY KEY,
  application_id UUID,
  application_type ENUM ('student', 'professor'),
  required_document_id UUID REFERENCES university_required_documents(id),
  file_name TEXT,
  file_url TEXT,
  file_size INTEGER,
  applicant_comment TEXT,
  uploaded_at TIMESTAMP
);
```

### Cómo se Usa

1. Estudiante sube documento para "Cédula de Identidad"
2. Sistema crea fila en `application_attachments`:
   ```
   required_document_id → ID del documento requerido
   file_url → "student-documents/path/to/file.pdf"
   uploaded_at → 2024-01-15 10:30:00
   ```

3. Coordinador ve documento en dashboard y puede:
   - Descargarlo
   - Marcar como "verificado"
   - Dejar comentarios

---

## Buckets de Almacenamiento

Los documentos se almacenan en 3 buckets:

| Bucket | Acceso | Uso |
|--------|--------|-----|
| `template-documents` | Público | Plantillas que los coordinadores suben |
| `student-documents` | Privado | Documentos que cargan estudiantes |
| `professor-documents` | Privado | Documentos que cargan profesores |

---

## Seguridad - Políticas RLS

### university_required_documents
- ✅ **Coordinadores** pueden CRUD documentos de su universidad
- ✅ **Cualquiera** puede leer documentos activos de universidades activas
- ✅ **Otros** NO pueden modificar

### application_attachments
- ✅ **Estudiantes** pueden subir/descargar sus propios documentos
- ✅ **Coordinadores** pueden ver todos documentos de su universidad
- ✅ **Otros** NO tienen acceso

---

## Flujo de Validación

### En MobilityApplication.tsx

```typescript
// 1. Sistema obtiene documentos requeridos
const { data: requiredDocuments } = useUniversityRequiredDocuments(universityId);

// 2. Filtra solo obligatorios para estudiantes
const mandatory = requiredDocuments.filter(doc => 
  doc.is_mandatory && 
  (doc.mobility_type === 'student' || doc.mobility_type === 'both')
);

// 3. Al enviar, valida que todos estén presentes
const missingDocs = mandatory.filter(doc => !formData[`document_${doc.id}`]);

if (missingDocs.length > 0) {
  // Mostrar error: "Faltan documentos: [lista]"
  return;
}

// 4. Si todo está bien, crear application_attachments records
```

---

## Ejemplos de Documentos Requeridos

### Para Estudiantes (Ejemplo Universidad de Santander)

| Documento | Obligatorio | Descripción | Plantilla |
|-----------|------------|-------------|-----------|
| Cédula de Identidad | Sí | Original vigente | ❌ N/A |
| Pasaporte | Sí | Mínimo 6 meses vigencia | ❌ N/A |
| Certificado Académico | Sí | Últimas calificaciones | ✅ Disponible |
| Carta de Motivación | No | Máximo 500 palabras | ✅ Disponible |
| Referencia Académica | No | De un profesor | ✅ Disponible |

### Para Profesores

| Documento | Obligatorio | Descripción |
|-----------|------------|-------------|
| Currículum Vitae | Sí | Actualizado |
| Certificado de Investigación | Sí | Últimas publicaciones |
| Disponibilidad | Sí | Semestres disponibles |

---

## Gestión desde el Dashboard del Coordinador

### Panel de Documentos

```
Documentos Requeridos (5)
├─ ✓ Cédula de Identidad [Obligatorio] [Editar] [Eliminar]
├─ ✓ Pasaporte [Obligatorio] [Editar] [Eliminar]
├─ ✓ Certificado Académico [Obligatorio] [Editar] [Eliminar]
├─ ○ Carta de Motivación [Opcional] [Editar] [Eliminar]
└─ ○ Referencia Académica [Opcional] [Editar] [Eliminar]

[+ Agregar Documento]
```

### Estadísticas

```
Total de documentos: 5
Obligatorios: 3
Opcionales: 2
Plantillas disponibles: 3
```

---

## FAQ

### P: ¿Puedo cambiar documentos después que estudiantes ya han postulado?
**R**: Sí, pero solo afectará nuevas postulaciones. Los estudiantes que ya postularon mantendrán los documentos que cargaron.

### P: ¿Qué pasa si elimino un documento requerido?
**R**: El documento desaparece de futuras postulaciones, pero los registros en `application_attachments` se preservan para auditoría.

### P: ¿Los estudiantes ven documentos de "profesor" en su lista?
**R**: No. El sistema filtra automáticamente según el tipo de movilidad (student/professor).

### P: ¿Puedo hacer un documento obligatorio retroactivamente?
**R**: Sí, pero estudiantes que ya postularon no necesitarán cumplir el nuevo requisito.

### P: ¿Se guardan los documentos en la nube o en el servidor?
**R**: En Supabase Storage (S3-compatible). URLs permanentes en aplicaciones.

---

## Monitoreo

### Verificar documentos faltantes de un estudiante

```typescript
const { data: attachments } = await supabase
  .from('application_attachments')
  .select('required_document_id')
  .eq('application_id', studentApplicationId);

const uploadedDocIds = attachments?.map(a => a.required_document_id) || [];
const missingDocs = requiredDocuments.filter(
  doc => !uploadedDocIds.includes(doc.id)
);
```

### Reporte de cumplimiento

```typescript
const { data: applications } = await supabase
  .from('mobility_applications')
  .select('id')
  .eq('destination_university_id', universityId);

// Para cada aplicación, verificar documentos completeness
```

---

## Próximas Mejoras Sugeridas

- [ ] Dashboard para coordinadores con vista de documentos recibidos
- [ ] Notificaciones automáticas cuando falten documentos
- [ ] Firma digital de documentos
- [ ] Escaneo OCR para validación automática
- [ ] Descarga en lote de documentos de múltiples estudiantes

