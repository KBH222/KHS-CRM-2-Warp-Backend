-- Insert test users with bcrypt hashed passwords
-- Password for both users is: password123
-- Hash: $2a$10$YourHashHere (we'll use a pre-generated hash)

-- Insert owner user
INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'owner@khs.com',
    '$2a$10$rBYRlCkPIqJVvPlfwC4ZKONHqNwZNTHjL2JH5YalpxFYbKiZSLp7e', -- password123
    'John Owner',
    'OWNER',
    true,
    NOW(),
    NOW()
);

-- Insert worker user
INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'worker@khs.com',
    '$2a$10$rBYRlCkPIqJVvPlfwC4ZKONHqNwZNTHjL2JH5YalpxFYbKiZSLp7e', -- password123
    'Jane Worker',
    'WORKER',
    true,
    NOW(),
    NOW()
);

-- Insert test customers
INSERT INTO "Customer" (id, name, email, phone, address, notes, "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Sarah Johnson', 'sarah.johnson@email.com', '(555) 123-4567', '123 Main St, Springfield, IL 62701', 'Prefers morning appointments', NOW(), NOW()),
    (gen_random_uuid(), 'Mike Davis', 'mike.davis@email.com', '(555) 234-5678', '456 Oak Ave, Springfield, IL 62702', 'Has two dogs', NOW(), NOW()),
    (gen_random_uuid(), 'Robert Brown', 'robert.brown@email.com', '(555) 345-6789', '789 Pine Rd, Springfield, IL 62703', 'Commercial property owner', NOW(), NOW());

-- Get customer IDs for jobs
DO $$
DECLARE
    customer1_id UUID;
    customer2_id UUID;
    worker_id UUID;
    job1_id UUID;
BEGIN
    -- Get customer IDs
    SELECT id INTO customer1_id FROM "Customer" WHERE email = 'sarah.johnson@email.com';
    SELECT id INTO customer2_id FROM "Customer" WHERE email = 'mike.davis@email.com';
    SELECT id INTO worker_id FROM "User" WHERE email = 'worker@khs.com';
    
    -- Insert jobs
    INSERT INTO "Job" (id, title, description, "customerId", status, priority, "startDate", "endDate", "estimatedCost", "actualCost", notes, "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid(),
        'Kitchen Remodel',
        'Complete kitchen renovation including cabinets, countertops, and appliances',
        customer1_id,
        'IN_PROGRESS',
        'HIGH',
        '2024-12-01',
        '2024-12-15',
        15000,
        0,
        'Customer wants modern farmhouse style',
        NOW(),
        NOW()
    ) RETURNING id INTO job1_id;
    
    INSERT INTO "Job" (id, title, description, "customerId", status, priority, "startDate", "endDate", "estimatedCost", "actualCost", notes, "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid(),
        'Bathroom Renovation',
        'Master bathroom update with new tile, fixtures, and vanity',
        customer2_id,
        'QUOTED',
        'MEDIUM',
        '2024-12-20',
        '2025-01-05',
        8500,
        0,
        'Waiting for customer approval on tile selection',
        NOW(),
        NOW()
    );
    
    -- Assign worker to first job
    INSERT INTO "_JobWorkers" ("A", "B")
    VALUES (job1_id, worker_id);
    
    -- Add materials to first job
    INSERT INTO "Material" (id, "jobId", name, description, quantity, unit, "unitCost", "totalCost", status, supplier, "createdAt", "updatedAt")
    VALUES 
        (gen_random_uuid(), job1_id, 'Cabinet handles', 'Brushed nickel cabinet pulls', 12, 'each', 8.50, 102, 'ORDERED', 'Home Depot', NOW(), NOW()),
        (gen_random_uuid(), job1_id, 'Wood screws 2.5"', 'Stainless steel wood screws', 1, 'box', 12.99, 12.99, 'IN_STOCK', 'Lowes', NOW(), NOW());
END $$;