-- ==============================================================================
-- Civic Problem-Solving & Triple-Helix Platform
-- Supabase PostgreSQL DDL with pgvector
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hvxlyzjspemwzgeeoxbx/sql/new
-- ==============================================================================

-- 1. Enable Required Extensions
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

-- 5. Duplicate Clusters
CREATE TABLE IF NOT EXISTS "duplicate_clusters" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "primary_problem_id" UUID,
    "similarity_score" DOUBLE PRECISION NOT NULL,
    "cluster_size" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Problems Table (with pgvector embedding)
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
    
    -- pgvector column (1536 dimensions for OpenAI / AI embeddings)
    "embedding" vector(1536),
    
    -- Cluster reference
    "cluster_id" UUID REFERENCES "duplicate_clusters"("id") ON DELETE SET NULL,

    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Circular foreign key for primary_problem_id
DO $$ BEGIN
    ALTER TABLE "duplicate_clusters" 
    ADD CONSTRAINT "fk_duplicate_clusters_primary_problem"
    FOREIGN KEY ("primary_problem_id") REFERENCES "problems"("id") ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Problem Upvotes Table
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

-- 12. Performance & Vector Indexes
CREATE INDEX IF NOT EXISTS "idx_problems_category_status" ON "problems"("category", "status");
CREATE INDEX IF NOT EXISTS "idx_problems_priority_score" ON "problems"("priority_score" DESC);
CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_timestamp" ON "audit_logs"("timestamp" DESC);

-- HNSW Cosine Vector Index
CREATE INDEX IF NOT EXISTS "idx_problems_embedding_hnsw" 
ON "problems" 
USING hnsw ("embedding" vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 13. Seed Initial Demo Institutions & Users
INSERT INTO "institutions" ("id", "name", "type", "latitude", "longitude", "departments", "csr_focus_areas", "workload_capacity", "active_project_count", "contact_email")
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'IIT Delhi - Civil & Environmental Labs', 'UNIVERSITY', 28.5450, 77.1926, ARRAY['CIVIL', 'ENVIRONMENTAL', 'CSE_AI'], ARRAY[]::"Category"[], 10, 3, 'civic.labs@iitd.ac.in'),
    ('00000000-0000-0000-0000-000000000002', 'Tata Sustainability & Civic Trust', 'INDUSTRY_PARTNER', 28.6289, 77.2065, ARRAY[]::TEXT[], ARRAY['WATER_SANITATION', 'ENVIRONMENT_WASTE', 'EDUCATION']::"Category"[], 25, 8, 'csr.grants@tata.com')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "users" ("id", "name", "email", "role", "auth_id", "institution_id", "department")
VALUES 
    ('00000000-0000-0000-0000-000000000101', 'Demo Citizen', 'citizen@civic-platform.org', 'CITIZEN', 'dev-citizen-001', NULL, NULL),
    ('00000000-0000-0000-0000-000000000102', 'Dr. Ramesh Sharma (Faculty Lead)', 'faculty@iitd.ac.in', 'FACULTY', 'faculty-lead-001', '00000000-0000-0000-0000-000000000001', 'CIVIL'),
    ('00000000-0000-0000-0000-000000000103', 'Ananya Verma (Student Researcher)', 'ananya.v@student.iitd.ac.in', 'STUDENT', 'student-001', '00000000-0000-0000-0000-000000000001', 'CIVIL'),
    ('00000000-0000-0000-0000-000000000104', 'Vikram Malhotra (CSR Lead)', 'v.malhotra@tata.com', 'INDUSTRY', 'industry-001', '00000000-0000-0000-0000-000000000002', 'CSR'),
    ('00000000-0000-0000-0000-000000000105', 'Rajesh Kumar IAS (Commissioner)', 'commissioner@delhi.gov.in', 'GOVT_ADMIN', 'govt-admin-001', NULL, 'MUNICIPAL_CORP')
ON CONFLICT ("email") DO NOTHING;

-- 14. 10 Production Demo Civic Problems
INSERT INTO "problems" (
    "id", "citizen_id", "title", "description", "category", "status",
    "severity_score", "urgency_score", "upvote_count", "geographic_spread", "priority_score",
    "latitude", "longitude", "address"
) VALUES
(
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000101',
    'Main Drinking Water Pipeline Rupture & High Turbidity',
    'Arterial water line cracked, causing brownish municipal water and severe flooding in public market lanes.',
    'WATER_SANITATION',
    'VERIFIED',
    4.8, 4.9, 24, 2.5, 94.5,
    28.6139, 77.2090,
    'Connaught Place, Block B Outer Circle, New Delhi'
),
(
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000101',
    'Major Arterial Road Cave-in & Pothole Cluster',
    'Deep 1.2m asphalt subsidence following heavy monsoon rains, creating severe traffic hazard during peak freight transit.',
    'INFRASTRUCTURE_ROADS',
    'IN_PROGRESS',
    4.2, 4.0, 18, 1.8, 88.0,
    28.5355, 77.2410,
    'Maa Anandmayee Marg, Kalkaji Ward 24, New Delhi'
),
(
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000101',
    'Toxic Industrial Waste Runoff in Open Storm Drain',
    'Uncontrolled chemical effluent discharge releasing dark ammonia slurry directly into residential drain.',
    'ENVIRONMENT_WASTE',
    'ADOPTED',
    4.9, 4.7, 31, 3.2, 96.0,
    28.5284, 77.2796,
    'Okhla Industrial Area Phase 1, Drain 4, New Delhi'
),
(
    '00000000-0000-0000-0000-000000000204',
    '00000000-0000-0000-0000-000000000101',
    'High-Tension Power Cable Sagging Near Residential School',
    'Low-hanging 11kV electrical feeder wire dangerously close to school pedestrian walkway.',
    'ENERGY_POWER',
    'VERIFIED',
    4.7, 4.5, 15, 1.0, 89.2,
    28.7041, 77.1025,
    'Sector 7, Near DAV Public School, Rohini, Delhi'
),
(
    '00000000-0000-0000-0000-000000000205',
    '00000000-0000-0000-0000-000000000101',
    'Primary Health Center Cold Chain Failure',
    'Frequent voltage drops compromising temperature-sensitive vaccine storage and essential diabetes insulin supplies.',
    'HEALTHCARE',
    'IN_PROGRESS',
    4.6, 4.4, 22, 2.0, 91.0,
    28.6692, 77.1950,
    'Civil Lines Urban Health Centre, Rajpur Road, Delhi'
),
(
    '00000000-0000-0000-0000-000000000206',
    '00000000-0000-0000-0000-000000000101',
    'Agricultural Canal Silt Choking & Tail-End Drought',
    'Canal tributary silted heavily with weeds, starving 40+ smallholding farms of seasonal irrigation.',
    'AGRICULTURE',
    'ADOPTED',
    3.8, 3.5, 12, 4.5, 79.5,
    28.8245, 77.0850,
    'Alipur - Narela Rural Irrigation Canal, Delhi'
),
(
    '00000000-0000-0000-0000-000000000207',
    '00000000-0000-0000-0000-000000000101',
    'Broken Streetlight Corridor & Dark Spot Near Metro Station',
    'Cluster of 8 non-functional LED street poles creating safety vulnerability for evening commuters.',
    'PUBLIC_SAFETY',
    'RESOLVED',
    3.9, 4.1, 28, 0.8, 82.5,
    28.6270, 77.0780,
    'Janakpuri West Metro Gate 2 Footover Corridor, Delhi'
),
(
    '00000000-0000-0000-0000-000000000208',
    '00000000-0000-0000-0000-000000000101',
    'Decaying Organic Market Waste Blockage in Drainage',
    'Rotting vegetable and organic matter clogging central culvert, generating noxious fumes and localized waterlogging.',
    'ENVIRONMENT_WASTE',
    'PROTOTYPE_REVIEW',
    4.3, 4.2, 19, 2.2, 87.5,
    28.6280, 77.3200,
    'Ghazipur Mandi Wholesale Waste Yard, East Delhi'
),
(
    '00000000-0000-0000-0000-000000000209',
    '00000000-0000-0000-0000-000000000101',
    'Govt School Drinking Water Filtration Plant Contamination',
    'School RO filtration membrane damaged with elevated total dissolved solids (TDS > 900 ppm) detected.',
    'EDUCATION',
    'DEPLOYMENT_STAGING',
    4.5, 4.6, 26, 1.2, 92.0,
    28.6500, 77.2300,
    'Govt Boys Sr Sec School, Daryaganj, Old Delhi'
),
(
    '00000000-0000-0000-0000-000000000210',
    '00000000-0000-0000-0000-000000000101',
    'Unmonitored Industrial Borewell Groundwater Depletion',
    'Excessive illegal groundwater extraction causing rapid water table collapse and saline ingress in surrounding wells.',
    'WATER_SANITATION',
    'VERIFIED',
    4.1, 3.8, 14, 3.0, 84.0,
    28.5800, 77.3300,
    'Mayur Vihar Extension Border Zone, Delhi'
)
ON CONFLICT ("id") DO NOTHING;

