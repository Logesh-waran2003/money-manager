# Handling PostgreSQL Enum Migration Issues

This document provides solutions for dealing with PostgreSQL enum migration errors like "type X already exists".

## Current Error

```
PostgresError: type "account_type" already exists
    at ErrorResponse (file:///home/logesh/Coding/TestGround/money/money-manager/node_modules/.pnpm/postgres@3.4.5/node_modules/postgres/src/connection.js:788:26)
```

This happens when Drizzle tries to create an enum type that already exists in the database.

## Option 1: Manual SQL Migration

1. Create a new migration file in your `drizzle` folder:

```bash
mkdir -p drizzle/custom-migrations
touch drizzle/custom-migrations/add-new-enums.sql
```

2. Add SQL that checks for existence before creating:

```sql
-- For category enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category') THEN
        CREATE TYPE category AS ENUM ('food', 'travel', 'shopping', 'other');
    END IF;
END$$;

-- For app_used enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_used') THEN
        CREATE TYPE app_used AS ENUM ('Gpay', 'Paytm', 'HDFC_App', 'PayZaap', 'Super', 'other');
    END IF;
END$$;

-- Add columns using the enums
ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS category category,
    ADD COLUMN IF NOT EXISTS app_used app_used;
```

3. Run this SQL migration manually:

```bash
psql <your-connection-string> -f drizzle/custom-migrations/add-new-enums.sql
```

4. Mark the migration as applied in the drizzle_migrations table:

```sql
INSERT INTO drizzle_migrations (id, hash, created_at)
VALUES ('add-new-enums.sql', 'manually-applied', NOW())
ON CONFLICT (id) DO NOTHING;
```

## Option 2: Drop and Recreate Schema (Development Only)

If you're in early development and can afford to reset your database:

1. Drop all tables and types:

```bash
psql <your-connection-string> -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

2. Run migrations from scratch:

```bash
pnpm drizzle-kit generate:pg
pnpm drizzle-kit migrate
```

## Option 3: Skip Current Migration

If you just need to move forward with development:

1. Manually mark the problematic migration as applied:

```bash
psql <your-connection-string> -c "INSERT INTO drizzle_migrations (id, hash, created_at) VALUES ('your-migration-id', 'manually-applied', NOW());"
```

2. Generate a new migration for future changes:

```bash
pnpm drizzle-kit generate:pg
```

## Updated Schema Update Workflow

### 1. For adding new enums:

```typescript
// Instead of this:
export const newEnum = pgEnum("new_enum", ["value1", "value2"]);

// Consider this pattern in schema.ts - define but don't create automatically
export const newEnumValues = ["value1", "value2"] as const;
// Then use the enum in your tables
export const myTable = pgTable("my_table", {
  status: varchar("status", { enum: newEnumValues }).notNull(),
});
```

### 2. For modifying existing enums:

PostgreSQL doesn't support direct ALTER TYPE to add enum values. You'll need:

- Create a new enum type with all values
- Convert existing columns to use the new type
- Drop the old type

This requires custom SQL migrations.

### 3. Document your enums:

Keep track of all enum types in a separate document to avoid conflicts.
