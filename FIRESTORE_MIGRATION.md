# Migrating from Drizzle to Firestore

This document outlines the process of migrating the Aquizi application from Drizzle (PostgreSQL) to Firestore.

## Migration Steps

1. **Set up Firestore Configuration**
   - Created `src/lib/firestore/firestore-config.ts` to define collections and field names
   - Created `src/lib/firestore/firestore-utils.ts` for common Firestore operations

2. **Update Database Actions**
   - Converted `getUserMetrics.ts` to use Firestore queries
   - Converted `getHeatMapData.ts` to use Firestore queries and timestamp handling
   - Converted `saveSubmissions.ts` to use Firestore document creation
   - Converted `userSubscriptions.ts` to use Firestore document operations

3. **Update Pages to Use Firestore**
   - Updated the dashboard page to pass user ID to Firestore functions
   - Updated the billing page to use Firestore subscription checks
   - Created Firebase-specific pages (firebase-dashboard, firebase-todos)

4. **Data Migration**
   - Created `src/lib/firestore/data-migration.ts` with migration functions
   - Created `src/scripts/migrate-data.ts` to transfer data from PostgreSQL to Firestore

## Running the Migration

To migrate your data from PostgreSQL to Firestore:

1. Make sure both PostgreSQL and Firebase are properly configured
2. Run the migration script:
   ```
   npx ts-node -r tsconfig-paths/register src/scripts/migrate-data.ts
   ```

## Post-Migration Tasks

After migrating the data:

1. Test all functionality to ensure it works with Firestore
2. Update any remaining components that might still be using Drizzle
3. Consider adding indexes to Firestore for frequently queried fields

## Data Structure

### Collections

- `users`: User profiles and authentication data
- `games`: Quiz game instances
- `questions`: Questions for each game
- `submissions`: User submissions for games
- `topic_counts`: Counts of topics for analytics

### Field Mappings

The field mappings from Drizzle to Firestore are defined in `src/lib/firestore/firestore-config.ts`.

## Troubleshooting

If you encounter issues during or after migration:

1. Check Firebase console for any errors or quota limits
2. Verify that all Firestore rules are properly set up
3. Ensure that all client components are properly using the Firestore hooks and functions

## Reverting (if necessary)

To revert back to PostgreSQL:

1. Restore the original `src/db/index.ts` file
2. Update all actions to use Drizzle again
3. Remove the Firestore-specific code 