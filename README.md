# MedVault Enterprise EHR Platform

> **HL7 FHIR R4 & HIPAA § 164.312 Compliant Electronic Health Record (EHR) & Clinical Management System**

MedVault is an enterprise-scale Electronic Health Record (EHR) platform featuring multi-persona clinical workspaces, a Smart Allergy Safety Engine, immutable HIPAA WORM audit logging, HL7 FHIR R4 interoperability, and integrated Synthea synthetic patient generation.

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| **🔒 Scoped Patient Portal** | Patients see strictly their own health summary — vitals, conditions, prescriptions, allergies |
| **🩺 Physician Desk** | SOAP progress notes, ICD-10 & SNOMED-CT problem lists, eRx orders with smart allergy safety checks |
| **💉 Bedside Nurse Flowsheet** | Longitudinal vitals tracking (BP, HR, Temp, SpO2, Glucose, BMI) with trend visualization |
| **⚙️ Admin Command Center** | Master Patient Index (MPI), staff directory, Synthea synthetic patient generation pipeline |
| **🛡️ HIPAA WORM Audit Vault** | Immutable append-only audit ledger for full regulatory compliance under HIPAA § 164.312(b) |
| **⚠️ Smart Allergy Safety Engine** | Real-time RxNorm contraindication cross-checking before prescription issuance |
| **🌐 HL7 FHIR R4 API** | Standard FHIR endpoints (`Patient`, `Encounter`, `Observation`, `$everything` bundles) |
| **🧬 Synthea Pipeline** | Generate realistic synthetic patient cohorts via the official Synthea framework |

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Angular 19+ (Standalone Components, Signals, Reactive Forms) |
| **Backend** | Java 17+ / Spring Boot 3.2, Spring Security 6 (Stateless JWT, Method-Level RBAC) |
| **ORM** | Spring Data JPA / Hibernate 6.4 (Dialect-Abstracted, DB-Agnostic) |
| **Database** | H2 In-Memory (Dev) · PostgreSQL 16 Docker (Local) · Cloud PostgreSQL (Prod) |
| **Interoperability** | HL7 FHIR R4, LOINC, ICD-10, SNOMED-CT, RxNorm |

---

## 🚀 Quick Start

```bash
# 1. Start Backend (Port 8080) — uses embedded H2 by default, zero setup
cd backend
./mvnw spring-boot:run

# 2. Start Frontend (Port 4200)
cd frontend
npm install
npm start
```

Open **http://localhost:4200** and sign in with any demo credential below.

### Demo Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Patient** | `user_kamran` | `patient123` |
| **Doctor** | `doctor_mahtab` | `doctor123` |
| **Nurse** | `nurse_priya` | `nurse123` |
| **Admin** | `admin` | `admin123` |
| **Auditor** | `auditor` | `auditor123` |

> For the full credentials matrix with user profiles and scopes, see [Getting Started Guide → Credentials](docs/getting-started.md).

---

## 📚 Documentation

All detailed documentation is organized in the [`docs/`](docs/) directory:

| Document | Description |
| :--- | :--- |
| **[Getting Started](docs/getting-started.md)** | Prerequisites, full credentials matrix, all 3 database execution modes, build & test commands |
| **[Architecture](docs/architecture.md)** | High-level system architecture, real-world analogies, multi-tier diagrams, hybrid RBAC+ABAC evaluation |
| **[RBAC & ABAC Matrix](docs/rbac-abac-matrix.md)** | 10 baseline roles, resource permission matrices (Clinical, Vitals, Labs, Medication, Billing), ABAC policies, HIPAA integrity rules |
| **[RBAC & ABAC Implementation Guide](docs/rbac-abac-implementation-guide.md)** | Step-by-step developer guide for implementing Spring Boot SpEL evaluators and Angular 19 guards/directives |
| **[Clinical Workflows](docs/workflows.md)** | End-to-end workflow guides for Patient Portal, Physician eRx, Nurse Vitals, Audit Vault, Synthea Pipeline, and FHIR Interop |
| **[Security & HIPAA](docs/security.md)** | JWT authentication deep dive, Spring Security filter chain, password hashing, HIPAA § 164.312 compliance mapping, WORM audit log |
| **[Database Schema](docs/database.md)** | Full entity-relationship diagram, security tables (`permissions`, `departments`, `patient_assignments`), table reference, foreign key map, coding standards |
| **[API Reference](docs/api-guide.md)** | Complete REST endpoint catalog, request/response examples, FHIR R4 resource API specification |
| **[Synthea Pipeline](docs/synthea-pipeline.md)** | Synthea framework integration, FHIR-to-entity mapping matrix, LOINC vitals mapping, CLI & web UI usage |

---

## 📁 Repository Structure

```
MedVault/
├── backend/                  # Spring Boot REST API & Security Engine
│   ├── src/main/java/        # Controllers, Services, Models, Security
│   ├── src/main/resources/   # schema.sql, seed.sql, application.properties
│   └── pom.xml
│
├── frontend/                 # Angular 19+ Standalone Enterprise UI
│   ├── src/app/              # Components, Services, Guards, Routes
│   └── package.json
│
├── docs/                     # 📚 Comprehensive Documentation Suite
│   ├── architecture.md       # System architecture & diagrams
│   ├── rbac-abac-matrix.md   # 10 production roles & RBAC+ABAC matrices
│   ├── rbac-abac-implementation-guide.md # Spring Boot & Angular security code guide
│   ├── workflows.md          # Clinical & admin workflow guides
│   ├── security.md           # Security, JWT, HIPAA compliance
│   ├── database.md           # ER diagram & schema reference
│   ├── api-guide.md          # REST API & FHIR R4 specification
│   └── synthea-pipeline.md   # Synthea synthetic data pipeline
│
├── scripts/                  # Automation scripts (Synthea CLI runner)
├── docker-compose.yml        # PostgreSQL 16 container setup
└── README.md                 # ← You are here
```
