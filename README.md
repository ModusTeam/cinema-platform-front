# 🎬 Cinema Platform - Frontend

Modern, immersive web client for the Cinema Management System, developed as part of the **SoftServe Practice**. This application provides a premium user interface for booking tickets and a powerful dashboard for cinema administration.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=flat&logo=vite)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-06B6D4?style=flat&logo=tailwindcss)
![SignalR](https://img.shields.io/badge/SignalR-RealTime-512BD4?style=flat&logo=signalr)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=flat&logo=reactquery)
![Biome](https://img.shields.io/badge/Biome-Linting-FFC53D?style=flat&logo=biome)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green)

> **Backend:** Check out [cinema-platform-back](https://github.com/stkossman/cinema-platform-back) for the .NET 8 API.

---

## 🏗️ Architecture & Tech Stack

The project is built with **Performance** and **Type Safety** in mind, utilizing the latest React 19 features and feature-sliced architectural patterns.

| Layer | Technologies |
|---|---|
| **Core** | React 19, TypeScript, Vite, Bun |
| **State Management** | TanStack Query (Server State), Context API (Auth/UI), React Hooks |
| **Real-Time** | Microsoft SignalR (WebSockets) |
| **Styling** | Tailwind CSS **v4**, clsx, tailwind-merge, Lucide React (Icons) |
| **Forms & Validation** | React Hook Form + Zod |
| **Routing** | React Router DOM v7 |
| **Tooling** | Biome.js (Fast Linting & Formatting) |
| **Deployment** | Vercel (CI/CD) |

---

## ✨ Key Features

### 👤 For Customers (User Experience)
* **Immersive "Dark Fantasy" UI**: Premium aesthetic with glassmorphism, fluid animations, and "rolling text" effects.
* **Real-Time Booking**:
    * **Live Seat Locking**: See seats turning gray instantly when other users select them (powered by SignalR).
    * **Visual Hall Map**: Interactive SVG/Grid map with distinct seat types (Lux, Love Seats, Standard).
* **Digital Member Card**: Personal QR code and "Cinema Club" status in the profile.
* **Smart Navigation**: Full-screen overlay menu and "Fat Footer" with categorized information.
* **Dynamic Content**: Static pages (Rules, Tech, Privacy) rendered via a unified template system.

### 🛡️ For Administrators (Management Panel)
* **Visual Hall Builder**: Drag-and-drop style editor to construct cinema halls and assign seat types.
* **Pricing Matrix**: Advanced grid interface to set dynamic prices based on day of week and seat type.
* **Analytics Dashboard**: View user activity, ticket sales, and occupancy rates.
* **Content Management**: Full CRUD for Movies, Sessions, and Technologies.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* **Bun** (Recommended package manager)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/stkossman/cinema-platform-front.git
    cd cinema-platform-front
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory:
    ```env
    VITE_API_URL=your.url.com
    ```

4.  **Run the development server:**
    ```bash
    bun dev
    ```
    The app will run at `http://localhost:5173`.

---

## 🔧 Key Implementation Details

### Real-Time Seat Synchronization
The application uses **SignalR** to maintain consistency across all connected clients.
1.  When User A selects a seat, a WebSocket message is sent.
2.  The Backend broadcasts a `SeatLocked` event.
3.  User B's client receives the event and updates the React Query cache via `setQueryData`, instantly marking the seat as occupied without a page refresh.

### Feature-Sliced Design
Code is organized by **features** rather than technical layers. For example, `features/booking` contains:
- `components/SeatSelector.tsx` (UI)
- `hooks/useBooking.ts` (Logic & State)
This ensures that deleting a feature removes all associated code, keeping the project clean.

---

## 📜 License

This project is licensed under the **MIT License**.