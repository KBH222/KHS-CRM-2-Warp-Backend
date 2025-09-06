-- Setup script for local PostgreSQL on Windows
-- This will be run with the postgres superuser

-- Create user for KHS CRM
CREATE USER khs_user WITH PASSWORD 'khs_dev_password';

-- Create database
CREATE DATABASE khs_crm OWNER khs_user;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE khs_crm TO khs_user;