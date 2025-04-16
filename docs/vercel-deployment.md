# Vercel Deployment Guide

This document outlines the steps to deploy the Money Manager application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A PostgreSQL database (either from Vercel Storage, Neon, Supabase, or another provider)
3. Your project code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Set up a PostgreSQL Database

You'll need a PostgreSQL database for production. Options include:

- **Vercel Postgres**: Available directly from the Vercel dashboard
- **Neon**: [https://neon.tech](https://neon.tech)
- **Supabase**: [https://supabase.com](https://supabase.com)

After setting up your database, you'll need the connection string.

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Configure the project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Environment Variables

Add the following environment variables in the Vercel project settings:

```
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secure_random_string
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=your_secure_random_string
NEXTAUTH_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Run Database Migrations

After the initial deployment, you need to run the Prisma migrations:

1. From the Vercel dashboard, go to your project
2. Navigate to "Settings" > "Deployments" > "Functions"
3. Click "Run Command"
4. Run: `npx prisma migrate deploy`

### 6. Seed the Database (Optional)

If you want to seed your database with initial data:

1. From the Vercel dashboard, go to your project
2. Navigate to "Settings" > "Deployments" > "Functions"
3. Click "Run Command"
4. Run: `npm run seed`

## Troubleshooting

### Database Connection Issues

- Ensure your database connection string is correct
- Check that your database allows connections from Vercel's IP addresses
- Verify that the database user has the necessary permissions

### Build Failures

- Check the build logs for specific errors
- Ensure all dependencies are correctly listed in package.json
- Verify that your Next.js configuration is correct

### Runtime Errors

- Check the Function Logs in the Vercel dashboard
- Ensure all environment variables are correctly set
- Verify that your database schema matches what your code expects
