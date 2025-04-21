# ForumX

A modern Reddit-inspired discussion platform with matrix theme option.

## Tech Stack

- React + TypeScript + Vite
- Tailwind
- Express.js backend with MongoDB
- Socket.io for real-time features

## Quick Start

```sh
# Frontend
git clone <repo-url>
npm install
npm run dev

# Backend
cd backend
npm install
# Set up .env (see below)
npm run dev
```

## Environment Setup

Create `.env` in `/backend`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=...
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```