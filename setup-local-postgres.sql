-- Setup script for local PostgreSQL on Windows
-- Run this after installing PostgreSQL locally

-- Create user (run as postgres superuser)
CREATE USER khs_user WITH PASSWORD 'khs_dev_password';

-- Create database
CREATE DATABASE khs_crm OWNER khs_user;

-- Connect to the khs_crm database before running the rest
-- \c khs_crm

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE khs_crm TO khs_user;
GRANT CREATE ON SCHEMA public TO khs_user;

-- Note: After running this script, you'll need to:
-- 1. Update backend/.env to use: DATABASE_URL="postgresql://khs_user:khs_dev_password@localhost:5432/khs_crm?schema=public"
-- 2. Run: npx prisma migrate deploy
-- 3. Run: npx prisma db seed