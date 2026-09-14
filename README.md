# Civic Problem-Solving & Triple-Helix Collaboration Platform
### Smart India Hackathon (SIH) — Production Architecture Blueprint

An autonomous, closed-loop civic problem resolution ecosystem bridging **Citizens**, **Universities (Faculty & Students)**, **Industry Partners (CSR)**, and **Government Bodies (Municipalities & Admins)**.

---

## 🏛️ System Architecture Overview

```
[Citizens] ─────────► [AI Ingestion & pgvector] ────────► [Smart Routing Matrix]
  • Voice Notes         • Whisper Speech-to-Text            • Dept Affinity
  • Camera Photos       • 1536-dim Embedding Deduplication • Geospatial Proximity
  • GPS Pins            • Multi-Factor Priority Scoring    • Workload Capacity
                                                                    │
      ┌─────────────────────────────────────────────────────────────┴───────────┐
      ▼                                                                         ▼
[Universities / Capstones]                                              [Industry CSR]
  • Adopt Challenge                                                       • Fund Hardware
  • Milestone Verification                                                • Tax ESG Ledger
      │                                                                         │
      └─────────────────────────────────┬───────────────────────────────────────┘
                                        ▼
                           [Government Command Center]
                             • Real-time Spatial Heatmap
                             • 48h / 7d SLA Breach Escalation
                             • Field Pilot Deployment Sign-off
```

---

## 🚀 Quickstart

### 1. Prerequisites
- Node.js 18+ (Tested on Node.js 20 & 25)
- PostgreSQL 16+ with `pgvector` extension enabled (or Supabase / Neon)

### 2. Setup Environment Variables
```bash
cp .env.example .env
# Fill in your DATABASE_URL and optional OPENAI_API_KEY
```

### 3. Run Verification Simulation
Validate the Priority Scoring algorithm, pgvector Cosine similarity clustering, and Smart Routing matrix:
```bash
npm run test:simulate
```

### 4. Database Setup
```bash
# Generate Prisma Client
npm run db:generate

# Push schema directly to PostgreSQL
npm run db:push

# Seed mock institutions and universities
npm run db:seed
```

### 5. Launch Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📐 Core Algorithmic Formulations

### 1. Multi-Factor Priority Scoring Formula
Prevents runaway bot upvote swarms while prioritizing severe life-safety threats:

$$\text{Priority} = w_{\text{sev}} \cdot S + w_{\text{imp}} \cdot \log_{10}(U + 1) + w_{\text{urg}} \cdot U_{\text{rg}} + w_{\text{geo}} \cdot \min(G, 10.0)$$

- **$S \in [1.0, 5.0]$**: Severity assessed via AI NLP classification.
- **$U \ge 0$**: Citizen impact (verified upvotes + clustered duplicate reports).
- **$U_{\text{rg}} \in [1.0, 5.0]$**: Urgency rating (rate of hazard escalation).
- **$G \in [0.1, 10.0]$**: Geographic spread radius in kilometers.
- **SLA Classification**:
  - Score $\ge 75 \implies$ **`CRITICAL_48H`** (Immediate escalation to Municipal Commissioner).
  - Score $\ge 45 \implies$ **`ELEVATED_7D`** (Zonal Executive Engineer queue).
  - Score $< 45 \implies$ **`STANDARD_14D`** (Standard triage queue).

### 2. Semantic Deduplication & Clustering (pgvector)
- High-dimensional vector embeddings ($1536$ dimensions) using OpenAI `text-embedding-3-small`.
- Sub-millisecond approximate nearest neighbor retrieval via HNSW index:
```sql
SELECT id, title, (1 - (embedding <=> $1::vector)) AS similarity_score
FROM problems
WHERE category = $2
  AND (1 - (embedding <=> $1::vector)) >= 0.85
ORDER BY similarity_score DESC;
```
- Reports with $\ge 85\%$ similarity within a $5\text{ km}$ radius automatically merge into a `DuplicateCluster`, consolidating citizen impact and boosting priority.

---

## 🛡️ Role-Based Access Control (RBAC)

| Portal / Route | CITIZEN | STUDENT | FACULTY | INDUSTRY | GOVT_ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `/citizen` (Submit & Track) | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/university` (Adopt Challenge) | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/university` (Submit Milestone Proofs)| ❌ | ✅ | ✅ | ❌ | ❌ |
| `/industry` (Sponsor CSR Grants) | ❌ | ❌ | ❌ | ✅ | ❌ |
| `/government` (Command Heatmap) | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/government` (Approve Field Pilot) | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 📁 Project Structure

```
project-sih/
├── prisma/
│   ├── schema.prisma              # PostgreSQL + pgvector schema
│   ├── seed.ts                    # Sample institutions & users seed
│   └── migrations/0_init/         # Raw PostgreSQL DDL with HNSW indexes
├── src/
│   ├── app/
│   │   ├── (portals)/
│   │   │   ├── citizen/page.tsx   # Multimodal submission & timeline tracker
│   │   │   ├── university/page.tsx# Challenge marketplace & adoption modal
│   │   │   ├── industry/page.tsx  # CSR discovery & ESG ledger
│   │   │   └── government/page.tsx# GIS heatmap & SLA queue
│   │   └── api/
│   │       ├── problems/          # Ingestion, duplicates, clusters
│   │       ├── ai/                # Classification & match-routing
│   │       ├── projects/          # Adoption & milestone updates
│   │       └── government/        # Analytics & SLA metrics
│   ├── services/
│   │   ├── scoring.service.ts     # Logarithmic priority calculation
│   │   ├── vector.service.ts      # pgvector cosine similarity & clustering
│   │   ├── routing.service.ts     # Triple-helix matching matrix
│   │   └── audit.service.ts       # Immutable audit logger
│   ├── lib/
│   │   ├── db.ts                  # Prisma Client singleton
│   │   └── auth.ts                # RBAC guards & session parsing
│   └── types/
│       └── index.ts               # Shared TypeScript domain types
└── scripts/
    └── simulate-scoring-and-clustering.ts # Verification test suite
```
