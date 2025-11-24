# Sistema de Gestión de Torneos - FPTM
## Federación Puertorriqueña de Tenis de Mesa

Última actualización: 24 de noviembre de 2025

---

## 📋 ESTADO ACTUAL DEL PROYECTO

### ✅ COMPLETADO

#### 1. **Branding FPTM**
- ✅ Nombre actualizado: "FPTM - Federación PR"
- ✅ Roles renombrados a español:
  - `owner` → Propietario
  - `admin` → Administrador  
  - `arbitro` → Árbitro (antes referee)
  - `jugador` → Jugador (antes player)
  - `publico` → Público (antes public)
- ✅ Toda la interfaz en español
- ✅ Datos de ejemplo (seed data) en español

#### 2. **Arquitectura Base**
- ✅ Frontend: React + Wouter + TanStack Query + Tailwind CSS
- ✅ Backend: Express + MemStorage (in-memory)
- ✅ Schema definido: Drizzle ORM para PostgreSQL (preparado para migración)
- ✅ APIs funcionando: `/api/tournaments`, `/api/rankings`
- ✅ Sistema de rutas con sidebar navegable

#### 3. **Componentes CRÍTICOS Creados**
- ✅ **BirthYearValidation Component** (`client/src/components/birth-year-validation.tsx`)
  - Validación de año de nacimiento de 4 dígitos
  - Confirmación visual con CheckCircle/XCircle
  - Tracking de intentos por jugador
  - Auto-confirmación cuando todos validan
  - ✅ **INTEGRADO** en página de scoring de partidos

#### 4. **Sistema de Scoring de Partidos** ⭐ NUEVO
- ✅ **Dashboard de Árbitro** (`/arbitro`)
  - ⭐ **Diseño actualizado** con estilo del mockup FPRTM:
    - Stat cards con gradiente azul (#1e3a8a → #3b82f6)
    - Partidos en grid cards responsive
    - Hover effects con transform y sombras
    - Badges con colores específicos (azul/verde/gris)
    - Título con borde azul inferior (3px)
  - Muestra todos los partidos disponibles (pendientes y completados)
  - Estadísticas en tiempo real
  - Navegación rápida a scoring
- ✅ **Página de Scoring** (`/arbitro/match/:matchId`)
  - Formulario de sets (hasta 5 sets, 11+ puntos, diferencia de 2)
  - Validación automática de reglas de tenis de mesa
  - Resumen visual del resultado
  - **Validación dual de año de nacimiento** integrada (CRÍTICO)
  - Confirmación final solo después de validar identidad
- ✅ **Sistema de Rating Automático (ELO)**
  - K-factor: 32
  - Fórmula: `Expected = 1 / (1 + 10^((opponentRating - playerRating)/400))`
  - Cambio: `K * (Actual - Expected)`
  - Actualización automática al confirmar partido
  - Historial completo guardado en `ratingHistory`
- ✅ **APIs Backend**
  - `GET /api/matches/arbitro` - Todos los partidos con players y tournament
  - `GET /api/matches/:id` - Partido específico con detalles completos
  - `POST /api/matches/:id/result` - Guardar resultado y actualizar ratings
- ✅ **Datos Seed**
  - 2 partidos de ejemplo (Carlos vs María, José vs Ana)
  - 5 jugadores con ratings (1850-1745)
- ✅ **Testing E2E**
  - Test completo verificado exitosamente
  - Flujo: Dashboard → Scoring → Validación → Confirmación → Ratings actualizados
  - Carlos Rivera: 1850 → 1865 (+15)
  - María González: 1820 → 1805 (-15)

**Nota sobre Autenticación:**
- Actualmente, `/api/matches/arbitro` devuelve **todos** los partidos del sistema
- Para producción, se implementará filtrado por árbitro autenticado (Firebase Auth)
- Estructura preparada para agregar `refereeId` filtering cuando se integre autenticación

#### 5. **Firebase Setup**
- ✅ Firebase configurado (`client/src/lib/firebase.ts`)
- ✅ Firestore helpers creados (`client/src/lib/firestore-helpers.ts`)
- ✅ Secrets configurados: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc.
- ⚠️ **NO INTEGRADO** aún (por recomendación del arquitecto)

---

## 🎯 FEATURES FPTM REQUERIDAS

### 🔴 PRIORIDAD CRÍTICA

1. **✅ Validación de Año de Nacimiento**
   - Componente creado ✅
   - Integración en scoring ✅
   - Testing E2E completado ✅

2. **⏳ Sistema de Pago ATH Móvil**
   - Código de 5 caracteres (mayúsculas/números)
   - Validación manual por admin
   - Estados: pending → verified/rejected
   - Schema: `paymentCode` y `paymentStatus` ya existen

3. **✅ Sistema de Rating FPTM**
   - Fórmula implementada: `newRating = oldRating + K * (S - E)`
   - K-factor: 32 (estándar ELO)
   - E (expected): `1 / (1 + 10^((opponentRating - playerRating)/400))`
   - S (score): 1 (victoria), 0 (derrota)
   - Actualización automática al completar partido
   - Historial completo en `ratingHistory` tabla
   - Testing verificado: ratings cambian correctamente

4. **⏳ Generación de Número de Miembro**
   - Formato: `PRTTM-000123`
   - Auto-incrementable
   - Función: `generateMemberNumber()` ya existe en storage.ts
   - ⚠️ Necesita Font: JetBrains Mono para display

### 🟡 PRIORIDAD ALTA

5. **⏳ Firebase Authentication**
   - Google Sign-In
   - Email/Password
   - Crear perfil en `users` collection al registrarse
   - Generar memberNumber automáticamente

6. **⏳ Gestión de Torneos**
   - Crear torneo (admin/owner)
   - Registro con pago ATH Móvil
   - Generación automática de brackets
   - Singles/Doubles support

7. **✅ Scoring de Partidos**
   - ✅ Interfaz para árbitro (`/arbitro`, `/arbitro/match/:matchId`)
   - ✅ **Validación dual de año de nacimiento** (CRÍTICO - implementado)
   - ✅ Actualización automática de rating (ELO K=32)
   - ✅ Dashboard con estadísticas
   - ⏳ Tracking de estadísticas avanzadas (pendiente)

### 🟢 PRIORIDAD MEDIA

8. **⏳ Dashboard por Rol**
   - Owner: Analytics, usuarios, configuración
   - Admin: Gestión torneos, usuarios, registros
   - Árbitro: Partidos asignados
   - Jugador: Mis partidos, perfil, estadísticas
   - Público: Ver torneos, rankings

9. **⏳ Rankings Públicos**
   - Top 100 jugadores
   - Filtros: género, categoría, club
   - Historial de rating

10. **⏳ Notificaciones**
    - Confirmación de registro
    - Asignación de partidos (árbitro)
    - Resultados de partidos
    - Cambios de rating

---

## 📁 ESTRUCTURA DE ARCHIVOS CLAVE

```
proyecto/
├── shared/
│   └── schema.ts              # Schema Drizzle + Types TypeScript
├── server/
│   ├── storage.ts             # IStorage interface + MemStorage
│   ├── routes.ts              # API routes
│   ├── seed-data.ts           # Datos de ejemplo
│   └── index-dev.ts           # Server entry point
├── client/src/
│   ├── pages/
│   │   ├── home.tsx           # Página de inicio
│   │   ├── tournaments.tsx    # Lista de torneos
│   │   ├── rankings.tsx       # Rankings de jugadores
│   │   └── arbitro/
│   │       ├── dashboard.tsx  # ⭐ Dashboard de árbitro
│   │       └── match-scoring.tsx  # ⭐ Scoring de partidos
│   ├── components/
│   │   ├── app-sidebar.tsx    # Navegación principal
│   │   └── birth-year-validation.tsx  # ⭐ Validación crítica
│   └── lib/
│       ├── firebase.ts        # Firebase config
│       └── firestore-helpers.ts  # Firestore CRUD helpers
└── attached_assets/
    └── Pasted-KEY-REQUIREMENTS-*.txt  # Documento de requisitos
```

---

## 🛠️ PRÓXIMOS PASOS RECOMENDADOS

### Fase 1: ✅ Features Críticas COMPLETADAS

1. **✅ Sistema de Scoring Completo**
   - ✅ Página `/arbitro/match/:id` creada y funcional
   - ✅ Formulario de scoring con sets/puntos (validación completa)
   - ✅ `<BirthYearValidation />` integrado antes de confirmar
   - ✅ Rating se actualiza automáticamente (ELO K=32)
   - ✅ Testing E2E exitoso

### Fase 1.5: Sistema ATH Móvil (PRÓXIMO)

2. **Sistema de Pago ATH Móvil**
   - Agregar campo en formulario de registro
   - Crear página `/admin/registrations` para verificar pagos
   - Estados: Pending (amarillo), Verified (verde), Rejected (rojo)

3. **✅ Sistema de Rating Automático - COMPLETADO**
   - ✅ Fórmula implementada en `storage.ts`
   - ✅ `updateMatchAndRatings()` calcula rating automáticamente
   - ✅ Crea entrada en `ratingHistory` por cada partido
   - ✅ Verificado con test E2E (Carlos +15, María -15)

### Fase 2: Firebase Authentication (2-3 días)

4. **Integrar Firebase Auth**
   - Crear `AuthProvider` context
   - Login/Register páginas
   - Proteger rutas por rol
   - Crear perfil automático al registrarse

5. **Sincronizar Users con Firestore**
   - Al hacer sign-up → crear documento en `users` collection
   - Generar memberNumber automáticamente
   - Membership status = "pending" inicial

### Fase 3: Gestión de Torneos (3-4 días)

6. **Crear Torneo (Admin/Owner)**
   - Formulario: nombre, tipo, categoría género, fecha, venue, cuota
   - Deadline de registro
   - Max participantes

7. **Registro a Torneo**
   - Lista de torneos abiertos
   - Formulario: jugador + código ATH Móvil
   - Doubles: seleccionar compañero

8. **Generación de Brackets**
   - Algoritmo de single-elimination
   - Asignar partidos a rounds
   - Asignar árbitros

### Fase 4: Dashboards & UX (2-3 días)

9. **Dashboard por Rol**
   - Owner: Analytics (total torneos, jugadores activos, ingresos)
   - Admin: Pending registrations, upcoming tournaments
   - Árbitro: Mis partidos asignados
   - Jugador: Próximos partidos, historial, estadísticas

10. **Polish & Testing**
    - Responsive design (móvil/tablet)
    - Loading states
    - Error handling
    - E2E testing con Playwright

---

## 🎨 DISEÑO Y ESTILO

### Fuentes
- **UI General:** Inter (default Tailwind)
- **Números de Miembro:** JetBrains Mono
- **Scores/Ratings:** JetBrains Mono

### Colores FPTM
- **Primary:** Azul FPTM (definir en `index.css`)
- **Accent:** Verde/Amarillo (definir en `index.css`)
- **Background:** Blanco/Gris claro
- **Dark Mode:** Soporte completo

### Componentes
- Shadcn UI (ya instalado)
- Lucide React icons
- Tailwind CSS utilities

---

## 🔧 DECISIONES ARQUITECTÓNICAS

### ¿Por qué MemStorage en lugar de Firestore YA?

**Recomendación del Arquitecto:**
1. **Estabilidad:** Sistema actual funciona, cambio completo genera interrupciones
2. **Features primero:** Implementar lógica FPTM (validación, pagos, rating) sobre arquitectura actual
3. **Migración iterativa:** Preparar adaptador Firestore, migrar colección por colección
4. **Testing:** Probar features con datos seed antes de conectar Firestore

**Plan de Migración Futura:**
1. Reforzar `IStorage` interface para soportar ambos backends
2. Crear `FirestoreStorage` implements `IStorage`
3. Migrar `users` collection primero (con Firebase Auth)
4. Migrar `tournaments`, `registrations`, `matches` gradualmente
5. Mantener seed data equivalente para desarrollo

---

## 📝 NOTAS IMPORTANTES

### Validación de Año de Nacimiento
- **CRÍTICO:** No permitir confirmar resultado sin validación dual
- Cada jugador ingresa su propio año de nacimiento
- Sistema valida contra perfil (tabla `users.birthYear`)
- Solo después de ambas validaciones → permitir "Confirmar Resultado"

### Sistema de Pago ATH Móvil
- Código de 5 caracteres (ej: "ABC12")
- Jugador ingresa código al registrarse
- Admin verifica manualmente (ve screenshot, confirma código)
- Estados: `pending` → `verified` ó `rejected`
- Solo jugadores con pago `verified` entran al bracket

### Número de Miembro PRTTM
- Formato: `PRTTM-000123` (siempre 6 dígitos)
- Auto-incrementable (empezando en 000001)
- Único por jugador
- Display con fuente monospace (JetBrains Mono)

---

## 🚀 CÓMO EJECUTAR

```bash
# Ya está corriendo - el workflow "Start application" ejecuta:
npm run dev

# Frontend: http://localhost:5000 (Vite)
# Backend: http://localhost:5000/api/* (Express)
```

### Datos de Ejemplo
- 5 usuarios: Carlos Rivera, María González, Luis Pérez, Ana Martínez, Jorge Sánchez
- 3 torneos: Abierto de Puerto Rico 2025, Copa Categoría Femenil, Torneo Nacional Juvenil
- Todos los jugadores tienen rol `jugador` y rating inicial 1000-1850

---

## 🆘 SOPORTE

### Issues Conocidos
- ✅ Rankings vacíos → Resuelto (filtro por rol "jugador")
- ✅ Roles en inglés → Resuelto (todos en español)
- ✅ Sistema de scoring → Completado (validación + ratings)
- ⏳ Firebase Auth no integrado (pendiente Fase 2)
- ⏳ Filtrado de partidos por árbitro autenticado (requiere Firebase Auth primero)

### Contacto
- Usuario: FPTM
- Proyecto: Sistema de Gestión de Torneos
- Stack: React + Express + Firestore (futuro)

---

**ÚLTIMAS REVISIONES ARQUITECTÓNICAS:**
- **24 nov 2025 09:00** - Arquitecto confirmó: mantener MemStorage, agregar features FPTM, migrar Firestore después
- **24 nov 2025 21:40** - Sistema de scoring completado y revisado:
  - ✅ Página de scoring funcional con validación de sets
  - ✅ BirthYearValidation integrado correctamente
  - ✅ Sistema ELO implementado y verificado
  - ✅ APIs y storage correctamente estructurados
  - ✅ Test E2E pasó exitosamente
  - ⚠️ Nota: Para producción, agregar autenticación y filtrado por árbitro
