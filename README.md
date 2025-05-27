# ✅ Katomaran Todo Task Management App

This is a full-stack **Todo Task Management Web Application** built using **React**, **Firebase**, and deployed on **Vercel**. It allows users to sign in via social login (Google), and perform full CRUD (Create, Read, Update, Delete) operations on personal tasks.

## 🚀 Features

- 🌐 Social login using **Google Authentication**
- 📋 Create, view, update, and delete tasks
- 📆 Organize tasks by day, importance, and planner view
- ✅ Mark tasks as complete
- 🔐 Secure authentication with Firebase
- 💾 Real-time task storage with Firestore (scoped per user)
- 📱 Responsive design for mobile and desktop
- 🌈 Clean, modern UI

---

## 🧑‍💻 Tech Stack

| Layer     | Technology            |
|-----------|------------------------|
| Frontend  | React.js               |
| Backend   | Firebase (Auth + DB)   |
| Database  | Firebase               |
| Hosting   | Vercel                 |
| Auth      | Firebase Google Sign-In|

---

## 🔄 Application Flow

1. User logs in using **Google Authentication**.
2. After login, they are directed to the **Dashboard** which includes:
   - *My Day*
   - *Important*
   - *Planner*
3. Users can **Add**, **Edit**, **Delete**, and **Mark Complete** any task.
4. All data is synced in real time using **Firebase**, isolated per user ID.

---

## 🧱 Architecture Diagram

![Architecture Diagram](https://drive.google.com/file/d/1IRN7utjy1q965V63VSOUnzMMbavqbBCh/view?usp=sharing)

---

## 📽️ Demo Video

🎥 [Watch the demo here on Loom](https://drive.google.com/file/d/16EopV8bDlnBqDVSOIYMIR7YmE0voeld5/view?usp=sharing)

---

## 📝 Assumptions

- Only **Google login** is implemented as part of the social login requirement, assuming it's sufficient for the hackathon.
- Tasks are scoped and retrieved based on the currently authenticated user via Firebase UID.
- Importance and Planner features are implemented as local task filters, not stored separately in the DB schema.

---

## 🛠️ Installation and Setup

```bash
# Clone the repo
git clone https://github.com/raccithas/todo-task-management

# Install dependencies
npm i

# Start the development server
npm start
