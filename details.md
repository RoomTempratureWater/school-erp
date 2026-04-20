# Project Documentation: Internal School Management System (ERP)

## 1. Project Overview
This repository contains a strictly internal, Multi-Page Application (MPA) designed for school administrative management. The system is built for high data integrity, secure access via Zero-Trust architecture, and efficient bulk data processing.

## 2. Technical Stack
* **Frontend/Backend:** Next.js (App Router) - Focused on Server Components and Server Actions (MPA Pattern).
* **Database:** PostgreSQL 16.
* **Object Storage:** Minio (S3-compatible) for PDF certificates and staff documents.
* **Network/Auth:** Cloudflare Tunnel (ZTNA). No local login; identity is extracted from Cloudflare headers.
* **ORM:** Drizzle or Prisma (Type-safe SQL).
* **Infrastructure:** Dockerized (Standalone builds for Next.js).

## 3. System Architecture & Networking
The system operates without open public ports. All ingress traffic is handled via a `cloudflared` container.

* **ZTNA Integration:** Cloudflare Access handles authentication. The app identifies the actor via the `Cf-Access-Authenticated-User-Email` header.
* **MPA Pattern:** Data is fetched directly in Server Components. Interactions are handled via Server Actions to ensure a traditional request-response flow with minimal client-side JavaScript.
* **Multi-Tenancy:** Horizontal scaling is achieved through siloed Docker stacks. Each institution runs its own isolated instance (App, DB, Minio) behind the same Cloudflare Tunnel gateway.

## 4. Project Structure
```text
/root-directory
├── .env                    # Deployment-specific credentials
├── docker-compose.yml       # Orchestrates the isolated stack
├── app/                     # Next.js Source Code
│   ├── src/app/             # Server Components & Actions
│   ├── drizzle/ or prisma/  # Schema & Migrations
│   └── Dockerfile           # Multi-stage standalone build
├── db/                      # Database Logic
│   └── init/                # SQL scripts for Postgres Triggers (Audit Logs)
└── volumes/                 # Local persistence (Git Ignored)
    ├── pgdata/              # Postgres data directory
    └── miniodata/           # Minio storage directory