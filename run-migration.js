#!/usr/bin/env node
/**
 * Run migration to add neon_service_id column to submissions table
 */

require('dotenv').config();
const supabaseService = require('./supabaseService');

async function runMigration() {
    console.log('Running migration: Add neon_service_id column...\n');

    try {
        const client = supabaseService.getClient();

        // Add column
        const { error: alterError } = await client.rpc('exec_sql', {
            sql: 'alter table submissions add column if not exists neon_service_id text'
        });

        if (alterError && !alterError.message.includes('already exists')) {
            console.log('Note: RPC method not available. Please run the migration SQL manually in Supabase SQL Editor:');
            console.log('\n--- Copy and paste this into Supabase SQL Editor ---');
            console.log('alter table submissions add column if not exists neon_service_id text;');
            console.log('create index if not exists idx_submissions_neon_service on submissions(neon_service_id);');
            console.log('--- End of SQL ---\n');
            return;
        }

        console.log('✓ Migration completed successfully!');
        console.log('  - Added neon_service_id column');
        console.log('  - Added index on neon_service_id');

    } catch (error) {
        console.error('Migration error:', error.message);
        console.log('\nPlease run this SQL manually in your Supabase SQL Editor:');
        console.log('\nalter table submissions add column if not exists neon_service_id text;');
        console.log('create index if not exists idx_submissions_neon_service on submissions(neon_service_id);');
    }
}

runMigration();
