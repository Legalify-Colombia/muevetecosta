# 🔐 Solución Completa: OTP Password Reset + Admin Management + Fixes de Autenticación

## 📋 Resumen de Cambios

Se ha implementado una solución completa para resolver los problemas de autenticación y agregado recuperación de contraseña con OTP (One-Time Password).

### ✅ Problemas Resueltos

1. **Coordinador no puede ingresar al portal** ✓
   - Arreglado el trigger `handle_new_user()` para crear perfiles correctamente
   - Creada función `update_user_role()` para actualizar roles de usuario
   
2. **Admin no se guarda con rol en profiles** ✓
   - Creada Edge Function `create-admin` para crear administradores correctamente
   - Agregada opción en UI de AdminDashboard para crear admins

3. **Implementar OTP para recuperación** ✓
   - Tabla `password_reset_codes` para almacenar códigos OTP
   - Funciones SQL: `generate_reset_code()`, `send_password_reset_email()`, `validate_reset_code()`
   - Edge Function `password-reset` para enviar OTP por Resend
   - Edge Function `reset-password` para validar código y cambiar contraseña
   - Página `PasswordRecovery.tsx` con flujo completo de 3 pasos

4. **Todos los correos con Resend** ✓
   - Plantillas de email en base de datos
   - Envío de bienvenida para coordinadores
   - Envío de códigos OTP para recuperación
   - Soporte para Resend en todas las funciones

---

## 🚀 Pasos de Despliegue

### Paso 1: Desplegar Migraciones SQL
```bash
cd "c:\Users\AMD RYZEN 7 5Gen\Proyectos Web\mueveteporlacosta\muevetecosta"
npx supabase db push --linked
```

Esto creará:
- Tabla `password_reset_codes`
- Funciones: `generate_reset_code()`, `send_password_reset_email()`, `validate_reset_code()`, `update_user_role()`
- Plantillas de email para OTP y reset success
- Políticas RLS

### Paso 2: Desplegar Edge Functions

#### 2.1 Desplegar función `password-reset`:
```bash
npx supabase functions deploy password-reset --project-ref hgikvbgceqfcwchgjbrg
```

#### 2.2 Desplegar función `reset-password`:
```bash
npx supabase functions deploy reset-password --project-ref hgikvbgceqfcwchgjbrg
```

#### 2.3 Desplegar función `create-admin`:
```bash
npx supabase functions deploy create-admin --project-ref hgikvbgceqfcwchgjbrg
```

### Paso 3: Verificar Configuración de Resend

En el panel de Supabase:
1. Ir a **Database** → **Browse Schemas** → **public** → **email_configuration**
2. Asegurarse que existe una fila con:
   - `is_active: true`
   - `resend_api_key: [tu API key de Resend]`
   - `default_sender_email: noreply@mueveteporlacosta.com.co`
   - `default_sender_name: Muévete por el Caribe`

---

## 📱 Flujos de Usuario

### Flujo 1: Crear Admin mediante UI
1. En AdminDashboard → Gestión de Usuarios
2. Click en botón "Crear Admin"
3. Completar formulario y enviar
4. El admin recibe email con credenciales temporales
5. Primer login con credenciales temporales, debe cambiar contraseña

### Flujo 2: Recuperar Contraseña (OTP)
1. En página de Login → "¿Olvidaste tu contraseña?"
2. Lleva a `/password-recovery`
3. Ingresar email → Se envía código OTP de 6 dígitos
4. Usar código + nueva contraseña para hacer reset
5. Email de confirmación enviado
6. Login con nueva contraseña

### Flujo 3: Coordinador Login
Ahora los coordinadores pueden ingresar directamente:
1. Login con email/contraseña
2. El sistema leyó el rol de la tabla profiles
3. Redirige al dashboard de coordinador

---

## 🔧 Archivos Creados/Modificados

### Nuevos Archivos

| Archivo | Descripción |
|---------|------------|
| `src/pages/PasswordRecovery.tsx` | Página de recuperación de contraseña con OTP |
| `src/hooks/usePasswordReset.tsx` | Hook para lógica de reset de contraseña |
| `src/hooks/useUserManagement.tsx` | Hook para actualizar roles de usuario |
| `supabase/functions/password-reset/index.ts` | Edge Function para enviar OTP |
| `supabase/functions/reset-password/index.ts` | Edge Function para validar y hacer reset |
| `supabase/functions/create-admin/index.ts` | Edge Function para crear administradores |
| `supabase/migrations/20250410000100-auth-fixes-otp.sql` | Migración con tablas y funciones SQL |
| `supabase/migrations/20250410000101-email-templates-otp.sql` | Migración con plantillas de email |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/UserManagement.tsx` | Agregado: botón "Crear Admin" + dialog + mutation |
| `src/pages/Login.tsx` | Reemplazado: botón "Olvidaste contraseña?" apunta a /password-recovery |
| `src/nav-items.tsx` | Agregada: ruta `/password-recovery` |

---

## 💻 Uso de las Edge Functions

### 1. Function: `password-reset` (Enviar OTP)

**Endpoint**: `supabase.functions.invoke('password-reset')`

**Request**:
```json
{
  "email": "usuario@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Se ha enviado un código a tu email",
  "email": "usuario@example.com"
}
```

### 2. Function: `reset-password` (Cambiar Contraseña)

**Endpoint**: `supabase.functions.invoke('reset-password')`

**Request**:
```json
{
  "code": "123456",
  "newPassword": "NuevaPassword123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password has been updated successfully"
}
```

### 3. Function: `create-admin` (Crear Administrador)

**Endpoint**: `supabase.functions.invoke('create-admin')`

**Request**:
```json
{
  "full_name": "Nombre Admin",
  "email": "admin@example.com",
  "document_number": "12345678",
  "phone": "+57 300 123 4567"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Administrator created successfully",
  "userId": "uuid-aqui",
  "email": "admin@example.com"
}
```

---

## 🧪 Test de Funcionalidad

### Test 1: OTP Password Reset
```javascript
// En consola del navegador
const { data, error } = await supabase.functions.invoke('password-reset', {
  body: { email: 'test@example.com' }
});
console.log(data); // Debería mostrar { success: true, ... }
```

### Test 2: Crear Admin desde UI
1. Ir a `/dashboard/admin`
2. Click en "Crear Admin"
3. Completar formulario
4. Verificar que se crea el usuario en Supabase 

### Test 3: Login de Coordinador
1. Crear un coordinador desde UI (Ya existe botón)
2. Esperar email con credenciales
3. Hacer login con esas credenciales
4. Verificar que redirige a dashboard de coordinador

---

## 📊 Base de Datos

### Tabla: `password_reset_codes`
```
- id: UUID (Primary Key)
- user_id: UUID (Reference auth.users)
- email: TEXT
- code: TEXT (6 dígitos UNIQUE)
- expires_at: TIMESTAMP (30 minutos de expiración)
- used_at: TIMESTAMP (NULL hasta que se use)
- created_at: TIMESTAMP
```

### Funciones SQL

#### `generate_reset_code()`
Genera un código de 6 dígitos aleatorio.

#### `send_password_reset_email(user_email TEXT)`
- Invalida códigos previos del usuario
- Genera nuevo código válido por 30 min
- Retorna { success, code, user_id }

#### `validate_reset_code(p_code TEXT)`
- Valida que el código existe y no ha expirado
- Marca como usado
- Retorna { success, user_id, email }

#### `update_user_role(p_user_id, p_new_role)`
- Solo admins pueden ejecutar
- Actualiza el rol en tabla profiles
- Retorna { success, message, new_role }

---

## 🚨 Consideraciones Importantes

### 1. Configuración de Resend
- Necesita API key válida en `email_configuration`
- Los emails se envían desde la dirección configurada
- Todos los plantillas usan Resend

### 2. Seguridad de OTP
- Códigos válidos solo por 30 minutos
- Cada nuevo request invalida códigos anterior
- Código se marca como usado después de usarse
- 6 dígitos numéricos (1 millón de combinaciones)

### 3. Permisos RLS
- Solo admins pueden usar `update_user_role()`
- Edge Functions tienen `SUPABASE_SERVICE_ROLE_KEY`
- `password_reset_codes` solo visible para service role

---

## 🐛 Troubleshooting

### Problema: "Coordinador no puede ingresar"
**Solución**: 
- Verificar que el perfil existe en tabla **profiles**
- Usar función `update_user_role()` para asignar role 'coordinator'
- Verificar que `email_verified_at` no está null en auth.users

### Problema: "Email OTP no llega"
**Solución**:
- Verificar `email_configuration` tiene `resend_api_key` válido
- Revisar **email_history** para ver si hay errores
- Probar con `npx supabase functions deploy password-reset --linked`

### Problema: "Login redirige a página inicial"
**Solución**:
- Verificar que el perfil existe en tabla **profiles**
- El perfil debe tener un role válido (admin, coordinator, professor, student)
- Usar SQL para verificar:
  ```sql
  SELECT id, full_name, role FROM profiles WHERE id = 'uuid-aqui';
  ```

---

## ✨ Resultado Final

Después de desplegar:
- ✅ Coordinadores pueden loguearse correctamente
- ✅ Admins se crean con rol correcto en profiles
- ✅ Recuperación de contraseña con OTP de 6 dígitos
- ✅ Página de recovery personalizada (no depende de Supabase)
- ✅ Todos los emails vía Resend
- ✅ UI mejorada en AdminDashboard para crear admins

---

## 📞 Próximos Pasos Recomendados

1. Desplegar las migraciones SQL
2. Desplegar las 3 Edge Functions
3. Verificar configuración de Resend
4. Hacer tests de creación de usuarios
5. Generar tipos TypeScript actualizados
6. Hacer deployment a producción

---

**Implementado en**: 2025-04-09
**Stack**: React + TypeScript + Supabase + Resend
**Todos los componentes funcionan con UTF-8 correcto** ✓
