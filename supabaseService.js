const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/**
 * Supabase Service
 * Manages Supabase database client connection and configuration
 * Provides methods for database operations with proper server-side configuration
 */
class SupabaseService {
    /**
     * Initialize Supabase service
     * Checks configuration on instantiation
     */
    constructor() {
        this.supabase = null;
        this.configured = this.checkConfiguration();
    }

    /**
     * Check if required Supabase environment variables are configured
     * @returns {boolean} True if configured, false otherwise
     */
    checkConfiguration() {
        const hasUrl = !!process.env.SUPABASE_URL;
        const hasKey = !!process.env.SUPABASE_SERVICE_KEY;

        if (!hasUrl || !hasKey) {
            console.log('Supabase not configured - missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
            return false;
        }
        return true;
    }

    /**
     * Check if Supabase is properly configured
     * @returns {boolean} Configuration status
     */
    isConfigured() {
        return this.configured;
    }

    /**
     * Get Supabase client instance
     * Lazily initializes client with server-side configuration
     * @returns {import('@supabase/supabase-js').SupabaseClient} Configured Supabase client
     * @throws {Error} If Supabase is not configured
     */
    getClient() {
        if (!this.configured) {
            throw new Error('Supabase is not configured');
        }

        if (!this.supabase) {
            this.supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_KEY,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false
                    }
                }
            );
        }

        return this.supabase;
    }

    /**
     * Insert a new form submission into Supabase
     * @param {Object} data - Form submission data with Neon IDs
     * @returns {Promise<{success: boolean, data?: Object, error?: string}>} Result object
     */
    async insertSubmission(data) {
        if (!this.configured) {
            return { success: false, error: 'Supabase not configured' };
        }

        try {
            const client = this.getClient();

            // Map form data to database schema
            const submission = {
                submission_id: data.submissionId,
                neon_caregiver_id: data.neonCaregiverId || null,
                neon_social_worker_id: data.neonSocialWorkerId || null,

                // Request information
                request_type: data.requestType,
                relationship: data.relationship,

                // Caregiver information
                caregiver_first_name: data.caregiverFirstName,
                caregiver_last_name: data.caregiverLastName,
                caregiver_email: data.caregiverEmail || null,
                caregiver_phone: data.caregiverPhone || null,
                alternative_phone: data.alternativePhone || null,
                caregiver_street: data.caregiverStreet,
                caregiver_city: data.caregiverCity,
                caregiver_state: data.caregiverState,
                caregiver_zip: data.caregiverZip,
                caregiver_county: data.caregiverCounty,

                // Social worker information
                social_worker_first_name: data.socialWorkerFirstName,
                social_worker_last_name: data.socialWorkerLastName,
                social_worker_email: data.socialWorkerEmail,
                social_worker_phone: data.socialWorkerPhone || null,
                alternative_social_worker_phone: data.alternativeSocialWorkerPhone || null,
                social_worker_county: data.socialWorkerCounty,

                // Child information
                child_first_name: data.childFirstName,
                child_last_initial: data.childLastInitial,
                child_age: data.childAge,
                child_dob: data.childDOB,
                child_gender: data.childGender,
                child_ethnicity: data.childEthnicity,
                child_placement_type: data.childPlacementType,

                // Additional fields
                pickup_location: data.pickupLocation,
                completion_contact: data.completionContact,
                is_licensed_foster: data.isLicensedFoster,

                // Sync metadata
                sync_status: 'synced',
                last_synced_at: new Date().toISOString()
            };

            const { data: insertedData, error } = await client
                .from('submissions')
                .insert([submission])
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error:', error);
                return { success: false, error: error.message };
            }

            console.log('Successfully inserted to Supabase:', insertedData.id);
            return { success: true, data: insertedData };

        } catch (error) {
            console.error('Supabase insertSubmission error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new SupabaseService();
