# 🔐 SecureSignal – Anonymous Crime Reporting Platform

SecureSignal is a secure, AI-powered web application that enables users to report crimes anonymously. It provides an end-to-end encrypted system where users can submit incident details, upload media, and track reports using a unique Report ID — all while preserving their identity. Admins can review, manage, and act on submitted reports through a dedicated dashboard.

---

## 🌟 Features

- Anonymous report submission (with image upload)
- AI-generated summaries using Gemini API
- Unique Report ID for tracking
- Admin login/signup with dashboard
- Status updates: Submitted, In Review, Resolved
- JWT-based authentication
- Prisma ORM + MongoDB integration

---

## 🛠 Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS  
- **Backend**: Node.js, Express.js, Prisma ORM  
- **Database**: MongoDB (via Prisma adapter)  
- **AI**: Gemini API (for report/image summarization)  
- **Auth**: JWT for secure login/signup  
- **Deployment**: Vercel (frontend), Render/Railway (backend)

---

## 🚀 Pages & Components

- **Home Page** with Hero section and navigation
- **Submit Report**: Form with title, description, location, type, media upload, anonymity toggle
- **Track Report**: Input Report ID to fetch status and details
- **How It Works**: 4-step explanation of secure reporting process
- **Admin Dashboard**: Protected panel with filters, status updates, and summaries
- **Login/Signup**: Role-based access for admin control

---

⚙️ Setup Instructions
🧩 Install Dependencies
```bash
# Backend
cd backend
npm install
```

# Frontend
```bash
cd ../frontend
npm install
```
🔐 Environment Variables
📁 /backend/.env
```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

🚀 Run Locally

# Backend
```bash
cd backend
npm run dev
```

# Frontend
```bash
cd ../frontend
npm run dev
```


📄 License
This project is licensed under the MIT License.

🙋‍♀️ Author
Zinal Shah – Full Stack Developer
