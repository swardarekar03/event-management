# NexEvent - Event Management System

NexEvent is a modern, premium Event Management System built with a React frontend (Vite) and an Express/Node.js backend with MongoDB.

This pull request implements a **Unified Login** system with **Organizer Database Separation & Auto-Redirection**.

## Key Features Implemented

### 1. Database Separation
- **Users (Attendees)**: Stored in the `User` collection.
- **Organizers**: Stored in the `Organizer` collection.
- Separate registration forms ensure appropriate business fields are captured (e.g., organization name, billing details, ID verification numbers for organizers).

### 2. Unified Login with Auto-Redirection
- **Unified Login Screen**: Attendees and Organizers both log in using the same main login form (`/login`).
- **Backend Auto-Detection**: The `/api/auth/login` endpoint automatically checks the `User` collection. If not found, it seamlessly queries the `Organizer` collection to authenticate credentials.
- **Dynamic Routing**: The response includes a `role` field (`"user"` or `"organizer"`), which the frontend stores in `localStorage` to route the logged-in session:
  - **Organizers** are redirected to the **Organizer Panel** (`/organizerpanel`).
  - **Attendees (Users)** are redirected to the **User Dashboard** (`/userDashboard`).

### 3. Dependency & Environment Fixes
- Resolved PostCSS/Tailwind configuration conflicts by ensuring proper localized packages are installed in the `frontend` directory.

---

## Getting Started

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your connection strings (e.g., `MONGODB_URI`, `PORT`, `JWT_SECRET`).
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
