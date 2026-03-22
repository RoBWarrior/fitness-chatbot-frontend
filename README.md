# Chatbot Frontend

This is the React + Vite frontend client for the specialized chatbot. It automatically pulls the active configured persona from the backend and adjusts its UI colors, titles, and greetings accordingly.

## Setup & Running

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install node dependencies**
   ```bash
   npm install
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```
   
4. **Open in Browser**
   Vite usually runs on `http://localhost:5173`. Open this URL in your browser.

> **Note**: This frontend proxies `/api` requests to `http://127.0.0.1:8000`. Ensure the FastAPI backend is currently running so that login, config, and chat endpoints function properly!
