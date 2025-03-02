/**
 * This script migrates data from Drizzle PostgreSQL to Firestore
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/migrate-to-firestore.ts
 * 
 * Note: This script requires both Drizzle and Firestore to be configured.
 * It should be run before completely removing Drizzle from the application.
 */

// Import Drizzle directly to avoid conflicts with the new db export
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

// Import Firestore migration utilities
import { 
  migrateUser, 
  migrateGame, 
  migrateQuestion, 
  migrateSubmission, 
  migrateTopicCount 
} from '@/lib/firestore/data-migration';

// Set up Drizzle connection for migration only
const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/postgres";

const client = postgres(connectionString);
const drizzleDb = drizzle(client, { schema });

/**
 * Migrates all data from Drizzle to Firestore
 */
async function migrateAllData() {
  try {
    console.log('Starting migration from Drizzle to Firestore...');
    
    // Migrate users
    console.log('Migrating users...');
    const allUsers = await drizzleDb.query.users.findMany();
    for (const user of allUsers) {
      await migrateUser(user);
    }
    console.log(`Migrated ${allUsers.length} users.`);
    
    // Migrate games
    console.log('Migrating games...');
    const allGames = await drizzleDb.query.games.findMany();
    for (const game of allGames) {
      await migrateGame(game);
    }
    console.log(`Migrated ${allGames.length} games.`);
    
    // Migrate questions
    console.log('Migrating questions...');
    const allQuestions = await drizzleDb.query.questionsv2.findMany();
    for (const question of allQuestions) {
      await migrateQuestion(question);
    }
    console.log(`Migrated ${allQuestions.length} questions.`);
    
    // Migrate submissions
    console.log('Migrating submissions...');
    const allSubmissions = await drizzleDb.query.quizzSubmissions.findMany();
    
    for (const submission of allSubmissions) {
      // For each submission, we need to find the associated user
      if (submission.quizzId) {
        const game = await drizzleDb.query.games.findFirst({
          where: eq(schema.games.id, submission.quizzId.toString())
        });
        
        if (game && game.userId) {
          await migrateSubmission(submission, game.userId);
        } else {
          console.warn(`Could not find user for submission ${submission.id}`);
        }
      } else {
        console.warn(`Submission ${submission.id} has no quizzId`);
      }
    }
    console.log(`Migrated ${allSubmissions.length} submissions.`);
    
    // Migrate topic counts
    console.log('Migrating topic counts...');
    const allTopicCounts = await drizzleDb.query.topicCounts.findMany();
    for (const topicCount of allTopicCounts) {
      await migrateTopicCount(topicCount);
    }
    console.log(`Migrated ${allTopicCounts.length} topic counts.`);
    
    console.log('Migration completed successfully!');
    
    // Close the Postgres connection
    await client.end();
  } catch (error) {
    console.error('Error during migration:', error);
    // Make sure to close the connection even if there's an error
    await client.end();
  }
}

// Run the migration
migrateAllData(); 