# Interview AI

Interview AI helps candidates prepare for job interviews with AI-generated reports tailored to their resume and a job description. It also includes a standalone AI chat for learning, career questions, and interview preparation.

## Features

- **AI interview reports:** Generate a personalized interview plan from a resume and job description, including a match score, technical and behavioral questions, skill gaps, and a preparation roadmap.
- **Standalone AI chat:** Ask questions on general topics or start a chat with context from an interview report.
- **Login and registration:** Create an account and access your own reports and chats.
- **Responsive UI:** Home, report, authentication, and chat pages adapt to desktop and mobile screens.

## Tech stack

- **Frontend:** React, React Router, SCSS, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **AI:** Google Gemini via the Google GenAI SDK

## Requirements

- Node.js and npm
- A MongoDB database
- A Google Gemini API key

## Setup

### Backend

1. Open a terminal in the `Backend` directory:

   ```bash
   cd Backend
   npm install
   ```

2. Create a `Backend/.env` file and set the following variables:

   | Variable | Purpose |
   | --- | --- |
   | `MONGODB_URI` | MongoDB connection URI |
   | `JWT_SECRET` | Secret used to sign and verify authentication tokens |
   | `GOOGLE_GENAI_API_KEY` | Google Gemini API key |

3. Start the backend:

   ```bash
   npm run dev
   ```

   The server listens on port **3000**.

### Frontend

1. Open another terminal in the `Frontend` directory:

   ```bash
   cd Frontend
   npm install
   ```

2. Start the Vite development server:

   ```bash
   npm run dev
   ```

   Vite uses port **5173** by default.

3. To create a production build:

   ```bash
   npm run build
   ```

## Origin

This project started from a YouTube tutorial; I independently added the navbar, AI chat page, and responsive layout.
