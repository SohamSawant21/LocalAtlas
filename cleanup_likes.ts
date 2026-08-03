import { config } from 'dotenv'
config({ path: '.env' })
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  console.log('Starting duplicate likes cleanup...')
  
  // Delete duplicates keeping the one with the smallest id
  const queries = [
    `DELETE FROM likes a USING likes b WHERE a.id > b.id AND a."userId" = b."userId" AND a."postId" = b."postId" AND a."postId" IS NOT NULL;`,
    `DELETE FROM likes a USING likes b WHERE a.id > b.id AND a."userId" = b."userId" AND a."locationId" = b."locationId" AND a."locationId" IS NOT NULL;`,
    `DELETE FROM likes a USING likes b WHERE a.id > b.id AND a."userId" = b."userId" AND a."commentId" = b."commentId" AND a."commentId" IS NOT NULL;`,
    `DELETE FROM likes a USING likes b WHERE a.id > b.id AND a."userId" = b."userId" AND a."storyId" = b."storyId" AND a."storyId" IS NOT NULL;`
  ]

  for (const query of queries) {
    const res = await pool.query(query)
    console.log(`Executed cleanup query: ${res.rowCount ?? 0} rows deleted.`)
  }

  console.log('Cleanup complete.')
  await pool.end()
}

main().catch(console.error)

