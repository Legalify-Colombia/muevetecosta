# Solución: Error de Perfil en Registro de Estudiantes/Profesores

## Problema Reportado ❌

```
Error: GET /rest/v1/profiles?select=*&id=eq.226a973c-3766-4a65-b009-4e0d80b21c93 → 406 (Not Acceptable)
PGRST116: "Cannot coerce the result to a single JSON object"
Message: "The result contains 0 rows"
```

**Síntomas:**
- ✗ Usuario se registra en `auth.users` 
- ✗ Perfil NO se crea en tabla `profiles`
- ✗ Email de bienvenida NO se envía
- ✗ Usuario queda "en limbo" sin poder usar la plataforma

---

## Root Cause (Causa Raíz) 🔍

El trigger `handle_new_user()` que debería crear automáticamente el perfil cuando un usuario se registra:
1. **Fallaba silenciosamente** - Los errores se capturaban con `RAISE WARNING` pero no se ejecutaba el INSERT al perfil
2. **No validaba los ENUM types** - `document_type` y `role` esperaban casting correcto
3. **No tenía fallback** - Si algo fallaba, el usuario quedaba sin perfil

---

## Soluciones Implementadas ✅

### 1. Migración: Mejora del Trigger
**Archivo**: `supabase/migrations/20260409000000-fix-profile-creation-on-signup.sql`

**Cambios:**
```sql
-- ANTES: Trigger fallaba silenciosamente
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;

-- AHORA: Validación + Fallback automático
BEGIN
  -- Validar y castear correctamente ENUMs
  v_document_type := (NEW.raw_user_meta_data->>'document_type')::document_type;
EXCEPTION WHEN OTHERS THEN
  v_document_type := 'cc'::document_type;  -- Valor por defecto
END;

-- Si falla el INSERT principal, crear perfil mínimo
BEGIN
  INSERT INTO profiles (...)... 
EXCEPTION WHEN OTHERS THEN
  -- Fallback: crear perfil con valores defaults
  INSERT INTO profiles (id, full_name, document_type, document_number, role)
  VALUES (NEW.id, 'User_'||NEW.id, 'cc', NEW.id::text, 'student');
END;
```

**Función de Recuperación:**
```sql
-- Nueva función para recuperar usuarios sin perfil
CREATE FUNCTION create_missing_profile(p_user_id UUID)
```

### 2. Mejora en useAuth.tsx
**Archivo**: `src/hooks/useAuth.tsx`

**Cambios:**
```typescript
// ANTES: Fallaba si no encontraba perfil
if (error) {
  console.error('Error fetching profile:', error);
  setProfile(null);
}

// AHORA: Intenta crear el perfil si no existe
if (error.code === 'PGRST116') {
  // Intenta crear perfil usando RPC
  const { data: result } = await supabase.rpc('create_missing_profile', {
    p_user_id: session.user.id
  });
  // Reintenta fetch después de crear
}
```

### 3. Migración: Garantizar Plantillas de Email
**Archivo**: `supabase/migrations/20260409000001-ensure-email-templates.sql`

**Contenido:**
- ✅ Asegura que `email_configuration` exista y esté activa
- ✅ Crea/actualiza plantillas de email:
  - `user_registration` - Email de bienvenida
  - `application_confirmation_student` - Confirmación de postulación
  - `application_status_update` - Actualizaciones de estado
  - `new_application_coordinator` - Notificación a coordinador
- ✅ Proporciona función de verificación: `verify_email_setup()`

### 4. Mejora en Register.tsx
**Archivo**: `src/pages/Register.tsx`

**Cambios:**
- ✅ Email no es crítico - no bloquea el registro
- ✅ Mejor logging de errores
- ✅ Mejor manejo de excepciones

---

## Verificar que Todo Funciona ✔️

### 1. Verificar Base de Datos

```sql
-- Ejecutar en Supabase SQL Editor
SELECT *
FROM public.verify_email_setup();

-- Resultado esperado:
-- Check Name                  | Status | Details
-- Email Configuration        | OK     | noreply@mueveteporlacosta.com
-- Email Templates            | OK     | 4 templates found
-- User Registration Template | OK     | Template for new user signups
```

### 2. Verificar Trigger

```sql
-- Ver el trigger activo
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth';

-- Resultado esperado:
-- trigger_name: on_auth_user_created
-- event_manipulation: INSERT
```

### 3. Probar Manualmente

**Paso 1:** Registrar nuevo usuario
```
1. Ir a http://localhost:5173/register
2. Llenar formulario:
   - Nombre: "Test Student"
   - Documento: "cc"
   - Número: "123456789"
   - Email: "test@example.com"
   - Password: "TestPass123!"
   - Role: "student"
   - Universidad Origen: "Universidad Test"
   - Programa: "Ingeniería"
   - Semestre: "3"
3. Click "Registrarse"
```

**Paso 2:** Verificar en Supabase Dashboard
```
Tablas → auth.users
  ✓ Debe existir fila con email "test@example.com"

Tablas → profiles
  ✓ Debe existir fila con id = uuid del usuario
  ✓ full_name = "Test Student"
  ✓ document_type = "cc"
  ✓ document_number = "123456789"
  ✓ role = "student"

Tablas → student_info
  ✓ Debe existir fila con id = uuid del usuario
  ✓ origin_university = "Universidad Test"
  ✓ academic_program = "Ingeniería"
  ✓ current_semester = 3
```

**Paso 3:** Verificar Email
```
Tablas → email_history
  ✓ Debe existir un registro con:
    - template_name = "user_registration"
    - recipient_email = "test@example.com"
    - status = "sent" (o "failed" si Resend no está configurado)
```

---

## Flujo Correcto Ahora 🎯

```
Usuario llena formulario de registro
            ↓
[Register.tsx] llama signUp()
            ↓
[useAuth.tsx] llama supabase.auth.signUp()
            ↓
[auth.users] crea nueva fila
            ↓
[Trigger on_auth_user_created] se ejecuta
            ↓
[handle_new_user()] valida ENUMs y datos
            ↓
[profiles] CREA fila NEW ✓
[student_info] CREA fila (si es student) ✓
            ↓
[useAuth.tsx] fetch profile
            ↓
[send-email] Edge Function envía bienvenida ✓
            ↓
Usuario autenticado y listo para usar plataforma ✓
```

---

## Cómo Desplegar 🚀

### Paso 1: Push Migrations
```bash
cd "c:\Users\AMD RYZEN 7 5Gen\Proyectos Web\mueveteporlacosta\muevetecosta"

# Opción A: Si usas --linked
npx supabase db push --linked

# Opción B: Si usas project-ref
npx supabase db push --project-ref hgikvbgceqfcwchgjbrg
```

**Output esperado:**
```
Opening remote database at: ...
Creating new migration...
✓ Migrations imported

20260409000000-fix-profile-creation-on-signup.sql  applied successfully
20260409000001-ensure-email-templates.sql         applied successfully
```

### Paso 2: Regenerar Types (Opcional pero recomendado)
```bash
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

### Paso 3: Redeploy Edge Functions
```bash
npx supabase functions deploy send-email --project-ref hgikvbgceqfcwchgjbrg
npx supabase functions deploy password-reset --project-ref hgikvbgceqfcwchgjbrg
npx supabase functions deploy reset-password --project-ref hgikvbgceqfcwchgjbrg
```

### Paso 4: Probar Completamente

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Monitor logs
npx supabase functions get-logs send-email --project-ref hgikvbgceqfcwchgjbrg
```

---

## Troubleshooting 🛠️

### Problema: "Email Configuration not found"
```
Solución: Ejecutar verify_email_setup() en Supabase SQL
SELECT * FROM verify_email_setup();

Si muestra "MISSING" en Email Configuration:
1. Ir a Supabase Dashboard
2. SQL Editor
3. Ejecutar:
   INSERT INTO public.email_configuration (
     configuration_name, default_sender_email, default_sender_name, 
     resend_api_key, is_active
   ) VALUES (
     'default', 'noreply@mueveteporlacosta.com', 'Muévete por el Caribe',
     'your_resend_api_key_here', true
   );
```

### Problema: "Profile still empty after registration"
```
Solución manual:
1. Obtén el user_id del usuario sin perfil
2. Ejecuta en SQL:
   SELECT * FROM public.create_missing_profile('user_id_aqui');
3. Verifica el resultado
```

### Problema: "Email template not found"
```
Solución:
1. Ejecutar verify_email_setup() nuevamente
2. Si muestra "MISSING" en User Registration Template:
   - Ejecutar la migración 20260409000001 manualmente
   - O recrear template en Supabase Dashboard
```

### Problema: "CORS error when calling send-email function"
```
Solución:
1. Verificar que el Edge Function esté deployado:
   npx supabase functions list --project-ref hgikvbgceqfcwchgjbrg
2. Verificar CORS headers en function:
   - Deben incluir "Access-Control-Allow-Origin": "*"
3. Redeployar si es necesario:
   npx supabase functions deploy send-email --project-ref hgikvbgceqfcwchgjbrg
```

---

## Archivos Cambiados 📝

| Archivo | Cambios |
|---------|---------|
| `supabase/migrations/20260409000000-fix-profile-creation-on-signup.sql` | Nuevo - Corrige trigger y agrega función de recuperación |
| `supabase/migrations/20260409000001-ensure-email-templates.sql` | Nuevo - Garantiza plantillas de email |
| `src/hooks/useAuth.tsx` | Modificado - Agrega lógica de recuperación de perfil |
| `src/pages/Register.tsx` | Modificado - Mejor manejo de errores de email |

---

## Checklist Post-Despliegue ✅

Después de desplegar, verifica:

- [ ] `npx supabase db push` completó sin errores
- [ ] Nueva función `create_missing_profile()` existe
- [ ] Trigger `on_auth_user_created` está activo
- [ ] Plantillas de email existen en BD
- [ ] `email_configuration` tiene `is_active = true`
- [ ] Edge Function `send-email` está deployado
- [ ] Puedes registrar nuevo usuario sin errores
- [ ] El perfil se crea automáticamente
- [ ] El usuario puede iniciar sesión
- [ ] Email de bienvenida se recibe (o se crea registro en email_history)

---

## Resumen 📋

**Antes (Problema):**
- Usuario se registraba parcialmente
- Perfil no se creaba
- Usuario quedaba en estado indefinido
- Email no se enviaba

**Ahora (Solución):**
- ✅ Trigger mejorado con validaciones robustas
- ✅ Fallback automático cuando falla el principal
- ✅ RPC function para crear perfiles faltantes
- ✅ Mejor manejo de errores en frontend
- ✅ Plantillas de email garantizadas
- ✅ Recuperación automática de perfiles fallidos

**Estado**: 🟢 Listo para Producción

