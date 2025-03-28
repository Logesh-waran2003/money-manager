# Deploying Money Manager to Vercel

This guide provides step-by-step instructions for deploying the Money Manager application to Vercel.

## Prerequisites

1. A GitHub account with your Money Manager repository
2. A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub account)

## Step 1: Prepare Your Repository

Ensure your repository includes:

- A `vercel.json` file (already added to the project)
- Environment variables properly configured
- Database connection optimized for serverless environment (already updated in `db/index.ts`)

## Step 2: Set Up Vercel Postgres

1. Log in to your Vercel account
2. Go to the Storage tab in your dashboard
3. Click "Create" and select "Postgres"
4. Follow the setup wizard to create a new Postgres database
5. Note the connection string provided by Vercel

## Step 3: Deploy to Vercel

1. From your Vercel dashboard, click "Add New..." > "Project"
2. Import your GitHub repository
3. Configure the project:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
   - Output Directory: `.next`
4. Add environment variables:
   - `DATABASE_URL`: Your Vercel Postgres connection string
   - `NODE_ENV`: `production`
5. Click "Deploy"

## Step 4: Run Database Migrations

After deployment, you need to run your database migrations:

1. Install Vercel CLI: `npm i -g vercel`
2. Log in to Vercel CLI: `vercel login`
3. Link your project: `vercel link`
4. Run migrations: `vercel --prod exec "pnpm db:push"`

## Step 5: Verify Deployment

1. Visit your deployed application at the Vercel-provided URL
2. Test key functionality to ensure everything works as expected
3. Check the Vercel logs if you encounter any issues

## Troubleshooting

- **Database Connection Issues**: Verify your `DATABASE_URL` environment variable is correctly set in Vercel
- **Build Failures**: Check the build logs in Vercel for specific errors
- **API Errors**: Check the Function logs in Vercel for runtime errors

## Continuous Deployment

Vercel automatically deploys your application when you push changes to your GitHub repository. To disable this behavior:

1. Go to your project settings in Vercel
2. Navigate to Git Integration
3. Disable "Auto Deploy"

## Custom Domain

To add a custom domain to your Vercel deployment:

1. Go to your project settings in Vercel
2. Navigate to Domains
3. Add your custom domain and follow the verification steps
