# Render Backend Setup Guide

## Environment Variables Required

You need to set these environment variables in your Render service:

### Required Variables

1. **DATABASE_URL**
   - Example: `postgresql://user:password@host:port/database?schema=public`
   - Get this from your PostgreSQL provider (e.g., Neon, Supabase, or local)

2. **FRONTEND_URL**
   - Set to your Vercel frontend URL
   - Example: `https://khs-crm.vercel.app`

3. **JWT_SECRET**
   - Generate a secure random string (at least 32 characters)
   - Example: `your-super-secret-jwt-key-change-this-in-production`

4. **JWT_REFRESH_SECRET**
   - Generate another secure random string (at least 32 characters)
   - Example: `your-super-secret-refresh-key-change-this-in-production`

### Optional Variables

- **PORT** - Render sets this automatically, don't override
- **NODE_ENV** - Set to `production`

## How to Set Environment Variables in Render

1. Go to your Render Dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add each variable one by one
5. Click "Save Changes"
6. Service will automatically redeploy

## Verify Deployment

After deployment, test these endpoints:

1. Health Check: `https://your-backend.onrender.com/`
   - Should return: `{"status":"ok","message":"KHS CRM Backend"}`

2. API Health: `https://your-backend.onrender.com/api/health`
   - Should return: `{"status":"ok","timestamp":"2025-01-15T..."}`

3. Customers API: `https://your-backend.onrender.com/api/customers`
   - Should return: `[]` or list of customers

## Troubleshooting

### All routes return 404
- Check build logs for errors
- Ensure `dist/` folder is committed
- Verify start command is `npm start`

### Database connection errors
- Double-check DATABASE_URL format
- Ensure database allows connections from Render
- Check if SSL is required (add `?sslmode=require` to DATABASE_URL)

### CORS errors
- Ensure FRONTEND_URL is set correctly
- Include protocol (https://) in FRONTEND_URL
- Don't include trailing slash