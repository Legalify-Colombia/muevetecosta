# Arquitectura - Documentos Requeridos

## Vista General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                      MUÉVETE POR LA COSTA                       │
│                  Your University Mobility Platform              │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                ESTUDIANTE    COORDINADOR    ADMIN
                    │             │             │
          ┌─────────┴────────┐    │    ┌────────┴──────┐
          │                  │    │    │               │
      UniversityDetail   Public API  Dashboard   Management
          │                  │    │    │               │
          └──────────────────┘    │    └───────────────┘
                 │                │
         [DOCUMENTOS REQUERIDOS]◄─┴─►[GESTION]
```

---

## Componentes Frontend

### 1. RequiredDocumentsDisplay
```
RequiredDocumentsDisplay
│
├─ Variant: "default" (Grid)
│  └─ useUniversityRequiredDocuments(universityId)
│     ├─ GET /university_required_documents
│     ├─ Filter by mobility_type
│     └─ RLS: SELECT *
│
├─ Variant: "inline" (Alert Card)
│  └─ Same hook + filters
│     └─ Display as AlertBox
│
└─ Variant: "compact" (List)
   └─ Same hook + filters
      └─ Display as BulletList

Props:
  ├─ universityId: string
  ├─ universityName: string
  ├─ variant: "default" | "compact" | "inline"
  ├─ mobilityType?: "student" | "professor"
  └─ onlyMandatory?: boolean
```

### 2. DocumentPreparationGuide
```
DocumentPreparationGuide
│
├─ Display Summary Stats
│  ├─ Total Documentos
│  ├─ Obligatorios
│  └─ Opcionales
│
├─ Progress Bar
│  └─ Mandatory / Total
│
└─ Recomendaciones
   └─ 4 Consejos clave

Props:
  ├─ universityName: string
  ├─ documentsCount: number
  ├─ mandatoryCount: number
  └─ optionalCount: number
```

---

## Flujo de Datos

### Contexto: UniversityDetail

```
User Acccesa Universidad
        │
        ▼
UniversityDetail.tsx
        │
        ├─ useUniversity(id)
        │  └─ GET /universities/{id}
        │     ├─ name, description, logo_url
        │     └─ academic_programs[]
        │
        └─ <RequiredDocumentsDisplay />
           │
           ├─ useUniversityRequiredDocuments(universityId)
           │  └─ GET /university_required_documents
           │     ├─ WHERE university_id = ?
           │     ├─ Filter: [student, professor, both]
           │     └─ RLS: SELECT allowed
           │
           ├─ Map documents
           │  └─ For each document:
           │     ├─ Draw icon (📌 or ✓)
           │     ├─ Display title, description
           │     ├─ If template_file_url: Show download
           │     └─ Render badge [Obligatorio|Opcional]
           │
           └─ Output: Card Grid 2 columnas
```

### Contexto: MobilityApplication

```
Student Starts Application
        │
        ▼
MobilityApplication.tsx
        │
        ├─ useUniversity(universityId)
        ├─ useProgram(programId)
        └─ Form State (studentInfo, documents, etc)
           │
           │
        Step 1: PersonalInfoSection
           │
        Step 2: AcademicInfoSection
           │
        Step 3: MobilityDetailsSection
           │
        Step 4: DocumentUploadSection
           │     └─ Manual upload of each document
           │
        Step 5: <RequiredDocumentsDisplay />    ◄─── NEW
           │     │
           │     └─ useUniversityRequiredDocuments(universityId)
           │        ├─ Filter: is_mandatory = true
           │        ├─ Filter: mobility_type IN ['student', 'both']
           │        └─ Display: variant="inline"
           │
        Step 6: Submit Button
           │
           ├─ validateForm()
           │  └─ Check required docs present
           │
           └─ If OK: POST /mobility_applications
              └─ Create application_attachments
                 for each uploaded document
```

---

## Estructura de Datos

### university_required_documents
```
┌─ id (UUID PRIMARY KEY)
│
├─ university_id (FK → universities.id)
│  └─ Agrupa documentos por IES
│
├─ document_title (TEXT)
│  └─ "Cédula de Identidad"
│
├─ is_mandatory (BOOLEAN)
│  └─ true = DEBE tenerlo, false = Opcional
│
├─ mobility_type (ENUM)
│  └─ 'student' | 'professor' | 'both'
│
├─ description (TEXT)
│  └─ "Documento de identidad vigente"
│
├─ template_file_url (TEXT)
│  └─ "https://storage.url/template.pdf"
│
├─ template_file_name (TEXT)
│  └─ "Plantilla_Cedula_2024.pdf"
│
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)
```

### application_attachments
```
┌─ id (UUID PRIMARY KEY)
│
├─ application_id (FK → mobility_applications.id)
│
├─ application_type (ENUM)
│  └─ 'student' | 'professor'
│
├─ required_document_id (FK → university_required_documents.id)
│  └─ Link back to documento requerido
│
├─ file_name (TEXT)
│  └─ "Mi_Cedula.pdf"
│
├─ file_url (TEXT)
│  └─ "student-documents/.../cedula.pdf"
│
├─ file_size (INTEGER)
│  └─ Bytes
│
├─ applicant_comment (TEXT)
│  └─ Optional notes
│
└─ uploaded_at (TIMESTAMP)
```

---

## Rutas de Datos

### Lectura (GET)

```
┌─────────────────────────────────────┐
│ useUniversityRequiredDocuments Hook │
└──────────────────┬──────────────────┘
                   │
        ●────────────────────●
        │  supabase.from()    │
        │  .select('*')       │ ✓ RLS: Cualquiera puede leer
        │  .eq('university_id', id)
        │                     │
        └────────────┬────────┘
                     │
        ┌────────────▼────────────┐
        │ university_required_    │
        │ documents table         │
        └─────────────────────────┘
```

### Escritura (POST/UPDATE/DELETE)

```
┌──────────────────────────────────────┐
│ Dashboard del Coordinador (Future)   │
└─────────────┬────────────────────────┘
              │
    ┌─────────▼──────────┐
    │ Agregar Documento  │
    │ - title            │
    │ - is_mandatory     │
    │ - mobility_type    │
    │ - description      │
    │ - template (File)  │
    └─────────┬──────────┘
              │
    auth.uid()? Coordinator?
    Yes ✅
              │
    ┌─────────▼──────────────────┐
    │ supabase.from()            │
    │ .insert({...})             │
    │ RLS: owner must be user    │
    │ RLS: university_id matches │
    └─────────┬──────────────────┘
              │
    ┌─────────▼──────────────┐
    │ Storage: upload file   │
    │ → template-documents   │
    │ → Bucket URL returned  │
    └─────────┬──────────────┘
              │
    ┌─────────▼──────────────────┐
    │ Update DB with file URL    │
    │ template_file_url field    │
    └────────────────────────────┘
```

---

## Validación de Documentos

### En Cliente (Preventivo)

```
MobilityApplication.tsx
    │
    └─ handleSubmit()
       │
       ├─ validateForm()
       │  ├─ ?Email valid
       │  ├─ ?Gender selected
       │  ├─ ?Origin institution
       │  ├─ ?Current semester
       │  ├─ ?Destination program
       │  └─ ?Start period
       │
       └─ validateRequiredDocuments()
          │
          ├─ Get mandatoryDocuments from state
          │  └─ Filter: is_mandatory=true & mobility_type.includes('student')
          │
          └─ For each required document:
             └─ Is formData[`document_${doc.id}`] present?
                ├─ YES ✓ Continue
                └─ NO ✗
                   └─ Add to missingDocs[]
       
       If missingDocs.length > 0:
           │
           ├─ toast.error("Faltan documentos:")
           ├─ Show RequiredDocumentsDisplay with is_mandatory=true
           └─ Block form submission
       
       Else:
           │
           └─ POST /mobility_applications
              └─ Create with documents
```

---

## Seguridad - RLS Policies

### university_required_documents

```
Policy 1: Coordinators Can Modify Own University
    ├─ Role: coordinator
    ├─ For: SELECT, INSERT, UPDATE, DELETE
    └─ Condition: coordinator.university_id = req.university_id

Policy 2: Everyone Can Read Active Docs
    ├─ Role: authenticated
    ├─ For: SELECT
    └─ Condition: university.is_active = true

Policy 3: Anons Can Read Active Docs (Public)
    ├─ Role: anon
    ├─ For: SELECT
    └─ Condition: university.is_active = true
```

### application_attachments

```
Policy 1: Students See Own Attachments
    ├─ Role: student
    ├─ For: SELECT, INSERT
    └─ Condition: application.student_id = auth.uid()

Policy 2: Coordinators See University Attachments
    ├─ Role: coordinator
    ├─ For: SELECT
    └─ Condition: application.destination_university_id = 
                  coordinator.university_id

Policy 3: Admins Can See All
    ├─ Role: admin
    ├─ For: SELECT, UPDATE
    └─ Condition: true (unrestricted)
```

---

## Storage Buckets

```
supabase/storage
  │
  ├─ template-documents
  │  ├─ Access: PUBLIC
  │  ├─ Max: 10 MB
  │  ├─ Types: .pdf, .doc, .docx
  │  └─ Usage: Coordinator templates
  │     └─ URL: /storage/v1/object/public/template-documents/...
  │
  ├─ student-documents
  │  ├─ Access: PRIVATE (RLS)
  │  ├─ Max: 50 MB
  │  ├─ Types: .pdf, .doc, .docx, .jpg, .png
  │  └─ Usage: Student/Applicant uploads
  │     └─ URL: /storage/v1/object/authenticated/student-documents/...
  │
  └─ professor-documents
     ├─ Access: PRIVATE (RLS)
     ├─ Max: 50 MB
     ├─ Types: .pdf, .doc, .docx, .jpg, .png
     └─ Usage: Professor/Applicant uploads
        └─ URL: /storage/v1/object/authenticated/professor-documents/...
```

---

## Mapeo de Componentes → Páginas

```
┌────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                         │
└────────────────────────────────────────────────────────┘

Pública:
  universities/ ──────┐
       │              │
       ├──► UniversityDetail
       │    └─ <RequiredDocumentsDisplay variant="default" />
       │
       └──► Registro/Login

Aplicante:
  /apply/:id/:program ───► MobilityApplication
                          ├─ PersonalInfoSection
                          ├─ AcademicInfoSection
                          ├─ MobilityDetailsSection
                          ├─ DocumentUploadSection
                          └─ <RequiredDocumentsDisplay variant="inline" /> ◄── NEW
                             └─ mobilityType="student"
                             └─ onlyMandatory={true}

Dashboard (Future):
  /dashboard/coordinator ──► CoordinatorDashboard
                            └─ UniversitySettings
                               └─ DocumentManagement
                                  └─ CRUD university_required_documents
```

---

## Interacciones de Usuario

### Estudiante Explorador

```
1. Visit Universities Page
   │
2. Click on "Universidad de Santander"
   └─ → UniversityDetail loaded
      └─ Shows:
         • University Logo + Name
         • Acerca de la Universidad
         • 📋 DOCUMENTOS REQUERIDOS ◄── HERE
           - Cédula [Obligatorio] [Descargar Plantilla]
           - Pasaporte [Obligatorio]
           - Cert. Académico [Obligatorio] [Descargar]
           - Carta Motivación [Opcional] [Descargar]
         • Academic Programs

3. Por cada documento:
   └─ Lee descripción
   └─ Descarga plantilla si existe
   └─ Nota si es obligatorio u opcional

4. Decide si cumple requisitos

5. Si SÍ:
   ├─ Registrarse / Login
   └─ Click "Postular a esta Universidad"
```

### Estudiante Aplicante

```
1. Entra a MobilityApplication
   ├─ Fill PersonalInfo
   ├─ Fill AcademicInfo
   ├─ Select MobilityDetails
   └─ Upload Documents
      │ (DocumentUploadSection)
      │ ├─ Browse files
      │ ├─ Select document type
      │ └─ Upload

2. After DocumentUploadSection:
   │
   └─ Ve RequiredDocumentsDisplay
      ├─ 📝 Documentos Obligatorios
      ├─ • Cédula [Obligatorio]
      ├─ • Pasaporte [Obligatorio]
      ├─ • Cert. Académico [Obligatorio]
      └─ ⚠️ "Asegúrate de cargar todos..."

3. Revisa documentos cargados
   ├─ Faltan documentos?
   │  └─ [Alert muestra cuáles]
   │  └─ NO puede enviar
   │
   └─ Todos presentes?
      └─ [Enable Submit button]

4. Click: "Enviar Aplicación"
   └─ Crea rows en application_attachments
   └─ Envia confirmación por email
```

---

## Performance

### Consultas Optimizadas

```
useUniversityRequiredDocuments(universityId)
  │
  ├─ Query Key: ['university-required-documents', universityId]
  ├─ Caching: Enabled (React Query)
  │  └─ Stale Time: 1 minute
  │  └─ Cache Time: 5 minutes
  │
  ├─ SELECT query:
  │  ├─ WHERE university_id = $1
  │  ├─ Indexed on university_id ✓
  │  └─ ORDER BY created_at DESC
  │
  └─ Result: Array of 3-10 documents (light)
```

---

## Error Handling

```
Escenarios:

1. No documents for university
   └─ RequiredDocumentsDisplay returns null
   └─ Page continues without alert

2. Loading documents
   └─ Hook shows isLoading
   └─ Component can show skeleton/spinner

3. Error fetching documents
   └─ useUniversityRequired catches error
   └─ Shows toast.error("Error cargando documentos")
   └─ Empty array fallback

4. Missing mandatory documents on submit
   └─ validateRequiredDocuments() detects
   └─ Shows alert with missing list
   └─ Blocks submission

5. RLS denies access (shouldn't happen)
   └─ Error logged to console
   └─ User sees "No documents available"
```

---

## Escalabilidad

```
Proyección futura:

Hoy (Current):
  • Max 20 documentos por universidad
  • ~5,000 estudiantes aplicando/año
  • Storage: ~100 MB por aplicación

Año 1:
  • Max 50 documentos
  • ~50,000 estudiantes
  • Storage: ~1 GB

Optimizaciones posibles:
  ✓ Documentos template cacheados en CDN
  ✓ Pagináción de documents list (25 items/page)
  ✓ Compresión de archivos PDF
  ✓ Implementar virus scanning
  ✓ File versioning y auditoría
```

---

## Conclusión

Arquitectura:
- ✅ Modular (componentes reutilizables)
- ✅ Segura (RLS policies en DB)
- ✅ Escalable (índices optimizados)
- ✅ Mantenible (código limpio y documentado)
- ✅ UX-first (interfaces intuitivas)

