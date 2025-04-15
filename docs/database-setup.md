# Database Setup Guide

This guide explains how to set up and manage the PostgreSQL database for the Money Manager application using Docker and Prisma ORM.

## Prerequisites

- Docker and Docker Compose installed on your system
- Node.js and npm/pnpm installed

## Setting Up the Database

### 1. Start the PostgreSQL Container

The project includes a `docker-compose.yml` file that defines a PostgreSQL service. To start the database:

```bash
# From the project root directory
docker-compose up -d
```

This command starts a PostgreSQL 16 container with the following configuration:
- Port: 5432 (mapped to your local machine)
- Username: postgres
- Password: postgres
- Database name: money_manager

### 2. Configure Environment Variables

Copy the `.env.example` file to create a `.env` file:

```bash
cp .env.example .env
```

The default connection string in the `.env.example` file is already configured to connect to the Docker PostgreSQL instance:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/money_manager"
```

### 3. Initialize Prisma

```bash
# Install dependencies if you haven't already
npm install

# Generate Prisma client
npx prisma generate
```

### 4. Run Migrations

To create and apply database migrations:

```bash
# Create a migration
npx prisma migrate dev --name init

# Apply migrations to the database
npx prisma migrate deploy
```

## Database Management

### Prisma Studio

Prisma provides a GUI to view and edit your database. To launch Prisma Studio:

```bash
npx prisma studio
```

This will open a web interface at http://localhost:5555 where you can browse and modify your data.

### Database Reset

If you need to reset your database during development:

```bash
# Drop all tables and recreate them
npx prisma migrate reset
```

### Seeding Data

To seed your database with initial data:

```bash
# Run the seed script
npx prisma db seed
```

Make sure you have a seed script defined in your `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

## Docker Commands

### View Container Logs

```bash
docker-compose logs postgres
```

### Stop the Database

```bash
docker-compose down
```

### Stop and Remove Data

```bash
docker-compose down -v
```

This will remove the volumes, deleting all data.

## Connecting to the Database

### From Command Line

```bash
docker exec -it money-manager-postgres psql -U postgres -d money_manager
```

### Using a GUI Client

You can connect to the database using tools like pgAdmin, DBeaver, or TablePlus with these credentials:
- Host: localhost
- Port: 5432
- Username: postgres
- Password: postgres
- Database: money_manager

## Backup and Restore

### Create a Backup

```bash
docker exec -t money-manager-postgres pg_dump -U postgres money_manager > backup.sql
```

### Restore from Backup

```bash
cat backup.sql | docker exec -i money-manager-postgres psql -U postgres -d money_manager
```

## Troubleshooting

### Connection Issues

If you can't connect to the database:

1. Check if the container is running:
   ```bash
   docker-compose ps
   ```

2. Verify the port mapping:
   ```bash
   docker-compose port postgres 5432
   ```

3. Check container logs for errors:
   ```bash
   docker-compose logs postgres
   ```

### Prisma Issues

If you encounter Prisma-related errors:

1. Ensure your schema matches the database:
   ```bash
   npx prisma db pull
   ```

2. Regenerate the Prisma client:
   ```bash
   npx prisma generate
   ```

3. Validate your Prisma schema:
   ```bash
   npx prisma validate
   ```
