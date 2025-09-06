-- Seed data for local PostgreSQL
-- Password for both users is: password123
-- Hash: $2a$10$rBYRlCkPIqJVvPlfwC4ZKONHqNwZNTHjL2JH5YalpxFYbKiZSLp7e

-- Insert test users
INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid()::text, 'owner@khs.com', '$2a$10$rBYRlCkPIqJVvPlfwC4ZKONHqNwZNTHjL2JH5YalpxFYbKiZSLp7e', 'John Owner', 'OWNER', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'worker@khs.com', '$2a$10$rBYRlCkPIqJVvPlfwC4ZKONHqNwZNTHjL2JH5YalpxFYbKiZSLp7e', 'Jane Worker', 'WORKER', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert test customers
INSERT INTO "Customer" (id, name, email, phone, address, notes, "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid()::text, 'Sarah Johnson', 'sarah.johnson@email.com', '(555) 123-4567', '123 Main St, Springfield, IL 62701', 'Prefers morning appointments', NOW(), NOW()),
    (gen_random_uuid()::text, 'Mike Davis', 'mike.davis@email.com', '(555) 234-5678', '456 Oak Ave, Springfield, IL 62702', 'Has two dogs', NOW(), NOW()),
    (gen_random_uuid()::text, 'Robert Brown', 'robert.brown@email.com', '(555) 345-6789', '789 Pine Rd, Springfield, IL 62703', 'Commercial property owner', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert a test job
DO $$
DECLARE
    customer_id TEXT;
    owner_id TEXT;
    worker_id TEXT;
    job_id TEXT;
BEGIN
    -- Get IDs
    SELECT id INTO customer_id FROM "Customer" WHERE email = 'sarah.johnson@email.com';
    SELECT id INTO owner_id FROM "User" WHERE email = 'owner@khs.com';
    SELECT id INTO worker_id FROM "User" WHERE email = 'worker@khs.com';
    
    IF customer_id IS NOT NULL AND owner_id IS NOT NULL THEN
        -- Insert job
        INSERT INTO "Job" (id, title, description, "customerId", "createdById", status, "startDate", "endDate", notes, "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid()::text,
            'Kitchen Remodel',
            'Complete kitchen renovation including cabinets, countertops, and appliances',
            customer_id,
            owner_id,
            'IN_PROGRESS',
            '2024-12-01',
            '2024-12-15',
            'Customer wants modern farmhouse style',
            NOW(),
            NOW()
        ) RETURNING id INTO job_id;
        
        -- Insert job assignment
        IF worker_id IS NOT NULL THEN
            INSERT INTO "JobAssignment" (id, "jobId", "userId", "assignedAt")
            VALUES (
                gen_random_uuid()::text,
                job_id,
                worker_id,
                NOW()
            );
        END IF;
        
        RAISE NOTICE 'Test data created successfully';
    END IF;
END $$;

-- Show summary
SELECT 'Users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Customers', COUNT(*) FROM "Customer"
UNION ALL
SELECT 'Jobs', COUNT(*) FROM "Job";