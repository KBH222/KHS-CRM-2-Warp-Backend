-- Check existing users
SELECT COUNT(*) as user_count FROM "User";

-- Check existing customers  
SELECT COUNT(*) as customer_count FROM "Customer";

-- Insert simple job if we have users and customers
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
        INSERT INTO "JobAssignment" (id, "jobId", "userId", "assignedAt", "assignedBy")
        VALUES (
            gen_random_uuid()::text,
            job_id,
            worker_id,
            NOW(),
            owner_id
        );
        
        RAISE NOTICE 'Job created successfully';
    ELSE
        RAISE NOTICE 'Missing required users or customers';
    END IF;
END $$;

-- Check results
SELECT 'Users:' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Customers:', COUNT(*) FROM "Customer"
UNION ALL
SELECT 'Jobs:', COUNT(*) FROM "Job";