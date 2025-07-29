import * as dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config({ path: '.env.local' })

if (!process.env.DATAVASE_URL) {
    throw new Error('DB url not set in .env.local')
}

export default defineConfig({
    schema: './lib/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
    url: process.env.DATABASE_URL!,
    },
    migrations: {
        table: '__drizzle_migrations',
        schema: 'public'
    },
    verbose: true,
    strict: true,
});
