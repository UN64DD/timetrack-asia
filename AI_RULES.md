# Time Track Solutions - Developer & AI Guide

This document is to help human developers and AI assistants understand the purpose and architecture of this codebase.

## 1. About the Project
**Time Track Solutions** is a modern event management platform tailored for sports events, especially running and ultra events. It allows organizers to publish events, users to register, and admins to manage the entire platform.

## 2. Technical Stack
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database & Auth**: Supabase
- **Routing**: React Router DOM
- **Scrolling**: Lenis Smooth Scroll

## 3. Roles and Environments
The app operates on different subdomains / routes depending on the user's role:
- **Root/Developer** (`developer.*`): Full system control, can ban users and edit roles.
- **Admin** (`admin.*`): Platform governance, event verification, and global disputes.
- **Organizer** (`organizer.*`): Creates events, manages tickets and runners.
- **Athlete** (Main site): Browses events, registers, pays, views results.

## 4. Coding Conventions
- **Component Structure**: Functional components with hooks.
- **Styling**: Use Tailwind utility classes. The design is "Neobrutalist", favoring high-contrast elements, uppercase bold headings, and distinct colors (Red/Blue/Purple) for different admin hubs.
- **State Management**: React context (`LanguageContext`, `NotificationContext`) for global states, and local state via `useState`.
- **Database Rules**: Only use Supabase's JS client. Do not create backend API routes; let Supabase handle data and Row Level Security (RLS).

## 5. Cleaning Up & Maintenance
- Remove unused imports (`lucide-react` icons are often over-imported).
- Remove dead code such as disabled firewalls or commented-out sections.
- Add TypeScript interfaces for new database structures. 
- Use standard Conventional Commits for Git (`feat:`, `fix:`, `chore:`, etc.).

## 6. How to Deploy to GitHub
1. Ensure no `.env` files with secret keys are tracked (they should be in `.gitignore`).
2. Verify all TypeScript errors are resolved by running `npm run lint`.
3. Build the app with `npm run build` to verify production readiness.
4. Push to the main branch.
