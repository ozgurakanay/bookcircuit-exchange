# Turtle Turning Pages

A community platform for book trading and connecting readers in your local area.

## Project Overview

Turtle Turning Pages helps users exchange books with others nearby. The platform enables users to:

- Add books to their personal collection
- Find books by title, author, or location
- Chat with other users to arrange exchanges
- Build a reader profile
- Discover books within a specific geographic radius

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, PostGIS, Auth, Storage)
- **Map & Location**: Google Maps API

## Getting Started

### Prerequisites

- Node.js & npm
- A Supabase account and project
- Google Maps API key

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and add your API keys:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Visit `http://localhost:8080`

## Features

- **User Authentication**: Sign up, sign in, and profile management
- **Book Management**: Add, edit, and remove books from your collection
- **Book Discovery**: Search by title, author, or location with radius filtering
- **Chat System**: Real-time messaging between users
- **Book Requests**: Request books and manage request status
- **Blog**: Articles about book trading and community building

## Supabase Setup

The `supabase/migrations/` directory contains SQL scripts for setting up:

- User authentication
- Profiles table
- Books table with PostGIS integration
- Chat functionality
- Book requests system
- Blog system
- Storage buckets for avatars and book covers