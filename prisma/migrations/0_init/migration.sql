-- ==============================================================================
-- Production PostgreSQL DDL Migration with pgvector
-- Civic Problem-Solving & Triple-Helix Collaboration Platform
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('CITIZEN', 'STUDENT', 'FACULTY', 'INDUSTRY', 'GOVT_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "InstitutionType" AS ENUM ('UNIVERSITY', 'INDUSTRY_PARTNER', 'GOVT_BODY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Category" AS ENUM (
        'WATER_SANITATION',
        'HEALTHCARE',
        'AGRICULTURE',
        'INFRASTRUCTURE_ROADS',
        'ENVIRONMENT_WASTE',
        'ENERGY_POWER',
        'PUBLIC_SAFETY',
        'EDUCATION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProblemStatus" AS ENUM (
        'SUBMITTED',
        'VERIFIED',
        'ADOPTED',
        'IN_PROGRESS',
        'PROTOTYPE_REVIEW',
        'DEPLOYMENT_STAGING',
        'RESOLVED',
        'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProjectStatus" AS ENUM (
        'PLANNING',
        'ACTIVE',
        'PROTOTYPE_READY',
        'GOVT_REVIEW',
        'PILOT_DEPLOYED',
        'COMPLETED',
        'TERMINATED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'COMPLETED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Institutions Table
CREATE TABLE IF NOT EXISTS "institutions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "departments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "csr_focus_areas" "Category"[] DEFAULT ARRAY[]::"Category"[],
    "workload_capacity" INTEGER NOT NULL DEFAULT 5,
    "active_project_count" INTEGER NOT NULL DEFAULT 0,
    "contact_email" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "role" "Role" NOT NULL DEFAULT 'CITIZEN',
    "auth_id" VARCHAR(255) NOT NULL UNIQUE,
    "institution_id" UUID REFERENCES "institutions"("id") ON DELETE SET NULL,
    "department" VARCHAR(255),
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Duplicate Clusters (defined before problems for circular reference handling)
CREATE TABLE IF NOT EXISTS "duplicate_clusters" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "primary_problem_id" UUID NOT NULL,
    "similarity_score" DOUBLE PRECISION NOT NULL,
    "cluster_size" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Problems Table
CREATE TABLE IF NOT EXISTS "problems" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "citizen_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "status" "ProblemStatus" NOT NULL DEFAULT 'SUBMITTED',
    
    -- Scoring Factors
    "severity_score" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "urgency_score" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "upvote_count" INTEGER NOT NULL DEFAULT 0,
    "geographic_spread" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "priority_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    
    -- Geospatial & Media
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "raw_media_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "voice_transcript" TEXT,
    
    -- pgvector column (1536 dimensions)
    "embedding" vector(1536),
    
    -- Cluster reference
    "cluster_id" UUID REFERENCES "duplicate_clusters"("id") ON DELETE SET NULL,

    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key back to primary problem
ALTER TABLE "duplicate_clusters" 
ADD CONSTRAINT "fk_duplicate_clusters_primary_problem"
FOREIGN KEY ("primary_problem_id") REFERENCES "problems"("id") ON DELETE CASCADE;

-- 7. Problem Upvotes Table (Prevents duplicate upvoting)
CREATE TABLE IF NOT EXISTS "problem_upvotes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "problem_id" UUID NOT NULL REFERENCES "problems"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "unique_problem_user_upvote" UNIQUE ("problem_id", "user_id")
);

-- 8. Projects Table
CREATE TABLE IF NOT EXISTS "projects" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "problem_id" UUID NOT NULL REFERENCES "problems"("id") ON DELETE RESTRICT,
    "university_id" UUID NOT NULL REFERENCES "institutions"("id") ON DELETE RESTRICT,
    "industry_partner_id" UUID REFERENCES "institutions"("id") ON DELETE SET NULL,
    "lead_faculty_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "title" VARCHAR(255) NOT NULL,
    "abstract" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "repo_url" TEXT,
    "prototype_url" TEXT,
    "budget_allocated" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Project Student Members Table
CREATE TABLE IF NOT EXISTS "project_student_members" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "student_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "role_description" VARCHAR(255),
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "unique_project_student" UNIQUE ("project_id", "student_id")
);

-- 10. Milestones Table
CREATE TABLE IF NOT EXISTS "milestones" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "target_date" TIMESTAMPTZ NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "verification_proof_url" TEXT,
    "govt_feedback" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Audit Logs Table
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "actor_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID NOT NULL,
    "metadata" JSONB DEFAULT '{}'::JSONB,
    "ip_address" VARCHAR(45),
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Indexes & Performance Optimization
CREATE INDEX IF NOT EXISTS "idx_problems_category_status" ON "problems"("category", "status");
CREATE INDEX IF NOT EXISTS "idx_problems_priority_score" ON "problems"("priority_score" DESC);
CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_timestamp" ON "audit_logs"("timestamp" DESC);

-- HNSW Vector Index for sub-millisecond Cosine Distance (<=> operator) searches
CREATE INDEX IF NOT EXISTS "idx_problems_embedding_hnsw" 
ON "problems" 
USING hnsw ("embedding" vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
