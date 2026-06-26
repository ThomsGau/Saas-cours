# Context — Projet SaaS Cours (Backend + Frontend)

> **Dernière mise à jour :** 25 juin 2026  
> **État du projet :** Backend terminé · Frontend terminé (Étapes 1 à 5)  
> **Prochaines évolutions possibles :** `GET /api/users/me`, seed data, dashboard admin, suivi de progression réel

---

## 1. Vue d'ensemble du projet

Plateforme **B2B2C** de cours en ligne et de réservation de sessions privées.

| Modèle économique | Description |
|---|---|
| **Abonnement** | Accès au catalogue (vidéos, PDFs) via Stripe Subscription |
| **Cours privés** | Paiement à l'acte + réservation de créneaux instructeur |

**Architecture globale : API-first, client pur**

```
┌─────────────────────┐         JWT Bearer          ┌──────────────────────────┐
│  Frontend Next.js   │  ◄──────────────────────►  │  Backend Spring Boot     │
│  localhost:3000     │   http://localhost:8080/api │  localhost:8080          │
└─────────────────────┘                             └────────────┬─────────────┘
                                                                   │
                                                          ┌────────▼─────────┐
                                                          │  PostgreSQL 16   │
                                                          │  (Docker :5433)  │
                                                          └──────────────────┘
                                                                   │
                                                          ┌────────▼─────────┐
                                                          │  Stripe          │
                                                          │  (Checkout + WH) │
                                                          └──────────────────┘
```

**Structure du dépôt :**

```
Saas-cours/
├── context.md                 # Ce fichier
├── backend/                   # API Spring Boot
│   ├── pom.xml
│   ├── docker-compose.yml
│   └── src/main/java/...
└── frontend/                  # Client Next.js 14
    ├── package.json
    ├── .env.local
    └── src/
```

---

## 2. Backend — Récapitulatif complet

### 2.1 Stack technique

| Composant | Version / Choix |
|---|---|
| Langage | Java 21 |
| Framework | Spring Boot 3.4.1 |
| Build | Maven 3.9.14 (`C:\Tools\apache-maven-3.9.14`) |
| Persistence | Spring Data JPA + Hibernate |
| Base de données | PostgreSQL 16 (Docker) |
| Sécurité | Spring Security 6 + JWT stateless (JJWT 0.12.6) |
| Validation | Jakarta Validation |
| Paiements | Stripe Java SDK 28.3.0 |
| Boilerplate | Lombok |
| Tests | JUnit 5 + H2 (profil `test`) |

### 2.2 Organisation des packages Java

```
com.saas.cours
├── SaasCoursApplication.java
├── config/          # SecurityConfig, JwtProperties, StripeProperties, StripeConfig
├── domain/          # Entités JPA + BaseEntity + enums
├── repository/      # Spring Data JPA
├── service/         # Logique métier
├── controller/      # REST + DTOs (controller.dto)
├── security/        # JwtService, JwtAuthenticationFilter, UserPrincipal, CurrentUserService
└── exception/       # GlobalExceptionHandler, exceptions métier
```

### 2.3 Modèle de données (JPA)

#### Entités

| Entité | Table | Champs clés |
|---|---|---|
| `User` | `users` | email, password (BCrypt), role, stripeCustomerId, subscriptionStatus |
| `Course` | `courses` | title, description, published, instructor (FK User) |
| `Lesson` | `lessons` | title, lessonType (VIDEO/PDF), contentUrl, position, course (FK) |
| `AvailabilitySlot` | `availability_slots` | instructor, startAt, durationMinutes, booked |
| `PrivateSession` | `private_sessions` | instructor, student, scheduledAt, durationMinutes, status, order (FK) |
| `Order` | `orders` | user, orderType, status, amountCents, currency, stripeCheckoutSessionId, stripePaymentIntentId |

#### Énumérations

| Enum | Valeurs |
|---|---|
| `Role` | STUDENT, INSTRUCTOR, ADMIN |
| `SubscriptionStatus` | NONE, ACTIVE, PAST_DUE, CANCELLED, EXPIRED |
| `LessonType` | VIDEO, PDF |
| `SessionStatus` | REQUESTED, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW |
| `OrderType` | SUBSCRIPTION, PRIVATE_SESSION |
| `OrderStatus` | PENDING, PAID, FAILED, REFUNDED, CANCELLED |

#### Relations principales

- `User` 1→N `Course` (instructeur)
- `Course` 1→N `Lesson`
- `User` 1→N `PrivateSession` (instructeur et élève)
- `User` 1→N `Order`
- `PrivateSession` 0→1 `Order`
- `AvailabilitySlot` → réservation → `PrivateSession` (statut REQUESTED, puis CONFIRMED après paiement)

### 2.4 Sécurité backend

- **Stateless** : `SessionCreationPolicy.STATELESS`, CSRF désactivé
- **Endpoints publics :** `/api/auth/**`, `/api/webhooks/stripe`, `OPTIONS /**`
- **Tout le reste :** JWT obligatoire (`Authorization: Bearer {token}`)
- **Filtre :** `JwtAuthenticationFilter` (extraction email, validation, SecurityContext)
- **Mot de passe :** `BCryptPasswordEncoder`
- **Inscription :** rôle par défaut `STUDENT` ; `ADMIN` interdit à l'inscription

### 2.5 Configuration (`backend/src/main/resources/application.yml`)

```yaml
server.port: 8080
spring.datasource.url: jdbc:postgresql://localhost:5433/saas_cours
spring.jpa.hibernate.ddl-auto: update

app.jwt.secret: ${JWT_SECRET:...}
app.jwt.expiration-ms: 86400000

app.stripe.api-key: ${STRIPE_API_KEY:sk_test_change_me}
app.stripe.webhook-secret: ${STRIPE_WEBHOOK_SECRET:whsec_change_me}
app.stripe.success-url: http://localhost:3000/payment/success
app.stripe.cancel-url: http://localhost:3000/payment/cancel
app.stripe.subscription-price-id: ${STRIPE_SUBSCRIPTION_PRICE_ID:price_change_me}
app.stripe.private-session-price-cents: 5000
```

> **Note dev Windows :** PostgreSQL Docker écoute sur le port **5433** (et non 5432) pour éviter le conflit avec une instance PostgreSQL locale déjà installée sur la machine.

### 2.6 Docker PostgreSQL

```powershell
cd backend
docker compose up -d    # Démarrer
docker compose down     # Arrêter
docker compose down -v  # Arrêter + supprimer les données
```

| Paramètre | Valeur |
|---|---|
| Host | `localhost:5433` |
| Base | `saas_cours` |
| User / Password | `saas` / `saas` |
| Conteneur | `saas-cours-postgres` |

### 2.7 Endpoints REST backend (tous préfixés `/api`)

#### Auth (public)

| Méthode | URL | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Non | Inscription (201) |
| `POST` | `/auth/login` | Non | Connexion → JWT |

**Réponse auth (`AuthResponse`) :**
```json
{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "email": "user@example.com",
  "role": "STUDENT"
}
```

#### Catalogue (JWT + abonnement `ACTIVE`)

| Méthode | URL | Description |
|---|---|---|
| `GET` | `/catalog/courses` | Liste cours publiés |
| `GET` | `/catalog/courses/{courseId}` | Détail + leçons |
| `GET` | `/catalog/courses/{courseId}/lessons/{lessonId}` | Une leçon |

> Sans abonnement actif → **403** (`SubscriptionRequiredException`)

#### Instructeurs & disponibilités (JWT)

| Méthode | URL | Rôle | Description |
|---|---|---|---|
| `GET` | `/instructors` | Tous | Liste instructeurs |
| `GET` | `/instructors/{id}/availabilities` | Tous | Créneaux libres futurs |
| `POST` | `/me/instructor/availabilities` | INSTRUCTOR | Créer un créneau |
| `GET` | `/me/instructor/availabilities` | INSTRUCTOR | Mes créneaux |
| `DELETE` | `/me/instructor/availabilities/{slotId}` | INSTRUCTOR | Supprimer (si non réservé) |

#### Réservations (JWT)

| Méthode | URL | Rôle | Description |
|---|---|---|---|
| `POST` | `/bookings` | STUDENT | Réserver (`{ availabilitySlotId }`) |
| `GET` | `/bookings/me` | STUDENT | Mes réservations |
| `GET` | `/bookings/instructor/me` | INSTRUCTOR | Sessions reçues |

#### Paiements Stripe (JWT)

| Méthode | URL | Description |
|---|---|---|
| `POST` | `/payments/subscription/checkout` | Checkout abonnement |
| `POST` | `/payments/private-sessions/{id}/checkout` | Checkout session privée |

**Réponse checkout :**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "stripeSessionId": "cs_test_...",
  "orderId": 1
}
```

#### Webhook Stripe (public, sécurisé par signature)

| Méthode | URL | Description |
|---|---|---|
| `POST` | `/webhooks/stripe` | Événements Stripe |

**Événements gérés :**
- `checkout.session.completed` → Order PAID, subscription ACTIVE, session CONFIRMED
- `checkout.session.expired` → Order CANCELLED
- `customer.subscription.updated` → mise à jour `subscriptionStatus`
- `customer.subscription.deleted` → CANCELLED
- `invoice.payment_failed` → PAST_DUE

### 2.8 Lancement backend

```powershell
cd C:\Users\fuyu2\Documents\Saas\Saas-cours\backend
docker compose up -d
mvn spring-boot:run
```

Prérequis : **Docker Desktop** démarré, **Maven** dans le PATH (`MAVEN_HOME=C:\Tools\apache-maven-3.9.14`).

---

## 3. Frontend — Récapitulatif complet (Étapes 1 à 5)

### 3.1 Stack technique

| Composant | Version |
|---|---|
| Framework | Next.js 14.2.35 (App Router) |
| Langage | TypeScript 5 |
| UI | Tailwind CSS 3.4 + Shadcn UI 4.11 (style `base-nova`, Base UI) |
| HTTP Client | Axios 1.18 |
| Auth session | NextAuth.js 4.24 (`CredentialsProvider`) |
| Formulaires | react-hook-form 7.80 + Zod 4.4 |
| Toasts | Sonner 2.0 |
| Icônes | lucide-react |

### 3.2 Structure frontend

```
frontend/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── courses/page.tsx              # Catalogue
│   ├── courses/[id]/page.tsx         # Détail cours + leçons
│   ├── subscribe/page.tsx            # Abonnement Stripe
│   ├── booking/page.tsx              # Réservation session privée
│   ├── dashboard/page.tsx            # Tableau de bord
│   ├── payment/success/page.tsx
│   ├── payment/cancel/page.tsx
│   └── api/auth/[...nextauth]/route.ts
├── components/
│   ├── ui/                           # Shadcn (Button, Card, Form, Alert, Badge…)
│   ├── layout/                       # AppHeader, AppSidebar, AppShell
│   ├── auth/                         # LoginForm, RegisterForm, ApiAuthBridge
│   ├── catalog/                      # CourseCard, CourseList, VideoPlayer, LessonList…
│   ├── booking/                      # BookingContent
│   ├── dashboard/                    # StudentDashboard, InstructorDashboard…
│   ├── sessions/                     # PrivateSessionsList, SessionStatusBadge
│   └── providers.tsx
├── lib/
│   ├── api/                          # client, types, endpoints, services
│   ├── auth/                         # authOptions, getAuthSession
│   ├── catalog/                      # handle-catalog-error
│   ├── subscription/                 # check-subscription
│   └── format/                       # datetime, session-status
├── types/next-auth.d.ts
└── hooks/use-mobile.ts
```

### 3.3 Étape 1 — Initialisation & UI ✅

- Projet Next.js 14 avec TypeScript, Tailwind, App Router
- Shadcn UI (style `base-nova`)
- Layout mobile-first : `AppShell` = Sidebar offcanvas + Header sticky
- Navigation : `/`, `/courses`, `/booking`, `/dashboard`, `/login`, `/register`

### 3.4 Étape 2 — Service API & intercepteurs ✅

| Fichier | Rôle |
|---|---|
| `lib/api/config.ts` | `API_BASE_URL`, timeout |
| `lib/api/client.ts` | Axios + intercepteurs requête/réponse |
| `lib/api/token-store.ts` | Injection JWT |
| `lib/api/endpoints.ts` | Routes backend |
| `lib/api/types.ts` | Types TS alignés DTOs Java |
| `lib/api/errors.ts` | Classe `ApiError` |

### 3.5 Étape 3 — Authentification NextAuth + Backend JWT ✅

| Fichier | Rôle |
|---|---|
| `lib/auth/auth-options.ts` | `CredentialsProvider` → `POST /auth/login` |
| `components/auth/login-form.tsx` | Connexion |
| `components/auth/register-form.tsx` | Inscription + auto-login |
| `components/auth/api-auth-bridge.tsx` | JWT → intercepteur Axios |

**Session client :** `session.accessToken`, `session.user.email`, `session.user.role`

### 3.6 Étape 4 — Catalogue & abonnement ✅

| Page / composant | Rôle |
|---|---|
| `/courses` | Liste des cours (auth + gestion 403 → `/subscribe`) |
| `/courses/[id]` | Détail, liste leçons, lecteur vidéo / iframe PDF |
| `/subscribe` | Checkout abonnement Stripe |
| `/payment/success`, `/payment/cancel` | Retours Stripe |
| `catalog.service.ts` | `listCourses`, `getCourse`, `getLesson` |
| `handle-catalog-error.ts` | Redirect 401/403 centralisé |

**Stratégie abonnement (Option A) :** détection via erreur API 403, pas de `subscriptionStatus` dans la session NextAuth.

### 3.7 Étape 5 — Dashboard & réservation ✅

| Page / composant | Rôle |
|---|---|
| `/booking` | Élève : choix instructeur → créneaux → réservation → checkout Stripe |
| `/dashboard` | Vue rôle STUDENT ou INSTRUCTOR |
| `booking.service.ts` | `bookSlot`, `listMyBookings`, `listInstructorSessions` |
| `instructor.service.ts` | CRUD disponibilités, liste instructeurs |
| `payments.service.ts` | `createPrivateSessionCheckout` |

**Dashboard élève :**
- Carte abonnement (probe via accès catalogue)
- Progression (sessions confirmées / en attente)
- Liste réservations + bouton « Payer » si `REQUESTED`

**Dashboard instructeur :**
- Formulaire création de créneaux
- Liste créneaux (suppression si non réservés)
- Sessions reçues

### 3.8 Lancement frontend

```powershell
cd C:\Users\fuyu2\Documents\Saas\Saas-cours\frontend
npm run dev     # http://localhost:3000
npm run build   # Build production (validé OK)
```

---

## 4. État actuel — Ce qui fonctionne

| Domaine | Statut |
|---|---|
| Backend API REST complet | ✅ |
| PostgreSQL Docker (port 5433) | ✅ |
| Auth JWT backend | ✅ |
| Catalogue backend (abonnement ACTIVE) | ✅ |
| Disponibilités & réservations backend | ✅ |
| Stripe Checkout + Webhooks backend | ✅ |
| Frontend UI shell | ✅ |
| Frontend client API Axios + JWT | ✅ |
| Frontend auth NextAuth | ✅ |
| Frontend catalogue `/courses` | ✅ |
| Frontend abonnement `/subscribe` | ✅ |
| Frontend réservation `/booking` | ✅ |
| Frontend dashboard `/dashboard` | ✅ |

---

## 5. Flux utilisateur principaux

### 5.1 Abonnement catalogue

```
Login → /courses → (403 si pas abonné) → /subscribe → Stripe → webhook → /courses OK
```

### 5.2 Session privée

```
Instructeur : /dashboard → créer créneau
Élève : /booking → choisir instructeur → réserver → Stripe → webhook → session CONFIRMED
```

### 5.3 Données de test (SQL manuel)

```sql
-- Activer abonnement pour test
UPDATE users SET subscription_status = 'ACTIVE' WHERE email = 'eleve@example.com';

-- Insérer un cours de test (adapter instructor_id)
INSERT INTO courses (title, description, published, instructor_id, created_at, updated_at)
VALUES ('Intro Java', 'Cours de démarrage', true, 1, NOW(), NOW());
```

---

## 6. Lacunes connues & améliorations futures

| Sujet | Détail |
|---|---|
| `subscriptionStatus` absent de la session | Détecté via probe catalogue (403) ; ajouter `GET /api/users/me` recommandé |
| Progression cours | Compteur catalogue côté dashboard, pas de suivi leçon par leçon |
| Dashboard admin | Placeholder uniquement |
| Seed data / CRUD admin cours | Non implémenté (insertion SQL manuelle) |
| `middleware.ts` Next.js | Non utilisé ; guards côté client via `useSession` |

---

## 7. Commandes de relance rapide

```powershell
# Backend
cd C:\Users\fuyu2\Documents\Saas\Saas-cours\backend
docker compose up -d
mvn spring-boot:run

# Frontend
cd C:\Users\fuyu2\Documents\Saas\Saas-cours\frontend
npm run dev

# Stripe webhooks (dev)
stripe listen --forward-to localhost:8080/api/webhooks/stripe
```

---

## 8. Variables d'environnement

### Backend (env système ou IDE)

```
JWT_SECRET=...
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUBSCRIPTION_PRICE_ID=price_...
STRIPE_SUCCESS_URL=http://localhost:3000/payment/success
STRIPE_CANCEL_URL=http://localhost:3000/payment/cancel
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production-min-32-chars
```

### Outils locaux (Windows)

```
MAVEN_HOME=C:\Tools\apache-maven-3.9.14
PATH=%PATH%;%MAVEN_HOME%\bin
```

---

*Document de reprise de contexte pour le projet SaaS Cours.*
