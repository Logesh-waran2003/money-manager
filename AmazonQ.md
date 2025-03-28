# Money Manager - Vercel Deployment Guide

This document provides a comprehensive guide for deploying the Money Manager application to Vercel.

## Preparation Steps Completed

1. **Database Connection Optimization**
   - Updated `db/index.ts` to use connection pooling optimized for serverless environments
   - Added connection timeout settings to prevent hanging connections

2. **Vercel Configuration**
   - Created `vercel.json` with appropriate build and install commands
   - Configured for Next.js framework

3. **Environment Variables**
   - Created `.env.example` as a template for required environment variables
   - Updated `.gitignore` to ensure `.env` is not committed to the repository

4. **Next.js Configuration**
   - Updated `next.config.ts` with performance optimizations
   - Enabled strict mode for better development experience

5. **Documentation**
   - Created detailed deployment guide in `docs/vercel_deployment.md`
   - Updated README.md with deployment instructions

## Deployment Steps

### 1. Set Up Vercel Postgres

Before deploying, you'll need a PostgreSQL database. Vercel offers a managed PostgreSQL service that integrates seamlessly with your application:

1. Log in to your Vercel account
2. Go to the Storage tab in your dashboard
3. Click "Create" and select "Postgres"
4. Follow the setup wizard to create a new Postgres database
5. Note the connection string provided by Vercel

### 2. Deploy to Vercel

1. Push your code to GitHub
2. From your Vercel dashboard, click "Add New..." > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
   - Output Directory: `.next`
5. Add environment variables:
   - `DATABASE_URL`: Your Vercel Postgres connection string
   - `NODE_ENV`: `production`
6. Click "Deploy"

### 3. Run Database Migrations

After deployment, you need to run your database migrations:

1. Install Vercel CLI: `npm i -g vercel`
2. Log in to Vercel CLI: `vercel login`
3. Link your project: `vercel link`
4. Run migrations: `vercel --prod exec "pnpm db:push"`

### 4. Verify Deployment

1. Visit your deployed application at the Vercel-provided URL
2. Test key functionality to ensure everything works as expected
3. Check the Vercel logs if you encounter any issues

## Post-Deployment Considerations

- **Monitoring**: Set up monitoring for your application using Vercel Analytics
- **Custom Domain**: Add a custom domain through Vercel's domain management
- **CI/CD**: Configure GitHub Actions for additional testing before deployment
- **Database Backups**: Set up regular backups for your Vercel Postgres database

## Troubleshooting

- **Database Connection Issues**: Verify your `DATABASE_URL` environment variable is correctly set in Vercel
- **Build Failures**: Check the build logs in Vercel for specific errors
- **API Errors**: Check the Function logs in Vercel for runtime errors
- **Performance Issues**: Consider using Edge Functions for improved performance
