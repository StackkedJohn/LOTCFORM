#!/usr/bin/env node
/**
 * Verify Supabase data
 */

require('dotenv').config();
const supabaseService = require('./supabaseService');

async function verifyData() {
    console.log('Fetching latest submission from Supabase...\n');

    try {
        const client = supabaseService.getClient();
        const { data, error } = await client
            .from('submissions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error('Error fetching data:', error);
            return;
        }

        console.log('Latest Submission in Supabase:');
        console.log('='.repeat(60));
        console.log('UUID:', data.id);
        console.log('Submission ID:', data.submission_id);
        console.log('Created:', data.created_at);
        console.log('Updated:', data.updated_at);
        console.log('\nNeon IDs:');
        console.log('  Caregiver ID:', data.neon_caregiver_id);
        console.log('  Social Worker ID:', data.neon_social_worker_id);
        console.log('  Service ID:', data.neon_service_id || '(null)');
        console.log('\nCaregiver Info:');
        console.log('  Name:', data.caregiver_first_name, data.caregiver_last_name);
        console.log('  Email:', data.caregiver_email);
        console.log('  Phone:', data.caregiver_phone);
        console.log('  Address:', data.caregiver_street + ', ' + data.caregiver_city + ', ' + data.caregiver_state + ' ' + data.caregiver_zip);
        console.log('\nSocial Worker Info:');
        console.log('  Name:', data.social_worker_first_name, data.social_worker_last_name);
        console.log('  Email:', data.social_worker_email);
        console.log('  Phone:', data.social_worker_phone);
        console.log('\nChild Info:');
        console.log('  Name:', data.child_first_name, data.child_last_initial);
        console.log('  Age:', data.child_age);
        console.log('  Gender:', data.child_gender);
        console.log('  DOB:', data.child_dob);
        console.log('\nSync Status:', data.sync_status);
        console.log('Last Synced:', data.last_synced_at);
        console.log('='.repeat(60));
        console.log('\n✓ Data successfully stored in Supabase!');

    } catch (error) {
        console.error('Verification error:', error);
    }
}

verifyData();
