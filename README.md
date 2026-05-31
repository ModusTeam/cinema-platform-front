<div align="center">
  <h1>Cinema Platform</h1>
  <p>Frontend Client. React 19 · TypeScript · Tailwind v4 · SignalR · Bun</p>
  <sub><a href="https://modusteam.github.io/cinema-platform-docs/">documentation</a> &ensp;·&ensp; <a href="https://github.com/stkossman/cinema-platform-back">backend repository</a></sub>
</div>

<br />

###### OVERVIEW

<sub>This repository contains the frontend client for the Cinema Management System. The codebase is maintained as a university coursework project and as an internship project. Its primary technical scope is client-side routing, feature isolation, server-state synchronization, authentication, and real-time booking consistency.</sub>

---

### Architecture & Stack

The application is a Vite single-page application with strict TypeScript settings and a feature-oriented source layout.

* **Runtime and build:** Bun, Vite 7, TypeScript 5
* **View layer:** React 19, React DOM
* **Routing:** React Router DOM 7
* **Server state:** TanStack Query 5
* **HTTP:** Axios 1.13.3
* **Real-time transport:** Microsoft SignalR
* **Forms and validation:** React Hook Form 7, Zod 4
* **Styling:** Tailwind CSS 4.1
* **Interface utilities:** Lucide React, Motion, Recharts, date-fns
* **Authentication support:** `jwt-decode` 4.0.0 and Axios bearer-token injection
* **Quality gates:** Biome 2.3.11
* **Deployment:** Vercel
---

### Technical Highlights

**Feature-Sliced Design**

The `src/features` directory acts as the main domain boundary. Feature modules own their API clients, hooks, models, and UI fragments to ensure strict isolation:

* `src/features/booking` encapsulates booking service calls, SignalR connection handling, query hooks, and seat-selection UI.
* `src/features/loyalty` manages loyalty adapters, mappers, dashboard components, and achievement contracts.
* `src/features/admin` contains administrative pages, service modules, hooks, and entity editor components.
* `src/pages` composes route-level screens. The router lazy-loads public and administrative routes, guarding the latter with an `AdminRoute` wrapper.

**Real-Time State Synchronization**

Seat locking implements a combined REST and SignalR workflow for data consistency:

1. The client invokes the REST endpoint `POST /seats/lock` when a seat is selected.
2. A SignalR connection opened via `ticketHub.startConnection(selectedSessionId)` listens for scoped `SeatLocked` and `SeatUnlocked` events.
3. Upon receiving an event, `useBooking` mutates the TanStack Query cache directly via `queryClient.setQueryData`, updating `occupiedSeatIds` without a full network refetch.
4. Remote lock conflicts with local selections are automatically resolved by removing the affected seat and dispatching a toast notification.

**Service Interoperability**

The frontend interacts with two backend domains: the primary .NET 8 REST API and the NestJS loyalty service. 

* Network boundaries are centralized through an Axios instance configured via `VITE_API_URL`.
* The interceptor architecture automatically attaches bearer tokens, retries rate-limited requests, and executes access token refreshes upon encountering `401 Unauthorized` responses.
* Core operations (`/sessions`, `/seats/lock`) and loyalty reads (`/account/loyalty`) share this unified client infrastructure.
* Cross-domain logic is handled during checkout: the booking payload transmits `useLoyaltyPoints` and `applyGoldUpgrade` flags, delegating final orchestration to the backend API.

**Administrative Operations**

Administrative features under the `/admin` scope provide comprehensive CRUD capabilities for cinema management. This includes hall structure editing, pricing rule generation, session scheduling, and loyalty system oversight. Mutating hooks are configured to invalidate stable TanStack Query keys, ensuring immediate UI reflection of administrative writes.

---

### Development Setup

Requires Bun. The repository uses `bun.lock` as the authoritative lockfile. Spaces are utilized for formatting in strict adherence to the Biome configuration.

```bash
git clone https://github.com/stkossman/cinema-platform-front.git
cd cinema-platform-front
bun install
```

Configure local environment variables (`.env`):

```bash
VITE_API_URL=https://yourapi.dev/api
```

Initialize the development server:

```bash
bun run dev
```

---

<sub>Licensed under the [MIT License](LICENSE)</sub>
