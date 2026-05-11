
# Akmal TIK: Enterprise Student ID Card AI-Generator

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Express.js](https://img.shields.io/badge/Express.js-5.1-blue?style=for-the-badge&logo=express)
![Python](https://img.shields.io/badge/Python-3.x-yellow?style=for-the-badge&logo=python)
![PM2](https://img.shields.io/badge/PM2-Managed-green?style=for-the-badge&logo=pm2)

**Akmal TIK** is a high-performance, hybrid web application designed for academic institutions to automate the process of student identity card generation. Leveraging AI-powered background removal and an organized digital archive system, it streamlines the workflow from photo capture to bulk distribution.

---

## 🚀 Key Features

- **AI Background Removal**: Seamless background erasure using Python `rembg` with cross-platform support (Windows/Linux).
- **Dynamic ID Generation**: Real-time rendering of student ID cards with multiple templates support.
- **Enterprise File Manager**: Advanced gallery with hierarchical storage (`Year/Month/Program_Study`) for large-scale archiving.
- **Bulk Operations**: Intelligent ZIP export functionality for mass printing based on active search filters.
- **Universal Image Proxy**: Custom internal routing ensures image stability across local and production environments (avoiding CORS/Port issues).
- **Responsive Management**: Built with Framer Motion for a premium, smooth user experience.

---

## 🛠 Technology Stack

### Frontend & API Orchestration
- **Next.js 15 (App Router)**: Core framework for UI and Internal APIs.
- **Tailwind CSS & Framer Motion**: Aesthetic UI and micro-animations.
- **Lucide React**: High-quality vector iconography.

### Backend Services (Hybrid)
- **Express.js (Port 5000)**: Specialized worker server for heavy AI processing and static file serving.
- **Python (rembg)**: Underlying AI engine for background subtraction.
- **Multer**: High-speed multipart/form-data handling.

### Data & Storage
- **Prisma ORM**: Modern database management for student records.
- **Hierarchical File System**: Automated archiving on local/server storage.

---

## 📋 Prerequisites

Before installation, ensure you have the following installed:
- **Node.js**: v18.x or higher
- **Python**: 3.9+ (with `pip`)
- **Git**: For version control

---

## ⚙️ Installation & Setup

### 1. Clone & Dependencies
```bash
git clone https://github.com/AdrianNael/akmal-tik.git
cd akmal-tik
npm install
```

### 2. Python AI Setup
```bash
pip install rembg onnxruntime
```

### 3. Environment Configuration
Create a `.env` file in the root directory and configure your database and environment variables:
```env
DATABASE_URL="your_prisma_db_connection"
NEXTAUTH_SECRET="your_secret"
PORT=5000
```

### 4. Database Migration
```bash
npx prisma generate
npx prisma db push
```

---

## 🚀 Running the Application

### Development Mode
Runs both Next.js and the Express AI server simultaneously:
```bash
npm run dev
```

### Production Deployment (Linux/PM2)
```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
```

---

## 📂 Project Architecture

```text
akmal-tik/
├── app/                  # Next.js App Router (UI & Client APIs)
│   ├── api/              # Internal API Proxy & ZIP Services
│   └── gallery/          # File Manager Module
├── server/               # Express.js AI Worker Server
├── public/               # Static Assets
│   └── uploads/          # Hierarchical Data Archive (idcards/YYYY/MM/Prodi)
├── components/           # Reusable UI Components
├── prisma/               # Database Schema & Migrations
└── ecosystem.config.js   # PM2 Process Management
```

---

## 🔧 Troubleshooting & FAQ

**Q: Image not appearing in Gallery on Linux Server?**
**A:** Ensure the `Image Proxy` is active. The application uses internal routing to serve files from `public/uploads` via the Next.js API to bypass port-specific connection issues.

**Q: "rembg" command not found?**
**A:** Ensure Python is added to your PATH and `pip install rembg` was successful. On Linux, you might need to use `pip3`.

**Q: High CPU usage during processing?**
**A:** The AI processing is CPU-intensive. For production, ensure the server has at least 2GB of RAM.

---

## 📄 License
This project is proprietary and intended for internal use at **AdrianNael/akmal-tik**.

---
*Developed with ❤️ for Academic Excellence.*
