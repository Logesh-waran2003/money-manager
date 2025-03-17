# Schema Update Workflow

This document outlines the steps to follow when updating the database schema in Money Manager.

## Step 1: Update Schema Definition

1. Modify the schema in `/db/schema.ts`
   - Add/modify tables
   - Add/modify columns
   - Update enums

Example:

```typescript
// Add new enum
export const newStatusEnum = pgEnum("status", [
  "active",
  "inactive",
  "pending",
]);

// Update existing table
export const accounts = pgTable("accounts", {
  // Existing columns...
  status: newStatusEnum("status").default("active"),
});
```

## Step 2: Update OpenAPI Schema

1. Open `/app/api/swagger/openapi.js`
2. Add/update corresponding schema definitions in the `components.schemas` section
3. Ensure all enums and field definitions match your database schema

Example:

```javascript
// Add new enum
Status: {
  type: "string",
  enum: ["active", "inactive", "pending"],
  description: "Account status",
},

// Update existing schema
Account: {
  type: "object",
  properties: {
    // Existing properties...
    status: {
      $ref: "#/components/schemas/Status",
      default: "active"
    },
  },
  required: ["name", "type", "balance"],
},
```

## Step 3: Generate Database Migration

1. Run the Drizzle migration generation command:

```bash
pnpm drizzle-kit generate:pg
```

2. Review the generated migration file in the `drizzle` directory

## Step 4: Apply the Migration

1. Apply the migration to your development database:

```bash
pnpm drizzle-kit migrate
```

2. If using a custom migration command, use that instead:

```bash
pnpm db:migrate
```

### Handling Enum Migration Issues

If you encounter PostgreSQL enum errors like "type already exists":

1. For existing databases, consider using manual SQL migrations for enum changes
2. See `handle-enum-migrations.md` for detailed solutions
3. For PostgreSQL enums, you may need to:
   - Write custom SQL that checks if the enum exists before creating
   - Use ALTER TYPE to add values to existing enums (requires custom SQL)
   - Consider using VARCHAR with check constraints as an alternative to enums

## Step 5: Update API Routes

1. Update API route handlers to handle new fields
2. Add JSDoc comments for Swagger documentation
3. Ensure validation logic is updated for new fields

## Step 6: Test Changes

1. Test that API routes work with the updated schema
2. Check the Swagger UI documentation at `/api-docs`
3. Verify that database operations work as expected

## Step 7: Commit and Push Changes

1. Commit all changes together:

```bash
git add db/schema.ts app/api/swagger/openapi.js drizzle/
git commit -m "Update schema with [describe your changes]"
git push
```

## Common Issues

1. **Swagger UI doesn't reflect schema changes**:

   - Check that you've restarted your dev server
   - Verify that field names match between schema.ts and openapi.js

2. **Migration errors**:

   - For non-nullable fields added to existing tables, make sure to provide a default value
   - For enum changes, you may need to create a new enum and migrate data
   - See `handle-enum-migrations.md` for handling enum-specific issues

3. **Type errors in code**:
   - Update your TypeScript types if you're using generated types from your schema
