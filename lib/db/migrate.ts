import { migrate } from 'drizzle-orm/neon-http/migrator'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

if (!process.env.DATABASE_URL) {
    throw new Error('DataBase url not set in .env.local')
}

async function runMigration() {
    try {
        const sql = neon(process.env.DATABASE_URL!)
        const db = drizzle(sql)

        await migrate(db, { migrationsFolder: './drizzle' })
        console.log("All migrations are successfully done")
    } catch (error) {
        console.log("Migrations are not completed")
        process.exit(1)
    }
}

runMigration()