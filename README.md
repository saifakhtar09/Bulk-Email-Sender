# Bulk Email Sender
---

## Overview

The Bulk Email Sender allows authenticated users to:

* Configure and manage multiple SMTP accounts
* Compose rich HTML emails using a WYSIWYG editor
* Upload Excel files and send personalized emails using dynamic placeholders
* Send emails in controlled batches with pause, resume, and cancel support
* Schedule email campaigns with full timezone awareness
* Monitor progress in real time via a dashboard
* View and export detailed email delivery reports

---

## Current State

* **Frontend:** SvelteKit running on port **5000**
* **Backend API:** Hono running on port **3000**
* **Authentication:** Session-based auth with Argon2 password hashing
* **Email Engine:** User-specific SMTP configurations
* **Processing:** Batch-based email sending with smart polling
* **Scheduling:** Timezone-aware job scheduling

---

## Tech Stack

### Backend

* **Runtime:** Bun
* **Framework:** Hono
* **Language:** TypeScript
* **Database:** SQLite (bun:sqlite)
* **Password Hashing:** Argon2

### Frontend

* **Framework:** SvelteKit
* **Language:** TypeScript (strict mode)
* **Styling:** Tailwind CSS
* **Validation:** Zod
* **State Management:** Svelte stores

---

## Project Structure

```
/                    # Backend root
├── src/
│   ├── app.ts       # Main Hono application
│   ├── middleware/  # Authentication middleware
│   ├── routes/      # API routes
│   └── services/    # Business logic
├── data/            # SQLite databases
├── uploads/         # Uploaded files (Excel, assets)
├── logs/            # Application logs
└── public/          # Legacy static files

/frontend            # SvelteKit frontend
├── src/
│   ├── routes/      # Page routes
│   │   ├── +layout.svelte
│   │   ├── +page.svelte      # Dashboard
│   │   ├── login/
│   │   ├── compose/
│   │   ├── configs/
│   │   └── reports/
│   └── lib/
│       ├── components/       # Reusable UI components
│       ├── stores/           # Svelte stores
│       ├── api/              # API client helpers
│       ├── types/            # Shared TypeScript types
│       └── utils/            # Utility functions
└── static/          # Static assets
```

---

## Key Features

### Authentication

* User registration and login
* Secure password hashing using Argon2
* Session-based authentication

### SMTP Configuration

* Add, edit, and delete SMTP accounts
* Set a default SMTP configuration
* Test SMTP connections before use

### Email Composer

* Quill-based WYSIWYG editor
* Excel file upload for bulk recipients
* Dynamic placeholder support using Excel columns

### Email Targeting

* Send emails to:

  * All recipients
  * First N recipients
  * A custom recipient range

### Batch Processing

* Configurable batch size and delay
* Pause, resume, or cancel active batches
* Real-time progress updates

### Scheduling

* Schedule email campaigns for future delivery
* Automatic timezone conversion

### Dashboard

* Live batch progress monitoring
* Scheduled job overview
* Smart polling to reduce server load

### Reports

* Delivery statistics and summary cards
* Filterable email logs table
* Export reports as CSV or JSON

---

## Running the Application

### Development Mode

#### Backend

```bash
bun run src/app.ts
or
npm run dev
```

Runs the backend API on **[http://localhost:3000](http://localhost:3000)**

#### Frontend

```bash
cd frontend
npm run dev
```

Runs the SvelteKit frontend on **[http://localhost:5000](http://localhost:5000)**


Or Run both 
cd assignmenet
npm run dev

---

## API Endpoints

### Authentication

* `POST /auth/register` – Register a new user
* `POST /auth/login` – Log in
* `POST /auth/logout` – Log out
* `GET /user/info` – Get current user details

### SMTP Configuration

* `GET /config/smtp` – List SMTP configs
* `POST /config/smtp` – Create a config
* `PUT /config/smtp/:id` – Update a config
* `DELETE /config/smtp/:id` – Delete a config
* `POST /config/smtp/:id/default` – Set default SMTP
* `POST /config/smtp/test` – Test SMTP connection

### Email Sending

* `POST /send` – Send bulk emails
* `POST /parse-excel` – Parse uploaded Excel file
* `GET /batch-status` – Get batch status
* `POST /batch-pause` – Pause batch
* `POST /batch-resume` – Resume batch
* `DELETE /batch-cancel` – Cancel batch

### Scheduled Jobs

* `GET /scheduled-jobs` – List scheduled jobs
* `DELETE /scheduled-jobs/:id` – Cancel scheduled job

### Reports

* `GET /report` – Fetch email logs
* `GET /report/export/csv` – Export logs as CSV
* `GET /report/export/json` – Export logs as JSON
* `DELETE /report/clear` – Clear all logs

### Dashboard

* `GET /dashboard/poll-status` – Check polling state
* `GET /dashboard/data` – Fetch dashboard data


## Recent Changes

**2025-12-11**

* Initial SvelteKit frontend implementation
* Login and registration with Zod validation
* Real-time dashboard for batch and scheduled jobs
* SMTP configuration management with connection testing
* Email composer with Quill editor and Excel uploads
* Dynamic placeholder support from Excel columns
* Reports page with statistics, filters, and exports
* Responsive UI styled with Tailwind CSS

---
Saif Akhtar
