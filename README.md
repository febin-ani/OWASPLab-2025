# OWASPLab - Web Application Security Learning Platform

<div align="center">
  <img src="https://img.shields.io/badge/OWASP-Top%2010%3A2025-blue" alt="OWASP Top 10 2025">
  <img src="https://img.shields.io/badge/Docker-First-2496ED" alt="Docker First">
  <img src="https://img.shields.io/badge/UI-Glassmorphism-red" alt="Glassmorphism UI">
</div>

## Overview

**OWASPLab** is an open-source, Docker-based web application security training platform built around the **OWASP Top 10:2025**. It provides students, educators, and early-career security professionals with a safe, realistic, and structured environment to learn web application exploitation and defence.

This platform features a **Glassmorphism UI** with a dark red theme, role-based access control, and fully isolated lab environments spanning 10 OWASP categories. 

## Features

- 🐳 **Docker-First Architecture:** Every lab runs as an isolated, stateless Docker container.
- 🔐 **Role-Based Access:** 
  - **Student:** View and exploit labs. No access to hints or walkthroughs.
  - **Trainer/Admin:** Full access to lab walkthroughs, progressive hints, and student progress tracking.
- 🎨 **Glassmorphism UI:** A stunning, modern, and highly responsive user interface.
- 🚩 **Flag-Based Progression:** Submit flags to complete labs and track your learning progress.
- 🚫 **Offline Capable:** Run the entire platform locally without an active internet connection.

## Installation and Quick Start

You can run OWASPLab on any machine (Windows, macOS, Linux) that supports Docker and Docker Compose.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### Running the Platform

1. **Clone the repository:**
   ```bash
   git clone https://github.com/febin-ani/OWASPLab-2025.git
   cd OWASPLab-2025
   ```

2. **Start the containers:**
   ```bash
   docker compose up -d --build
   ```

3. **Access the Dashboard:**
   Open your browser and navigate to `http://localhost:3000`.

### Default Credentials
Upon first launch, an initial Admin account is seeded automatically:
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Select `Admin` from the dropdown.

## Architecture

- **Proxy:** Nginx routing traffic to the frontend and individual lab containers.
- **Backend:** Node.js Express API with a SQLite database for user and progress tracking.
- **Frontend:** React + Vite utilizing Vanilla CSS for custom Glassmorphism styling.
- **Labs:** Isolated Docker containers (Python Flask / Node.js) demonstrating specific vulnerabilities.

---

<div align="center">
  <em>Developed by <strong>Febin</strong> (<a href="https://instagram.com/feb.1n">@feb.1n</a>)</em>
</div>