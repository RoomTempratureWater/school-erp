# Project Overview: Internal School Management System (MPA)

## 1. Technical Architecture & Constraints
This is a strictly internal **Multi-Page Application (MPA)** built for school management. The architecture prioritizes server-side logic and data integrity over client-side state.

* **Framework:** Next.js (App Router) utilizing **Server Components** for data fetching and **Server Actions** for all CRUD operations.
* **Deployment:** Fully Dockerized stack consisting of Next.js (Standalone mode), Postgres, and Minio.
* **Authentication:** Zero-trust model via **Cloudflare ZTNA**. The app will not have a login UI; user identity must be extracted from the `Cf-Access-Authenticated-User-Email` header.
* **Storage:** Minio (S3-compatible) for persistent storage of generated PDF certificates and staff documents.

---

## 2. Database & Audit Strategy
* **Persistence:** Postgres managed via Drizzle ORM or Prisma.
* **Automated Audit Trail:** A dedicated `audit_logs` table will record every **DML (INSERT, UPDATE, DELETE)** operation across all critical tables.
    * **Implementation:** This must be handled via **Postgres Triggers**.
    * **User Attribution:** The application must set a local transaction variable (e.g., `SET LOCAL school_app.user_email = '...'`) within each Server Action so the database trigger can capture the actor's identity from the Cloudflare header.

---

## 3. Core Functional Modules

### A. Fee Management (Accounting & Portability)
* **Features:** Filtered search (Standard, Division, Status), fee history ledgers, and PDF receipt generation.
* **Data Portability:** Server-side generation of CSV files based on active filters for offline accounting.
* **Data Entities:** `fee_categories`, `student_fees`, and `payment_transactions`.

### B. Admission & Records (Student Lifecycle)
* **Features:** Manual entry of student details into the master `students` table.
* **Certificate Engine:** * **Bonafide:** Generated on-demand via server-side PDF templates.
    * **Leaving Certificate (LC):** Generation triggers a status update for the student to "Inactive/Left."
* **Storage:** All generated PDFs are streamed to Minio with paths stored in the `certificates` table.

### C. Examination System (CSV Pipeline)
* **Features:** Creation of exam cycles tied to Academic Years and Standards.
* **Workflow:** 1.  **Export:** System generates a CSV template pre-populated with Student IDs and Names for specific subjects.
    2.  **Import:** Teachers upload the filled CSV; the server parses the file, validates the data, and performs a bulk `upsert` into the `marks` table.

### D. Staff Administration
* **Features:** Centralized directory for teaching and non-teaching staff.
* **Onboarding:** Manual creation of staff profiles and secure document storage (IDs, contracts) in Minio.

---

## 4. Additional "If Possible" Enhancements

### E. Bulk WhatsApp Integration
* **Utility:** Filter students by Standard/Division to send broadcast notifications (Fees, Holidays) using the parent/student contact data stored in the DB.

### F. Management Analytics Dashboard
* **Utility:** High-level visualization of school data including:
    * Total enrollment strength by grade.
    * Financial health (Fees collected vs. Outstanding).
    * Academic performance heatmaps.

---

## 5. Development Guidelines for Antigravity
1.  **Strict MPA Pattern:** Avoid `use client` where possible. Lean on standard HTML forms and Server Actions.
2.  **Type Safety:** Ensure the Postgres schema is the "Source of Truth" for all TypeScript interfaces.
3.  **Performance:** Use Postgres Views for the Analytics Dashboard to keep logic within the DB layer.
4.  **Security:** Implement middleware to verify Cloudflare headers on every request; reject any request missing the identity header.