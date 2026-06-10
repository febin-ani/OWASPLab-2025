# OWASPLab — Product Requirements Document

> **Web Application Security Learning Platform**
> OWASP Top 10:2025 · Docker-First · Glassmorphism UI · Role-Based Access

| | |
|---|---|
| **Author** | Febin (@feb.1n) |
| **Version** | 2.0 |
| **Status** | Draft — For Review |
| **Date** | June 2026 |
| **Target Release** | Q4 2026 |
| **Platform** | Docker Compose (local) |
| **UI Style** | Glassmorphism — Red Theme |
| **Access Control** | Login-gated (Student / Trainer / Admin) |

---

> *Developed by Febin (@feb.1n)*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Non-Goals](#3-goals--non-goals)
4. [Target Users](#4-target-users)
5. [Authentication & Access Control](#5-authentication--access-control)
6. [Lab Catalogue — OWASP Top 10:2025](#6-lab-catalogue--owasp-top-102025)
7. [Functional Requirements](#7-functional-requirements)
8. [UI Design System](#8-ui-design-system--glassmorphism--red-theme)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Technology Stack](#10-technology-stack)
11. [Docker Architecture](#11-docker-architecture)
12. [Key User Flows](#12-key-user-flows)
13. [Development Milestones](#13-development-milestones)
14. [Risks & Mitigations](#14-risks--mitigations)
15. [Future Scope (v2+)](#15-future-scope-v2)
16. [Acceptance Criteria](#16-acceptance-criteria)
17. [References](#17-references)

---

## 1. Executive Summary

**OWASPLab** is an open-source, Docker-based web application security training platform built around the **OWASP Top 10:2025**. It provides students, educators, and early-career security professionals with a safe, realistic, and structured environment to learn web application exploitation and defence.

The platform features a **glassmorphism UI with a red colour theme**, a **login-gated entry system** with three role tiers (Student, Trainer, Admin), and **30 labs** across 10 OWASP categories at three difficulty levels each. Crucially, hints and walkthroughs are **never surfaced to students** — only Trainer and Admin roles can access answer/solution content.

Everything runs locally via a single `docker compose up -d`. No internet required after the first pull.

---

## 2. Problem Statement

- **DVWA and WebGoat** are outdated — neither covers OWASP Top 10:2025 entries such as A03 (Supply Chain Failures) and A10 (Mishandling of Exceptional Conditions).
- **HackTheBox and TryHackMe** require paid subscriptions, constant internet, and individual accounts — friction in classrooms.
- **No existing free platform** offers Easy / Medium / Hard difficulty tiers per OWASP category.
- **Existing platforms show hints and answers openly**, undermining the learning challenge for students.
- **Instructors lack** a single shareable artefact that gives every student an identical local environment.

---

## 3. Goals & Non-Goals

### 3.1 Goals

1. Cover all 10 OWASP Top 10:2025 categories with 3 difficulty tiers each (30 labs total).
2. Enforce role-based access: **Students see zero hint/answer content**; Trainers and Admins do.
3. Deliver a **glassmorphism UI** with a red primary colour theme.
4. **Gate all platform access** behind a login page (Student / Trainer / Admin roles).
5. Run fully offline via Docker Compose — no cloud dependency.
6. Be shareable as a single git repository or `docker-compose.yml`.
7. Render the footer **"Developed by Febin (@feb.1n)"** on every page.
8. Support Kali Linux, Ubuntu, macOS, and Windows (via Docker Desktop).

### 3.2 Non-Goals

- Not a cloud-hosted SaaS.
- Not a full LMS with grade syncing or institutional SSO in v1.
- Not a mobile app.
- Not a live public CTF competition platform.

---

## 4. Target Users

| Role | Background | Platform Access |
|---|---|---|
| **Student** | Cybersecurity learner (eJPT, CEH, OSCP prep) | Labs only — no hints, no answers visible |
| **Trainer** | Instructor sharing labs in class | Labs + student progress + hint/answer view |
| **Admin** | Platform owner / Febin | Full access — user management, lab config, all solutions |
| **CTF Beginner** | Starting web security from scratch | Student role with guided difficulty progression |

---

## 5. Authentication & Access Control

### 5.1 Login Page Design

The login page is the **first screen for all users**. It features the glassmorphism aesthetic — a frosted-glass card centred on a dark red gradient background with the OWASPLab logo.

```
┌─────────────────────────────────┐
│                                 │
│         🔴 OWASPLab             │
│   Web App Security Platform     │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Username               │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  Password               │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  Role ▼  [Student     ] │    │
│  └─────────────────────────┘    │
│                                 │
│       [ Sign In ──────── ]      │
│                                 │
│   Developed by Febin (@feb.1n)  │
└─────────────────────────────────┘
```

- **URL:** `http://localhost:3000/login`
- Unauthenticated users are always redirected to `/login`
- Sessions stored in `httpOnly` cookies; expire after 8 hours
- Failed login: generic `Invalid credentials.` — no username enumeration
- Admin creates/revokes accounts via `/admin/users`

### 5.2 Role Permission Matrix

| Feature | Student | Trainer | Admin |
|---|:---:|:---:|:---:|
| View & launch labs | ✅ | ✅ | ✅ |
| Submit flags | ✅ | ✅ | ✅ |
| View own progress | ✅ | ✅ | ✅ |
| View hints (progressive) | ❌ | ✅ | ✅ |
| View full walkthroughs / answers | ❌ | ✅ | ✅ |
| View all students' progress | ❌ | ✅ | ✅ |
| Reset any lab instance | ❌ | ✅ | ✅ |
| Export progress reports (CSV) | ❌ | ✅ | ✅ |
| Create / disable user accounts | ❌ | ❌ | ✅ |
| Add / edit labs | ❌ | ❌ | ✅ |
| Access Admin Panel | ❌ | ❌ | ✅ |

> ⚠️ **Critical:** Hint and answer content is **withheld server-side** — Student API responses contain no hint data at all. It is not hidden in the DOM; it is never sent.

### 5.3 Login Page UI Spec (CSS)

```css
/* Page background */
body {
  background: radial-gradient(ellipse at center, #8B0000 0%, #1A0000 100%);
  min-height: 100vh;
}

/* Glass card */
.login-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 80, 80, 0.25);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(139, 0, 0, 0.4);
  padding: 2.5rem;
}

/* Input fields */
.glass-input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 80, 80, 0.2);
  border-radius: 8px;
  color: #fff;
  transition: border-color 0.2s;
}
.glass-input:focus {
  border-bottom-color: #E74C3C;
  outline: none;
}

/* Submit button */
.btn-primary {
  background: #C0392B;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-primary:hover { background: #E74C3C; }

/* Footer */
.page-footer {
  color: rgba(255, 80, 80, 0.7);
  font-size: 0.75rem;
  text-align: center;
}
```

---

## 6. Lab Catalogue — OWASP Top 10:2025

### 6.1 Difficulty Tiers

| Tier | Description |
|---|---|
| 🟢 **Easy** | Single-step exploitation. Scenario description provided. No hints surfaced. Student must self-discover. |
| 🟠 **Medium** | Multi-step attack requiring enumeration and chaining of 2+ issues. Students receive no assistance. |
| 🔴 **Hard** | Realistic scenario needing research and custom tooling. Zero in-UI guidance for students. |

---

### A01 — Broken Access Control
| Tier | Scenario |
|---|---|
| 🟢 Easy | Access another user's profile page via IDOR |
| 🟠 Medium | Bypass RBAC to reach the admin panel |
| 🔴 Hard | Path traversal + JWT privilege escalation chain |

### A02 — Security Misconfiguration
| Tier | Scenario |
|---|---|
| 🟢 Easy | Enumerate exposed `.env` and debug endpoints |
| 🟠 Medium | Exploit default credentials on misconfigured service |
| 🔴 Hard | Over-permissive CORS + security headers chain exploit |

### A03 — Software Supply Chain Failures
| Tier | Scenario |
|---|---|
| 🟢 Easy | Identify vulnerable dependency via SCA scan |
| 🟠 Medium | Exploit known CVE in bundled library |
| 🔴 Hard | Simulate typosquatting attack and trace full impact |

### A04 — Cryptographic Failures
| Tier | Scenario |
|---|---|
| 🟢 Easy | Decode Base64-stored passwords in leaked DB dump |
| 🟠 Medium | Crack MD5-hashed credentials with rainbow tables |
| 🔴 Hard | Exploit weak JWT signing key; forge admin token |

### A05 — Injection
| Tier | Scenario |
|---|---|
| 🟢 Easy | Classic SQL injection in login form (UNION-based) |
| 🟠 Medium | Blind SQLi with time-based exfiltration |
| 🔴 Hard | Second-order SQLi + stored XSS combined payload |

### A06 — Insecure Design
| Tier | Scenario |
|---|---|
| 🟢 Easy | Abuse flawed password-reset OTP (no rate limit) |
| 🟠 Medium | Exploit missing business logic in coupon system |
| 🔴 Hard | Logic flaw chain leading to full account takeover |

### A07 — Authentication Failures
| Tier | Scenario |
|---|---|
| 🟢 Easy | Brute-force login with no lockout or CAPTCHA |
| 🟠 Medium | Session fixation / cookie theft scenario |
| 🔴 Hard | OAuth 2.0 implicit flow token hijack |

### A08 — Software & Data Integrity Failures
| Tier | Scenario |
|---|---|
| 🟢 Easy | Tamper with unsigned serialized object |
| 🟠 Medium | Exploit insecure CI/CD pipeline artifact |
| 🔴 Hard | Deserialization RCE via crafted Java payload |

### A09 — Security Logging & Alerting Failures
| Tier | Scenario |
|---|---|
| 🟢 Easy | Conduct an attack with no logs generated; identify the gap |
| 🟠 Medium | Bypass logging via log injection / forging |
| 🔴 Hard | Cover-your-tracks: erase traces after simulated breach |

### A10 — Mishandling of Exceptional Conditions
| Tier | Scenario |
|---|---|
| 🟢 Easy | Trigger verbose error messages leaking stack traces |
| 🟠 Medium | Exploit fail-open logic in payment flow |
| 🔴 Hard | Race condition (TOCTOU) on file upload validation |

---

## 7. Functional Requirements

### 7.1 Lab Environment

- Each lab runs as an isolated Docker container with a deliberately vulnerable web application.
- Labs are accessible through the dashboard at `http://localhost:3000/labs/:id/:tier`.
- Containers are stateless — a **Reset** button restores the original vulnerable state instantly.
- **Flag-based completion:** each lab contains a hidden `FLAG{...}` string to exfiltrate and submit.

### 7.2 Dashboard — Student View

- Glass-card grid of 10 OWASP categories with circular completion rings.
- Each card shows three tier buttons (Easy / Medium / Hard) with lock icons on incomplete labs.
- **No hint, walkthrough, or answer data is returned from the API for Student sessions.**
- Overall progress bar (0 / 30 labs) shown at the top of the dashboard.
- Footer: *Developed by Febin (@feb.1n)* on every page.

### 7.3 Dashboard — Trainer View

- All student dashboard content, plus:
  - **Students tab** — per-student progress table across all 30 labs.
  - **Hint Panel** — expandable per-lab section showing 3 progressive hints + full walkthrough.
  - Remote reset of any student's lab instance.
  - **Export CSV** — class progress report download.

### 7.4 Dashboard — Admin View

- All Trainer capabilities, plus:
  - **User Management** (`/admin/users`) — create, disable, delete accounts by role.
  - **Lab Management** (`/admin/labs`) — toggle labs, edit flag values, update metadata.
  - **System Status** — Docker container health, uptime, and resource usage per lab.

### 7.5 Hint & Walkthrough System (Trainer / Admin Only)

- All hint and walkthrough content is **stored server-side and never sent to Student-role API responses**.
- Trainer hint panel: 3 progressive hints + full written walkthrough per lab.
- Walkthroughs include: vulnerability explanation, attack steps, remediation guidance, OWASP reference.
- Admin can edit hint/walkthrough content via Lab Management.

### 7.6 Flag Submission

- Students submit flags via the flag input field on each lab card.
- Incorrect: `"Incorrect flag. Keep trying!"` — no hint offered.
- Correct: glass confetti animation, lab marked complete, next tier card unlocked.

---

## 8. UI Design System — Glassmorphism / Red Theme

### 8.1 Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `--red-900` | `#8B0000` | Page backgrounds, headings, dark accents |
| `--red-700` | `#C0392B` | Primary buttons, active states, badges |
| `--red-500` | `#E74C3C` | Hover states, highlights, progress bars |
| `--red-100` | `#FDECEA` | Soft backgrounds, alternate table rows |
| `--glass-bg` | `rgba(255,255,255,0.08)` | Card backgrounds |
| `--glass-border` | `rgba(255,80,80,0.25)` | Card borders |
| `--text-primary` | `#FFFFFF` | Headings on dark backgrounds |
| `--text-secondary` | `#CCCCCC` | Body text on dark backgrounds |

### 8.2 Glass Card Component

```css
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 80, 80, 0.25);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(139, 0, 0, 0.3);
}
```

### 8.3 Typography

- **Font:** Inter (Google Fonts), Arial fallback.
- **Headings:** bold, `#FFFFFF` or `#8B0000` depending on background.
- **Body:** 14–16px, `#CCCCCC` on dark surfaces.
- **Flags / code:** JetBrains Mono or Courier New, red-tinted pill background.

### 8.4 Page Routes

| Page | Route | Access |
|---|---|---|
| Login | `/login` | Public |
| Dashboard | `/dashboard` | All authenticated roles |
| Lab View | `/labs/:id/:tier` | All authenticated roles |
| Trainer Panel | `/trainer` | Trainer + Admin |
| Admin Panel | `/admin` | Admin only |
| User Management | `/admin/users` | Admin only |
| Lab Management | `/admin/labs` | Admin only |

### 8.5 Footer (All Pages)

Every page renders the following footer:

```html
<footer class="page-footer">
  Developed by <strong>Febin</strong>
  (<a href="https://instagram.com/feb.1n">@feb.1n</a>)
</footer>
```

---

## 9. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| **Performance** | Dashboard loads < 2 seconds on 4-core / 8 GB laptop. Lab containers start within 30 seconds. |
| **Portability** | Docker Desktop (Win/macOS) + Docker Engine (Kali, Ubuntu). ARM64 required. |
| **Security Isolation** | Lab containers on isolated Docker network — no outbound internet at runtime. |
| **Access Control** | All routes protected by server-side role middleware. Client-side checks are supplementary only. |
| **Offline Operation** | All assets work offline after initial `docker pull`. |
| **Maintainability** | Each lab is a self-contained folder. New labs added without modifying other services. |
| **Footer Attribution** | `Developed by Febin (@feb.1n)` rendered on every page of the platform. |
| **Browser Support** | Chrome, Firefox, Safari (latest 2 versions). Glass UI tested on all three. |

---

## 10. Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Containerisation | Docker + Compose v3.9 | Orchestration of all services |
| Reverse Proxy | Nginx Alpine | Routes `/labs/*` to lab containers |
| Lab Runtime | Python Flask / Node.js Express | Deliberately vulnerable web apps |
| Dashboard Frontend | React + Vite + Tailwind CSS | Glassmorphism UI |
| Dashboard Backend | Node.js Express | Auth, flag validation, progress API |
| Authentication | JWT (httpOnly cookie) + bcrypt | Session management, password hashing |
| Progress Database | SQLite (volume-mounted) | User progress, flags, accounts |
| CI/CD | GitHub Actions + GHCR | Build and publish Docker images |

---

## 11. Docker Architecture

### 11.1 Service Map

| Service | Port | Description |
|---|---|---|
| `owasp-proxy` | `80` | Nginx — routes to dashboard and lab containers |
| `owasp-dashboard` | `3000` | React UI + Node API (auth, flags, progress) |
| `lab-a01` … `lab-a10` | Internal | One container per OWASP category (3 tiers each) |
| `owasp-db` | Internal | SQLite volume — users, progress, flags |

### 11.2 Repository Layout

```
owasplab/
├── docker-compose.yml
├── .env.example
├── dashboard/
│   ├── frontend/           # React + Vite (glass UI, red theme)
│   └── backend/            # Node.js Express API
├── proxy/
│   └── nginx.conf
├── labs/
│   ├── a01-easy/           # Dockerfile + vulnerable app
│   ├── a01-medium/
│   ├── a01-hard/
│   ├── a02-easy/
│   ├── ...
│   └── a10-hard/
├── docs/
│   └── walkthroughs/       # Trainer/Admin only — not served to students
└── scripts/
    ├── seed-flags.py
    ├── seed-users.py
    └── reset-lab.sh
```

### 11.3 Sample `docker-compose.yml` Skeleton

```yaml
version: "3.9"

networks:
  owasplab-internal:
    driver: bridge
    internal: true          # No outbound internet for lab containers
  owasplab-frontend:
    driver: bridge

services:
  proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "3000:3000"
    volumes:
      - ./proxy/nginx.conf:/etc/nginx/nginx.conf:ro
    networks: [owasplab-frontend, owasplab-internal]

  dashboard:
    build: ./dashboard
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - DB_PATH=/data/owasplab.db
    volumes:
      - db-data:/data
    networks: [owasplab-frontend]

  lab-a01-easy:
    build: ./labs/a01-easy
    networks: [owasplab-internal]
    deploy:
      resources:
        limits:
          memory: 256m
          cpus: "0.5"

  # Repeat for a01-medium, a01-hard ... a10-hard

volumes:
  db-data:
```

### 11.4 Quick Start (Student)

```bash
# 1. Install Docker Desktop (Windows/macOS) or Docker Engine (Linux/Kali)

# 2. Clone the repository
git clone https://github.com/your-org/owasplab
cd owasplab

# 3. Copy environment file
cp .env.example .env

# 4. Start all services
docker compose up -d

# 5. Open your browser
# → http://localhost:3000
# → Login with credentials provided by your Trainer
```

---

## 12. Key User Flows

### 12.1 Student — Login & Complete a Lab

```
http://localhost:3000  →  /login (redirect)
         │
         ▼
  Enter credentials + select "Student" role
         │
         ▼
  Dashboard: 10 glass category cards
         │
         ▼
  Click category → choose tier → "Launch Lab"
         │
         ▼
  Exploit the vulnerable app → retrieve FLAG{...}
         │
         ▼
  Return to dashboard → paste flag → Submit
         │
         ▼
  ✅ Completion + confetti animation + next tier unlocked
```

### 12.2 Trainer — Monitor Students

1. Login with Trainer credentials → dashboard loads.
2. Go to **Students tab** → per-student progress across 30 labs.
3. Click any lab → **Hint Panel** expands (3 hints + walkthrough).
4. Use **Reset** to restore a student's lab instance.
5. Click **Export CSV** for class progress report.

### 12.3 Admin — Manage Users

1. Login with Admin credentials → `/admin` panel.
2. Go to **User Management** → **Add User**.
3. Fill username, email, role, temporary password → **Save**.
4. Share credentials with student out-of-band.
5. Disable or delete accounts at any time.

### 12.4 Hint Flow (Trainer/Admin only)

| Action | Content Revealed |
|---|---|
| Open Hint Panel | Hint 1: vulnerability category + entry point |
| Expand Hint 2 | Attack technique + relevant tool |
| Expand Hint 3 | Step-by-step attack guidance |
| View Walkthrough | Full exploitation + remediation + OWASP ref |

> Students **never** see this panel. The API returns `403 Forbidden` for hint endpoints on Student sessions.

---

## 13. Development Milestones

| Phase | Milestone | Deliverables | Target |
|---|---|---|---|
| **P0** | Scaffolding | Repo structure, Docker Compose skeleton, nginx, DB schema, README | Wk 1–2 |
| **P1** | Auth System | Login page (glass UI), JWT auth, role middleware, user seeder | Wk 3–4 |
| **P2** | Dashboard UI | Glass card dashboard (all roles), progress tracking, flag submission | Wk 5–6 |
| **P3** | Labs A01–A05 | Easy + Medium labs; hint/walkthrough system (Trainer/Admin only) | Wk 7–10 |
| **P4** | Labs A06–A10 | Easy + Medium labs for remaining 5 categories | Wk 11–13 |
| **P5** | Hard Labs | Hard tier for all 10; Admin panel; user management | Wk 14–16 |
| **P6** | Polish | ARM64 images, WCAG audit, footer credit, CI/CD, GitHub release | Wk 17–18 |

**Total: 30 labs across 18 weeks**

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Vulnerable containers exploited outside lab | 🔴 High | Run on isolated/VM network; no external port exposure; README warning |
| Student bypasses role check client-side | 🟠 Medium | Hint content withheld **server-side** — API never returns it to Student sessions |
| Resource overload on student laptops | 🟠 Medium | Per-container 256 MB / 0.5 CPU limits; max one lab active at a time |
| Docker not installed on student OS | 🟠 Medium | Install guide provided; VirtualBox OVA fallback |
| Supply chain lab (A03) fetches real packages | 🔴 High | All A03 labs use sandboxed mock registry; zero real external package calls |

---

## 15. Future Scope (v2+)

- **OWASP API Security Top 10** — 10 additional API-focused lab categories.
- **Class leaderboard** — real-time scoring with anonymised student rankings.
- **LMS export** — xAPI / CSV for Moodle, Canvas, Google Classroom.
- **Local LLM hints** — AI-assisted adaptive hints for Trainer-approved sessions only.
- **Dark / light mode toggle** — secondary theme alongside red glassmorphism.
- **OWASP ASVS mapping** — each lab linked to ASVS verification requirement IDs.

---

## 16. Acceptance Criteria

v1.0 is shippable when **ALL** of the following pass:

- [ ] All 30 labs are reachable via the nginx proxy.
- [ ] Login page gate works — unauthenticated users cannot access any route except `/login`.
- [ ] Role enforcement verified: **Student API responses contain zero hint/answer data**.
- [ ] Trainer and Admin can view all hints, walkthroughs, and student progress.
- [ ] Admin can create, disable, and delete user accounts via `/admin/users`.
- [ ] Each lab has a unique, submittable `FLAG{...}` and correct submission marks completion.
- [ ] `docker compose up -d` completes within 5 minutes on a standard laptop (cold start).
- [ ] All images run on `amd64` and `arm64`.
- [ ] Footer **"Developed by Febin (@feb.1n)"** appears on every page.
- [ ] Glass UI renders correctly on Chrome, Firefox, and Safari (latest versions).

---

## 17. References

- [OWASP Top 10:2025](https://owasp.org/Top10/2025/)
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/)
- [DVWA — Damn Vulnerable Web Application](https://dvwa.co.uk/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [Glassmorphism UI Reference](https://glassmorphism.com/)

---

<div align="center">

*Developed by **Febin** ([@feb.1n](https://instagram.com/feb.1n))*
*OWASPLab PRD v2.0 — June 2026 | Confidential — Internal Use Only*

</div>
