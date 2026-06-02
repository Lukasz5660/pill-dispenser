# Pill Dispenser

This project contains a backend and database for managing pill dispensers, and a mobile frontend application to interact with it.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **[Docker](https://www.docker.com/products/docker-desktop/)** and **Docker Compose** (for running the backend and database)
- **[Node.js](https://nodejs.org/en) (v18+)** and **npm** (for running the mobile app)
- **[Expo Go](https://expo.dev/expo-go)** app installed on your physical mobile device, or a mobile emulator (iOS Simulator / Android Studio) setup on your computer.

---

## 1. Running the Backend and Database

The backend API and the PostgreSQL database are containerized using Docker. 

To start them:

1. Open a terminal.
2. Navigate to the `infra` directory of the project:
   ```bash
   cd infra
   ```
3. Start the services using Docker Compose:
   ```bash
   docker compose up --build
   ```

This will build the backend image, start the database, and run the backend API.
- The Backend API will be accessible at: `http://localhost:8000`
- The Database will be exposed on port `5432`.

---

## 2. Running the Mobile App (Frontend)

The frontend is a React Native mobile application built with Expo.

To run the mobile app:

1. Open a new terminal window.
2. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
3. Install the required Node.js dependencies:
   ```bash
   npm install
   ```
4. Start the Expo development server:
   ```bash
   npx expo start
   ```

A QR code will appear in your terminal. 
- **Physical Device:** Scan the QR code using the Expo Go app.
- **Emulator:** Press `i` to open it in the iOS Simulator, or `a` to open it in the Android Emulator.

> **Note on connecting to the Local Backend:**
> If you are running the app on a physical device, navigating to `frontend/app/index.tsx` and changing the `127.0.0.1` inside the `fetch()` call to your computer's local network IP address (e.g., `192.168.1.50`) is required. Emulators will generally work fine with `127.0.0.1` (iOS) or `10.0.2.2` (Android).

---

## 3. Running tests
Now, tests can be launched with installed pytest with commands
```bash
cd backend/tests
pytest *.py
```