# Changelog

## [Unreleased] - 2026-05-03

### Backend Architecture Redesign
- `[-]` Removed all existing legacy Supabase backend logic, schemas, validation, permissions, and database models.
- `[+]` Initialized a new Modular Service Architecture (Node.js, Express) completely decoupled from frontend logic.
- `[+]` Established strict Role-Based Access Control (RBAC) middleware to securely separate `SUPER_ADMIN`, `ADMIN`, `ORGANIZER`, and `ATHLETE` privileges.

### Database Models & Schema
- `[+]` Implemented a completely new production-ready PostgreSQL relational schema (`backend/src/database/schema.sql`).
- `[+]` Added structured tables including `users`, `events`, and `event_categories`.
- `[+]` Enforced data integrity across all tables using UUID primary keys, foreign key constraints, `created_at`/`updated_at` timestamps, and soft-delete support.
- `[+]` Included built-in audit logging (`audit_logs`) and database indexing for high performance.

### Organizer Event Creation Engine
- `[+]` Developed server-side API endpoints (`POST /api/events`, `GET /api/events/me`, `DELETE /api/events/:id`) to handle the complete event lifecycle.
- `[+]` Implemented strict ownership validation logic to guarantee organizers can ONLY modify or delete events they created.
- `[~]` Refactored frontend `OrganizerDashboard.tsx` data fetching and mutations. Migrated from direct `supabase.from('events')` calls to secure HTTP REST calls using `axios`.
- `[~]` Temporarily adapted the custom backend authentication middleware to securely decode and accept existing Supabase JWTs, allowing for API integration without needing to immediately redesign the frontend login flow.
